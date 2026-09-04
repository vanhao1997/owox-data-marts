var AdmicroAdsSource = class AdmicroAdsSource extends AbstractSource {
  constructor(configRange) {
    super(
      configRange.mergeParameters({
        Username: {
          isRequired: true,
          requiredType: 'string',
          label: 'Username',
          description: 'Admicro ADX username.',
          attributes: [CONFIG_ATTRIBUTES.SECRET],
        },
        Password: {
          isRequired: true,
          requiredType: 'string',
          label: 'Password',
          description: 'Admicro ADX password.',
          attributes: [CONFIG_ATTRIBUTES.SECRET],
        },
        BaseUrl: {
          requiredType: 'string',
          default: 'https://adx.admicro.vn',
          label: 'Base URL',
          description: 'Admicro ADX base URL.',
        },
        ReportPath: {
          requiredType: 'string',
          default: '/vn/report/result',
          label: 'Report Path',
          description: 'Admicro report result path.',
        },
        Platform: {
          requiredType: 'string',
          default: 'desktop',
          label: 'Platform',
          description: 'Admicro report platform.',
          options: ['desktop', 'mobile'],
        },
        CampaignIDs: {
          requiredType: 'string',
          default: '',
          label: 'Campaign IDs',
          description:
            'Optional campaign IDs separated by comma, semicolon, space, or newline. Empty means all permitted campaigns.',
        },
        ColumnIDs: {
          requiredType: 'string',
          default: '1,8,2,4,5',
          label: 'Column IDs',
          description:
            'Admicro source column IDs. Desktop default: 1,8,2,4,5; mobile default: 1,9,2,4,5.',
          attributes: [CONFIG_ATTRIBUTES.ADVANCED],
        },
        StartDate: {
          requiredType: 'date',
          label: 'Start Date',
          description: 'Manual backfill start date.',
          attributes: [CONFIG_ATTRIBUTES.MANUAL_BACKFILL, CONFIG_ATTRIBUTES.HIDE_IN_CONFIG_FORM],
        },
        EndDate: {
          requiredType: 'date',
          label: 'End Date',
          description: 'Manual backfill end date.',
          attributes: [CONFIG_ATTRIBUTES.MANUAL_BACKFILL, CONFIG_ATTRIBUTES.HIDE_IN_CONFIG_FORM],
        },
        Fields: {
          isRequired: true,
          requiredType: 'string',
          default:
            'campaign day, campaign platform, campaign report_type, campaign campaign_scope, campaign campaign_id, date day, date date, date platform, date report_type, date campaign_scope',
          label: 'Fields',
          description: 'Fields to fetch in the format node field, separated by commas.',
        },
        ReimportLookbackWindow: {
          requiredType: 'number',
          isRequired: true,
          default: 7,
          label: 'Reimport Lookback Window',
          description: 'Number of days to reimport on each incremental run.',
          attributes: [CONFIG_ATTRIBUTES.ADVANCED],
        },
        CreateEmptyTables: {
          requiredType: 'boolean',
          default: true,
          label: 'Create Empty Tables',
          description: 'Create tables when Admicro returns no rows.',
          attributes: [CONFIG_ATTRIBUTES.ADVANCED],
        },
      })
    );
    // Keep schema metadata isolated per source instance so dynamic preview
    // labels from one project cannot leak into another connector run.
    this.fieldsSchema = JSON.parse(JSON.stringify(AdmicroAdsFieldsSchema));
  }

  async fetchFieldsSchema(signal) {
    const platform = this.config.Platform?.value || 'desktop';
    const columnIds = this._columnIds(platform);
    const response = await this._post(
      '/v1/preview',
      {
        runId: 'preview',
        projectId: 'preview',
        dataMartId: 'preview',
        configId: 'preview',
        username: this.config.Username.value,
        password: this.config.Password.value,
        baseUrl: this.config.BaseUrl.value,
        reportPath: this.config.ReportPath.value,
        platform,
        reportType: 'campaign',
        startDate: this._previewDate(),
        endDate: this._previewDate(),
        columnIds,
        campaignIds: [],
        timezone: 'Asia/Ho_Chi_Minh',
      },
      signal
    );
    const fields = this._fieldsFromResponse(response.fields, columnIds);
    this.fieldsSchema = this._schemaWithFields(fields, columnIds);
    return this.fieldsSchema;
  }

  async fetchData({ nodeName, fields = [], date }) {
    if (!this.fieldsSchema[nodeName]) throw new Error(`Unknown Admicro node: ${nodeName}`);
    const platform = this.config.Platform?.value || 'desktop';
    const dateValue =
      date instanceof Date ? DateUtils.formatDate(date) : String(date || '').slice(0, 10);
    const campaignIds = AdmicroAdsHelper.parseIds(this.config.CampaignIDs?.value || '');
    const response = await this._post('/v1/extract', {
      runId: process.env.OW_RUN_ID || 'connector-run',
      projectId: process.env.OW_PROJECT_ID || 'unknown',
      dataMartId: process.env.OW_DATAMART_ID || 'unknown',
      configId:
        process.env.OW_CONFIG_ID || this.config.id?.value || this.config._id?.value || 'unknown',
      username: this.config.Username.value,
      password: this.config.Password.value,
      baseUrl: this.config.BaseUrl.value,
      reportPath: this.config.ReportPath.value,
      platform,
      reportType: nodeName,
      startDate: dateValue,
      endDate: dateValue,
      columnIds: this._columnIds(platform),
      campaignIds,
      timezone: 'Asia/Ho_Chi_Minh',
    });
    this._mergeResponseSchema(response.fields, nodeName);
    const requested = new Set(fields);
    return (response.rows || []).map(row => {
      const result = {};
      for (const field of requested) result[field] = row[field] ?? null;
      return result;
    });
  }

  async _post(path, body, signal) {
    const url = AdmicroAdsHelper.getExtractorUrl(path);
    const maxAttempts = Math.max(1, Number(this.config.MaxFetchRetries?.value || 3));
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      signal?.throwIfAborted();
      const signed = AdmicroAdsHelper.signBody(body, process.env.ADMICRO_EXTRACTOR_SHARED_SECRET);
      const requestSignal = signal || AbortSignal.timeout(120_000);
      try {
        const response = await HttpUtils.fetch(url, {
          method: 'POST',
          headers: signed.headers,
          body: signed.raw,
          signal: requestSignal,
          muteHttpExceptions: true,
        });
        const text = await response.getContentText();
        let payload;
        try {
          payload = JSON.parse(text);
        } catch {
          payload = { error: text };
        }
        if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) return payload;
        const error = new Error(
          payload.error || `Admicro extractor returned HTTP ${response.getResponseCode()}`
        );
        error.statusCode = response.getResponseCode();
        error.payload = payload;
        error.isWarning =
          [401, 403].includes(error.statusCode) &&
          /credential|login|password|authentication|unauthorized/i.test(error.message) &&
          !/extractor (signature|body hash|nonce|timestamp)/i.test(error.message);
        if (!this._isRetryable(error) || attempt === maxAttempts) throw error;
      } catch (error) {
        if (signal?.aborted || !this._isRetryable(error) || attempt === maxAttempts) throw error;
      }
      await AsyncUtils.delay(Math.min(2000, 250 * 2 ** (attempt - 1)));
    }
    throw new Error('Admicro extractor retry loop ended unexpectedly');
  }

  _isRetryable(error) {
    return !error?.statusCode || error.statusCode === 429 || error.statusCode >= 500;
  }

  _columnIds(platform) {
    const configured = AdmicroAdsHelper.parseIds(this.config.ColumnIDs?.value || '');
    if (platform === 'mobile' && configured.join(',') === '1,8,2,4,5')
      return ['1', '9', '2', '4', '5'];
    return configured.length ? configured : AdmicroAdsHelper.defaultColumnIds(platform);
  }

  _previewDate() {
    return AdmicroAdsHelper.todayInTimezone();
  }

  _fieldsFromResponse(responseFields, columnIds) {
    const fields = {};
    for (const [name, descriptor] of Object.entries(responseFields || {})) {
      fields[name] = {
        type: descriptor.type || DATA_TYPES.STRING,
        label: descriptor.label,
        description: descriptor.description || `Admicro field ${name}`,
      };
    }
    for (const id of columnIds)
      fields[`admicro_column_${id}`] ||= {
        type: DATA_TYPES.STRING,
        description: `Admicro source column ${id}.`,
      };
    return fields;
  }

  _schemaWithFields(fields, columnIds = []) {
    const base = {};
    for (const nodeName of ['campaign', 'date']) {
      const canonicalNames =
        nodeName === 'campaign'
          ? ['day', 'platform', 'report_type', 'campaign_scope', 'campaign_id']
          : ['day', 'date', 'platform', 'report_type', 'campaign_scope'];
      const canonicalFields = Object.fromEntries(
        canonicalNames.map(name => [name, this.fieldsSchema[nodeName].fields[name]])
      );
      base[nodeName] = {
        ...this.fieldsSchema[nodeName],
        fields: { ...canonicalFields, ...fields },
      };
      if (nodeName === 'date') delete base[nodeName].fields.campaign_id;
      const requestedRawFields = columnIds.map(id => `admicro_column_${id}`);
      base[nodeName].defaultFields = [...canonicalNames, ...requestedRawFields].filter(
        (name, index, list) => name in base[nodeName].fields && list.indexOf(name) === index
      );
    }
    return base;
  }

  _mergeResponseSchema(responseFields, nodeName) {
    if (!responseFields || !this.fieldsSchema[nodeName]) return;
    this.fieldsSchema[nodeName].fields = {
      ...this.fieldsSchema[nodeName].fields,
      ...responseFields,
    };
  }
};
