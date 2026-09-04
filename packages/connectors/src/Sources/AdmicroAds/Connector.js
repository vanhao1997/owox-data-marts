var AdmicroAdsConnector = class AdmicroAdsConnector extends AbstractConnector {
  constructor(config, source, storageName = 'GoogleBigQueryStorage', runConfig = null) {
    super(config, source, null, runConfig);
    this.storageName = storageName;
  }

  async startImportProcess() {
    const fields = AdmicroAdsHelper.parseFields(this.config.Fields.value);
    const nodes = Object.keys(fields).filter(node => this.source.fieldsSchema[node]);
    if (!nodes.length) throw new Error('Admicro Fields must select campaign or date fields');
    for (const nodeName of nodes) {
      fields[nodeName] = [
        ...new Set([...(this.source.fieldsSchema[nodeName].uniqueKeys || []), ...fields[nodeName]]),
      ];
    }
    const [startDate, daysToFetch] = this.getStartDateAndDaysToFetch();
    if (daysToFetch <= 0) return;
    for (let offset = 0; offset < daysToFetch; offset += 1) {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + offset);
      for (const nodeName of nodes) {
        await this.processDay({ nodeName, fields: fields[nodeName], date });
      }
      if (this.runConfig.type === RUN_CONFIG_TYPE.INCREMENTAL)
        this.config.updateLastRequstedDate(date);
    }
  }

  getStartDateAndDaysToFetch() {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const today = new Date(`${AdmicroAdsHelper.todayInTimezone()}T00:00:00.000Z`);
    let startDate;
    let endDate;

    if (this.runConfig.type === RUN_CONFIG_TYPE.MANUAL_BACKFILL) {
      if (!this.config.StartDate.value)
        throw new Error('StartDate is required for manual backfill');
      startDate = AdmicroAdsHelper.asUtcDate(this.config.StartDate.value);
      endDate = this.config.EndDate.value
        ? AdmicroAdsHelper.asUtcDate(this.config.EndDate.value)
        : today;
      if (endDate < startDate) {
        throw new Error(
          `EndDate (${AdmicroAdsHelper.formatDate(endDate)}) cannot be earlier than StartDate (${AdmicroAdsHelper.formatDate(startDate)})`
        );
      }
      if (startDate > today) {
        throw new Error(
          `StartDate (${AdmicroAdsHelper.formatDate(startDate)}) cannot be in the future`
        );
      }
      if (endDate > today) {
        this.config.logMessage(
          `Warning: EndDate (${AdmicroAdsHelper.formatDate(endDate)}) is in the future, adjusting to today`
        );
        endDate = today;
      }
    } else if (this.runConfig.type === RUN_CONFIG_TYPE.INCREMENTAL) {
      if (this.config.LastRequestedDate?.value) {
        const lastRequestedDate = AdmicroAdsHelper.asUtcDate(this.config.LastRequestedDate.value);
        startDate = new Date(
          lastRequestedDate.getTime() -
            Number(this.config.ReimportLookbackWindow.value || 0) * millisecondsPerDay
        );
      } else {
        startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
      }
      endDate = today;
    } else {
      throw new Error(`Unknown RunConfig type: ${this.runConfig.type}`);
    }

    const daysToFetch = Math.max(
      0,
      Math.floor((endDate.getTime() - startDate.getTime()) / millisecondsPerDay) + 1
    );
    return [startDate, daysToFetch];
  }

  async processDay({ nodeName, fields, date }) {
    const data = await this.source.fetchData({ nodeName, fields, date });
    this.config.logMessage(
      data.length
        ? `${data.length} rows of ${nodeName} were fetched for ${AdmicroAdsHelper.formatDate(date)}`
        : `No records have been fetched for ${nodeName}`
    );
    if (data.length || this.config.CreateEmptyTables?.value) {
      const prepared = data.length ? this.addMissingFieldsToData(data, fields) : data;
      const storage = await this.getStorageByNode(nodeName, fields);
      await storage.saveData(prepared);
    }
  }

  async getStorageByNode(nodeName, fields = []) {
    this.storages ||= {};
    if (!(nodeName in this.storages)) {
      const schema = this.source.fieldsSchema[nodeName];
      const scopedFields = [...new Set([...(schema.uniqueKeys || []), ...fields])];
      const storageConfig = Object.assign(
        Object.create(Object.getPrototypeOf(this.config)),
        this.config
      );
      this.storages[nodeName] = new globalThis[this.storageName](
        storageConfig.mergeParameters({
          DestinationSheetName: { value: schema.destinationName },
          DestinationTableName: {
            value: this.getDestinationName(nodeName, this.config, schema.destinationName),
          },
          Fields: {
            value: scopedFields.map(field => `${nodeName} ${field}`).join(', '),
          },
        }),
        schema.uniqueKeys,
        schema.fields,
        `${schema.description} ${schema.documentation}`
      );
      await this.storages[nodeName].init();
    }
    return this.storages[nodeName];
  }
};
