/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var FacebookPagesConnector = class FacebookPagesConnector extends AbstractConnector {
  constructor(config, source, storageName = 'GoogleBigQueryStorage', runConfig = null) {
    super(config, source, null, runConfig);
    this.storageName = storageName;
  }

  async startImportProcess() {
    const configuredPageIds = this.source.getConfiguredPageIds
      ? this.source.getConfiguredPageIds()
      : [String(this.config.PageID?.value || '').trim()];
    const dataSources = FormatUtils.parseFields(this.config.Fields.value);
    const entries = Object.entries(dataSources);

    for (const [nodeName] of entries) {
      if (!this.source.fieldsSchema[nodeName]) {
        throw new Error(`Unknown Facebook Pages node: ${nodeName}`);
      }
    }

    const catalogEntries = entries.filter(
      ([nodeName]) => !ConnectorUtils.isTimeSeriesNode(this.source.fieldsSchema[nodeName])
    );
    const timeSeriesEntries = entries.filter(([nodeName]) =>
      ConnectorUtils.isTimeSeriesNode(this.source.fieldsSchema[nodeName])
    );

    for (const [nodeName, fields = []] of catalogEntries) {
      for (const pageId of configuredPageIds) {
        this.config.logMessage(`Fetching ${nodeName} for a configured Facebook Page`);
        const data = await this.source.fetchData(nodeName, pageId, fields);
        if (data.length || this.config.CreateEmptyTables?.value) {
          const storage = await this.getStorageByNode(nodeName);
          await storage.saveData(data);
        }
      }
    }

    if (!timeSeriesEntries.length) return;

    const [startDate, daysToFetch] = this.getStartDateAndDaysToFetch();

    if (this.runConfig.type === RUN_CONFIG_TYPE.MANUAL_BACKFILL && daysToFetch > 730) {
      throw new Error('Facebook Page Insights backfill cannot exceed 730 days');
    }
    if (daysToFetch <= 0) return;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const latestCompleteDate = new Date(today);
    latestCompleteDate.setUTCDate(latestCompleteDate.getUTCDate() - 1);
    const requestedEndDate = new Date(startDate);
    requestedEndDate.setUTCDate(requestedEndDate.getUTCDate() + daysToFetch - 1);
    const effectiveEndDate =
      requestedEndDate < latestCompleteDate ? requestedEndDate : latestCompleteDate;
    const effectiveDays =
      Math.floor((effectiveEndDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    for (let day = 0; day < Math.max(0, effectiveDays); day += 1) {
      const currentDate = new Date(startDate);
      currentDate.setUTCDate(currentDate.getUTCDate() + day);

      for (const [nodeName, fields = []] of timeSeriesEntries) {
        for (const pageId of configuredPageIds) {
          this.config.logMessage(
            `Start importing ${nodeName} for ${DateUtils.formatDate(currentDate)} (Page Insights freshness is usually T+1 / approximately 24 hours)`
          );
          const data = await this.source.fetchData(nodeName, pageId, fields, currentDate);

          if (data.length || this.config.CreateEmptyTables?.value) {
            const storage = await this.getStorageByNode(nodeName);
            await storage.saveData(data);
          }

          this.config.logMessage(
            data.length
              ? `${data.length} records were fetched for ${nodeName}`
              : 'No records have been fetched; Meta Page Insights may still be within its T+1 / approximately 24-hour freshness window'
          );
        }
      }

      if (this.runConfig.type === RUN_CONFIG_TYPE.INCREMENTAL) {
        this.config.updateLastRequstedDate(currentDate);
      }
    }
  }

  async getStorageByNode(nodeName) {
    this.storages ??= {};

    if (!(nodeName in this.storages)) {
      const schema = this.source.fieldsSchema[nodeName];
      if (!schema?.uniqueKeys) {
        throw new Error(`Unique keys for '${nodeName}' are not defined in the fields schema`);
      }

      this.storages[nodeName] = new globalThis[this.storageName](
        this.config.mergeParameters({
          DestinationSheetName: { value: schema.destinationName },
          DestinationTableName: {
            value: this.getDestinationName(nodeName, this.config, schema.destinationName),
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
