/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/* eslint-disable no-undef */
var FacebookPagesSource = class FacebookPagesSource extends AbstractSource {
  constructor(config) {
    super(
      config.mergeParameters({
        AuthType: {
          requiredType: 'object',
          label: 'Auth Type',
          description: 'Authentication type',
          isRequired: true,
          oneOf: [
            {
              label: 'OAuth2',
              value: 'oauth2',
              requiredType: 'object',
              attributes: [CONFIG_ATTRIBUTES.OAUTH_FLOW],
              oauthParams: {
                vars: {
                  AppId: {
                    type: 'string',
                    required: true,
                    store: 'env',
                    key: 'OAUTH_FACEBOOK_PAGES_APP_ID',
                    attributes: [
                      OAUTH_CONSTANTS.UI,
                      OAUTH_CONSTANTS.SECRET,
                      OAUTH_CONSTANTS.REQUIRED,
                    ],
                  },
                  AppSecret: {
                    type: 'string',
                    required: true,
                    store: 'env',
                    key: 'OAUTH_FACEBOOK_PAGES_APP_SECRET',
                    attributes: [OAUTH_CONSTANTS.SECRET, OAUTH_CONSTANTS.REQUIRED],
                  },
                  Scopes: {
                    type: 'string',
                    store: 'env',
                    key: 'OAUTH_FACEBOOK_PAGES_SCOPE',
                    default:
                      'pages_show_list,read_insights,pages_read_engagement,instagram_basic,instagram_manage_insights',
                    attributes: [OAUTH_CONSTANTS.UI],
                  },
                },
                mapping: {
                  AccessToken: {
                    type: 'string',
                    required: true,
                    store: 'secret',
                    key: 'accessToken',
                  },
                },
              },
              items: {
                AccessToken: {
                  isRequired: true,
                  requiredType: 'string',
                  label: 'Access Token',
                  description: 'Facebook user access token (auto-generated)',
                  attributes: [CONFIG_ATTRIBUTES.SECRET],
                },
                AppId: {
                  requiredType: 'string',
                  label: 'App ID',
                  description: 'Facebook App ID used for token exchange',
                },
                AppSecret: {
                  requiredType: 'string',
                  label: 'App Secret',
                  description: 'Facebook App Secret used for token exchange',
                  attributes: [CONFIG_ATTRIBUTES.SECRET],
                },
              },
            },
            {
              label: 'Access Token',
              value: 'accessToken',
              requiredType: 'object',
              items: {
                AccessToken: {
                  isRequired: true,
                  requiredType: 'string',
                  label: 'Access Token',
                  description: 'Facebook user or Page access token',
                  attributes: [CONFIG_ATTRIBUTES.SECRET],
                },
                AppId: {
                  isRequired: true,
                  requiredType: 'string',
                  label: 'App ID',
                  description: 'Facebook App ID used for token validation',
                },
                AppSecret: {
                  isRequired: true,
                  requiredType: 'string',
                  label: 'App Secret',
                  description: 'Facebook App Secret used for token validation',
                  attributes: [CONFIG_ATTRIBUTES.SECRET],
                },
              },
            },
          ],
        },
        PageID: {
          isRequired: false,
          requiredType: 'string',
          label: 'Facebook Page ID (legacy)',
          description: 'Legacy single Page ID. Use Page IDs for new configurations.',
          attributes: [CONFIG_ATTRIBUTES.HIDE_IN_CONFIG_FORM, CONFIG_ATTRIBUTES.DEPRECATED],
        },
        PageIDs: {
          isRequired: true,
          requiredType: 'string',
          label: 'Page IDs',
          description: 'One or more managed Facebook Page IDs, comma or newline separated',
          placeholder: '123456789012345, 987654321098765',
        },
        PageName: {
          requiredType: 'string',
          label: 'Facebook Page Name',
          description: 'Cached Page name selected during OAuth authorization',
          attributes: [CONFIG_ATTRIBUTES.HIDE_IN_CONFIG_FORM],
        },
        ReimportLookbackWindow: {
          requiredType: 'number',
          isRequired: true,
          default: 2,
          label: 'Reimport Lookback Window',
          description: 'Number of days to look back when reimporting data',
          attributes: [CONFIG_ATTRIBUTES.ADVANCED],
        },
        CleanUpToKeepWindow: {
          requiredType: 'number',
          label: 'Clean Up To Keep Window',
          description: 'Number of days to keep data before cleaning up',
          attributes: [CONFIG_ATTRIBUTES.ADVANCED],
        },
        StartDate: {
          requiredType: 'date',
          label: 'Start Date',
          description: 'Start date for data import',
          attributes: [CONFIG_ATTRIBUTES.MANUAL_BACKFILL, CONFIG_ATTRIBUTES.HIDE_IN_CONFIG_FORM],
        },
        EndDate: {
          requiredType: 'date',
          label: 'End Date',
          description: 'End date for data import',
          attributes: [CONFIG_ATTRIBUTES.MANUAL_BACKFILL, CONFIG_ATTRIBUTES.HIDE_IN_CONFIG_FORM],
        },
        Fields: {
          isRequired: true,
          label: 'Fields',
          description: 'List of Page Insights fields to fetch',
        },
        CreateEmptyTables: {
          requiredType: 'boolean',
          default: true,
          label: 'Create Empty Tables',
          description: 'Create tables with all columns even if no data is returned from API',
          attributes: [CONFIG_ATTRIBUTES.ADVANCED],
        },
      })
    );

    this.fieldsSchema = FacebookPagesFieldsSchema;
    this.BASE_URL = 'https://graph.facebook.com/v26.0';
    this._managedPages = null;

    // Keep MVP configurations that stored a single PageID valid after multi-Page support.
    if (!this.config.PageIDs.value && this.config.PageID?.value) {
      this.config.PageIDs.value = this.config.PageID.value;
    }
  }

  async exchangeOauthCredentials(credentials, variables) {
    try {
      if (!credentials?.accessToken) {
        throw new OauthFlowException({ message: 'Facebook access token is missing' });
      }

      const debugData = await this._fetchOauthJson('https://graph.facebook.com/debug_token', {
        input_token: credentials.accessToken,
        access_token: `${variables.AppId}|${variables.AppSecret}`,
      });

      if (!debugData.data?.is_valid) {
        throw new OauthFlowException({
          message: 'Invalid Facebook access token',
          payload: debugData.data?.error,
        });
      }

      const longLivedData = await this._fetchOauthJson(`${this.BASE_URL}/oauth/access_token`, {
        grant_type: 'fb_exchange_token',
        client_id: variables.AppId,
        client_secret: variables.AppSecret,
        fb_exchange_token: credentials.accessToken,
      });

      if (!longLivedData.access_token) {
        throw new OauthFlowException({
          message: 'Missing access_token in Facebook exchange response',
        });
      }

      const userInfo = await this._fetchOauthJson(`${this.BASE_URL}/me`, {
        fields: 'id,name',
        access_token: longLivedData.access_token,
      });
      const pages = await this._fetchManagedPages(longLivedData.access_token);

      const expiresIn = longLivedData.expires_in ?? 60 * 60 * 24 * 60;
      return OauthCredentialsDto.builder()
        .withUser({ id: userInfo.id, name: userInfo.name })
        .withSecret({ accessToken: longLivedData.access_token })
        .withExpiresIn(expiresIn)
        .withAdditional({
          pages: pages.map(page => ({
            id: page.id,
            name: page.name,
            tasks: Array.isArray(page.tasks) ? page.tasks : [],
          })),
        })
        .build()
        .toObject();
    } catch (error) {
      if (error instanceof OauthFlowException) {
        throw error;
      }

      throw new OauthFlowException({
        message: 'Failed to exchange Facebook tokens for Page access',
        payload: error.message,
      });
    }
  }

  async refreshCredentials(configuration, credentials, variables) {
    const authTypeConfig = configuration.AuthType || {};
    const isOAuth2 = 'oauth2' in authTypeConfig;
    const isManual =
      authTypeConfig.value === 'accessToken' ||
      'accessToken' in authTypeConfig ||
      configuration.AccessToken;
    if (isManual) {
      const manual = authTypeConfig.items || authTypeConfig.accessToken || {};
      const accessToken =
        manual.AccessToken?.value ||
        manual.AccessToken ||
        configuration.AccessToken?.value ||
        configuration.AccessToken;
      const appId =
        manual.AppId?.value ||
        manual.AppId ||
        configuration.AppId?.value ||
        configuration.AppId ||
        variables?.AppId;
      const appSecret =
        manual.AppSecret?.value ||
        manual.AppSecret ||
        configuration.AppSecret?.value ||
        configuration.AppSecret ||
        variables?.AppSecret;
      if (!accessToken || !appId || !appSecret) return null;
      return this.exchangeOauthCredentials({ accessToken }, { AppId: appId, AppSecret: appSecret });
    }
    if (!isOAuth2) return null;

    const oauthConfig = authTypeConfig.oauth2 || {};
    const hasStoredCredential = Boolean(oauthConfig[OAUTH_SOURCE_CREDENTIALS_KEY]);
    if (!hasStoredCredential) {
      return null;
    }

    const expiresAt = Number(credentials?.expiresAt || 0);
    const refreshThreshold = Date.now() + 5 * 24 * 60 * 60 * 1000;
    if (expiresAt && expiresAt > refreshThreshold) {
      return null;
    }

    const accessToken = credentials?.accessToken || credentials?.secret?.accessToken;
    if (!accessToken) {
      return null;
    }

    return this.exchangeOauthCredentials({ accessToken }, variables);
  }

  async fetchData(nodeName, pageId, fields, startDate = null) {
    const schema = this.fieldsSchema[nodeName];
    if (!schema) throw new Error(`Unknown Facebook Pages node: ${nodeName}`);

    if (nodeName === 'page_profile') return this._fetchPageProfile(pageId, fields);

    const normalizedPageId = this._normalizePageId(pageId);
    const requestedFields = Array.isArray(fields) ? fields : [];
    const missingKeys = schema.uniqueKeys.filter(key => !requestedFields.includes(key));
    if (missingKeys.length > 0) {
      throw new Error(
        `Missing required unique fields for endpoint '${nodeName}'. Missing fields: ${missingKeys.join(', ')}`
      );
    }

    const unsupportedFields = requestedFields.filter(field => !schema.fields[field]);
    if (unsupportedFields.length > 0) {
      throw new Error(
        `Unsupported Facebook Page Insights field(s): ${unsupportedFields.join(', ')}`
      );
    }

    if (!startDate) {
      throw new Error('Facebook Pages daily insights requires a start date');
    }

    const page = await this._getManagedPage(normalizedPageId);
    const date = DateUtils.formatDate(startDate);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const publicParams = new URLSearchParams({
      period: 'day',
      since: date,
      until: DateUtils.formatDate(endDate),
    });
    if (nodeName === 'page_insights_daily') {
      const requestedMetrics = requestedFields.filter(metric =>
        ['page_views_total', 'page_post_engagements', 'page_follows'].includes(metric)
      );
      if (requestedMetrics.length === 0)
        throw new Error('At least one supported Page Insights metric must be selected');
      publicParams.set('metric', requestedMetrics.join(','));
      const result = await this._fetchJson(
        `${this.BASE_URL}/${normalizedPageId}/insights?${publicParams}`,
        page.accessToken
      );
      return this._transformInsights(result.data || [], {
        pageId: normalizedPageId,
        pageName: page.name || this.config.PageName?.value || null,
        requestedFields,
        fallbackDate: date,
      });
    }

    if (nodeName === 'page_audience_breakdown_daily') {
      return this._fetchAudienceBreakdown(
        normalizedPageId,
        page.accessToken,
        requestedFields,
        date,
        publicParams
      );
    }

    if (nodeName === 'page_posts_insights_daily') {
      return this._fetchContentInsights(
        'post',
        normalizedPageId,
        page.accessToken,
        requestedFields,
        date,
        publicParams
      );
    }

    if (nodeName === 'page_videos_insights_daily') {
      return this._fetchContentInsights(
        'video',
        normalizedPageId,
        page.accessToken,
        requestedFields,
        date,
        publicParams
      );
    }

    if (
      nodeName === 'instagram_account_insights_daily' ||
      nodeName === 'instagram_media_insights_daily'
    ) {
      return this._fetchInstagramInsights(
        nodeName,
        normalizedPageId,
        page.accessToken,
        requestedFields,
        date,
        publicParams
      );
    }

    throw new Error(`Facebook Pages node '${nodeName}' is not implemented`);
  }

  getConfiguredPageIds() {
    const configured = this.config.PageIDs?.value || this.config.PageID?.value || '';
    const raw = String(configured)
      .split(/[\s,;]+/)
      .map(value => value.trim())
      .filter(Boolean);
    const unique = [...new Set(raw)];
    if (!unique.length) throw new Error('At least one Facebook Page ID is required');
    return unique.map(pageId => this._normalizePageId(pageId));
  }

  async _fetchPageProfile(pageId, fields) {
    const normalizedPageId = this._normalizePageId(pageId);
    const page = await this._getManagedPage(normalizedPageId);
    const requestedFields = Array.isArray(fields) ? fields : [];
    const schema = this.fieldsSchema.page_profile;
    const missingKeys = schema.uniqueKeys.filter(key => !requestedFields.includes(key));
    if (missingKeys.length)
      throw new Error(
        `Missing required unique fields for endpoint 'page_profile'. Missing fields: ${missingKeys.join(', ')}`
      );
    const unsupported = requestedFields.filter(field => !schema.fields[field]);
    if (unsupported.length)
      throw new Error(`Unsupported Facebook Page profile field(s): ${unsupported.join(', ')}`);
    const result = await this._fetchJson(
      `${this.BASE_URL}/${normalizedPageId}?fields=id,name,category,fan_count,followers_count,link,about,instagram_business_account`,
      page.accessToken
    );
    const profile = result || {};
    const row = {
      page_id: normalizedPageId,
      page_name: profile.name || page.name || null,
      category: profile.category ?? null,
      fan_count: this._normalizeMetricValue(profile.fan_count),
      followers_count: this._normalizeMetricValue(profile.followers_count),
      link: profile.link ?? null,
      about: profile.about ?? null,
      instagram_business_account_id: profile.instagram_business_account?.id ?? null,
      fetched_at: new Date().toISOString(),
    };
    return [this._selectFields(row, requestedFields)];
  }

  async _fetchContentInsights(kind, pageId, accessToken, fields, date, publicParams) {
    const collection = kind === 'post' ? 'posts' : 'videos';
    const metadataFields =
      kind === 'post'
        ? 'id,message,created_time,permalink_url'
        : 'id,title,created_time,permalink_url';
    const listUrl = `${this.BASE_URL}/${pageId}/${collection}?fields=${metadataFields}&since=${date}&until=${publicParams.get('until')}&limit=100`;
    const items = await this._fetchAllPages(listUrl, accessToken);
    const metricMap =
      kind === 'post'
        ? {
            post_engaged_users: 'post_engaged_users',
            post_clicks: 'post_clicks',
            post_reactions: 'post_reactions_by_type_total',
          }
        : {
            total_video_views: 'total_video_views',
            total_video_10s_views: 'total_video_10s_views',
            total_video_30s_views: 'total_video_30s_views',
          };
    const metrics = Object.entries(metricMap).filter(([field]) => fields.includes(field));
    if (!metrics.length)
      throw new Error(`At least one supported ${kind} Insights metric must be selected`);
    const rows = [];
    for (const item of items) {
      const metricParam = metrics.map(([, apiName]) => apiName).join(',');
      const insight = await this._fetchJson(
        `${this.BASE_URL}/${item.id}/insights?metric=${metricParam}&period=day&since=${date}&until=${publicParams.get('until')}`,
        accessToken
      );
      const values = this._flattenMetricValues(insight.data || [], date);
      values.forEach(bucket => {
        const row =
          kind === 'post'
            ? {
                page_id: pageId,
                post_id: String(item.id),
                post_message: item.message ?? null,
                post_created_time: item.created_time ?? null,
                permalink_url: item.permalink_url ?? null,
              }
            : {
                page_id: pageId,
                video_id: String(item.id),
                video_title: item.title ?? null,
                video_created_time: item.created_time ?? null,
                permalink_url: item.permalink_url ?? null,
              };
        Object.assign(row, bucket.metrics, {
          date_start: bucket.dateStart,
          date_stop: this._getNextDate(bucket.dateStart),
        });
        rows.push(this._selectFields(row, fields));
      });
    }
    return rows;
  }

  async _fetchInstagramInsights(nodeName, pageId, accessToken, fields, date, publicParams) {
    const pageData = await this._fetchJson(
      `${this.BASE_URL}/${pageId}?fields=instagram_business_account`,
      accessToken
    );
    const instagramId = pageData.instagram_business_account?.id;
    if (!instagramId) return [];
    if (nodeName === 'instagram_account_insights_daily') {
      const account = await this._fetchJson(
        `${this.BASE_URL}/${instagramId}?fields=id,username`,
        accessToken
      );
      const metricNames = ['impressions', 'reach', 'profile_views', 'website_clicks'].filter(
        metric => fields.includes(metric)
      );
      if (!metricNames.length)
        throw new Error('At least one supported Instagram account metric must be selected');
      const result = await this._fetchJson(
        `${this.BASE_URL}/${instagramId}/insights?metric=${metricNames.join(',')}&period=day&since=${date}&until=${publicParams.get('until')}`,
        accessToken
      );
      return this._flattenMetricValues(result.data || [], date).map(bucket =>
        this._selectFields(
          {
            page_id: pageId,
            instagram_account_id: String(instagramId),
            instagram_username: account.username ?? null,
            ...bucket.metrics,
            date_start: bucket.dateStart,
            date_stop: this._getNextDate(bucket.dateStart),
          },
          fields
        )
      );
    }
    const media = await this._fetchAllPages(
      `${this.BASE_URL}/${instagramId}/media?fields=id,media_type,caption,timestamp&since=${date}&until=${publicParams.get('until')}&limit=100`,
      accessToken
    );
    const metricNames = ['impressions', 'reach', 'engagement', 'saves', 'comments', 'likes'].filter(
      metric => fields.includes(metric)
    );
    if (!metricNames.length)
      throw new Error('At least one supported Instagram media metric must be selected');
    const rows = [];
    for (const item of media) {
      const result = await this._fetchJson(
        `${this.BASE_URL}/${item.id}/insights?metric=${metricNames.join(',')}`,
        accessToken
      );
      this._flattenMetricValues(result.data || [], date).forEach(bucket =>
        rows.push(
          this._selectFields(
            {
              page_id: pageId,
              instagram_media_id: String(item.id),
              media_type: item.media_type ?? null,
              caption: item.caption ?? null,
              media_timestamp: item.timestamp ?? null,
              ...bucket.metrics,
              date_start: bucket.dateStart,
              date_stop: this._getNextDate(bucket.dateStart),
            },
            fields
          )
        )
      );
    }
    return rows;
  }

  async _fetchAudienceBreakdown(pageId, accessToken, fields, date, publicParams) {
    const metrics = [
      'page_follows_by_age_gender',
      'page_follows_by_country',
      'page_follows_by_city',
    ];
    const result = await this._fetchJson(
      `${this.BASE_URL}/${pageId}/insights?metric=${metrics.join(',')}&period=day&since=${date}&until=${publicParams.get('until')}`,
      accessToken
    );
    const rows = [];
    for (const metric of result.data || []) {
      for (const valueRow of metric.values || []) {
        const dateStart = this._getBucketDate(valueRow.end_time, date);
        const values =
          valueRow.value && typeof valueRow.value === 'object'
            ? valueRow.value
            : { total: valueRow.value };
        Object.entries(values).forEach(([dimensionValue, value]) =>
          rows.push(
            this._selectFields(
              {
                page_id: pageId,
                date_start: dateStart,
                date_stop: this._getNextDate(dateStart),
                breakdown: metric.name,
                dimension_value: dimensionValue,
                metric_value: this._normalizeMetricValue(value),
              },
              fields
            )
          )
        );
      }
    }
    return rows;
  }

  async _fetchAllPages(url, accessToken) {
    const rows = [];
    let nextUrl = url;
    while (nextUrl) {
      const result = await this._fetchJson(nextUrl, accessToken);
      if (Array.isArray(result.data)) rows.push(...result.data);
      nextUrl = result.paging?.next || null;
    }
    return rows;
  }

  _flattenMetricValues(metricRows, fallbackDate) {
    const byDate = new Map();
    metricRows.forEach(metricRow =>
      (metricRow.values || []).forEach(valueRow => {
        const dateStart = this._getBucketDate(valueRow.end_time, fallbackDate);
        const current = byDate.get(dateStart) || { dateStart, metrics: {} };
        current.metrics[metricRow.name] = this._normalizeMetricValue(valueRow.value);
        if (
          metricRow.name === 'post_reactions_by_type_total' &&
          valueRow.value &&
          typeof valueRow.value === 'object'
        ) {
          current.metrics.post_reactions = Object.values(valueRow.value).reduce(
            (total, value) => total + (Number(value) || 0),
            0
          );
        }
        byDate.set(dateStart, current);
      })
    );
    return Array.from(byDate.values());
  }

  _selectFields(row, fields) {
    return fields.reduce((result, field) => {
      result[field] = Object.prototype.hasOwnProperty.call(row, field) ? row[field] : null;
      return result;
    }, {});
  }

  isValidToRetry(error) {
    if (!error?.statusCode) {
      return true;
    }

    if (
      error.statusCode >= HTTP_STATUS.SERVER_ERROR_MIN ||
      error.statusCode === HTTP_STATUS.TOO_MANY_REQUESTS
    ) {
      return true;
    }

    const providerError = error.payload?.error;
    const code = Number(providerError?.code);
    return providerError?.is_transient === true || FACEBOOK_RETRYABLE_ERROR_CODES.includes(code);
  }

  async _fetchOauthJson(endpoint, params) {
    const url = new URL(endpoint);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));

    const response = await HttpUtils.fetch(url.toString(), { method: 'get' });
    const body = await response.getAsJson();
    if (response.getResponseCode() >= HTTP_STATUS.BAD_REQUEST || body.error) {
      throw new OauthFlowException({
        message:
          body.error?.message ||
          `Facebook OAuth request failed (HTTP ${response.getResponseCode()})`,
        statusCode: response.getResponseCode(),
        payload: body,
      });
    }
    return body;
  }

  async _fetchJson(url, accessToken = null) {
    const requestUrl = this._stripAccessToken(url);
    const response = await this.urlFetchWithRetry(
      requestUrl,
      accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
    );
    this._logUsageHeaders(response.getHeaders(), requestUrl);
    const body = await response.getAsJson();
    if (body.error) {
      const errorCode = Number(body.error.code);
      throw new HttpRequestException({
        message: body.error.message || 'Facebook API request failed',
        statusCode: FACEBOOK_RETRYABLE_ERROR_CODES.includes(errorCode)
          ? HTTP_STATUS.TOO_MANY_REQUESTS
          : HTTP_STATUS.BAD_REQUEST,
        payload: body,
      });
    }
    return body;
  }

  async _validateResponse(response) {
    const validated = await super._validateResponse(response);
    const body = await validated.getAsJson();
    if (body.error) {
      const errorCode = Number(body.error.code);
      throw new HttpRequestException({
        message: body.error.message || 'Facebook API request failed',
        statusCode: FACEBOOK_RETRYABLE_ERROR_CODES.includes(errorCode)
          ? HTTP_STATUS.TOO_MANY_REQUESTS
          : HTTP_STATUS.BAD_REQUEST,
        payload: body,
      });
    }
    return validated;
  }

  async _fetchManagedPages(accessToken = this._getUserAccessToken()) {
    if (!accessToken) {
      throw new Error('Facebook Pages OAuth credentials are not configured');
    }

    const pages = [];
    const publicParams = new URLSearchParams({
      fields: 'id,name,access_token,tasks',
      limit: '100',
    });
    let nextUrl = `${this.BASE_URL}/me/accounts?${publicParams}`;

    while (nextUrl) {
      const response = await this._fetchJson(nextUrl, accessToken);
      if (Array.isArray(response.data)) {
        pages.push(...response.data);
      }
      nextUrl = response.paging?.next || null;
    }

    return pages;
  }

  async _getManagedPage(pageId) {
    if (!this._managedPages) {
      try {
        this._managedPages = await this._fetchManagedPages();
        if (!this._managedPages.length && this._isManualAccessTokenAuth()) {
          throw new Error('No managed Pages returned for manual token');
        }
      } catch (error) {
        // Manual Facebook Ads-style setup can receive a Page token directly.
        // Validate that token against the selected Page without exposing it.
        if (!this._isManualAccessTokenAuth()) throw error;
        const accessToken = this._getUserAccessToken();
        const pageData = await this._fetchJson(
          `${this.BASE_URL}/${pageId}?fields=id,name,tasks`,
          accessToken
        );
        this._managedPages = [
          {
            id: pageData.id || pageId,
            name: pageData.name,
            tasks: Array.isArray(pageData.tasks) ? pageData.tasks : ['ANALYZE'],
            access_token: accessToken,
          },
        ];
      }
    }

    const page = this._managedPages.find(item => String(item.id) === pageId);
    if (!page) {
      throw new Error(`Facebook Page ${pageId} is not available to the authenticated user`);
    }

    const tasks = Array.isArray(page.tasks) ? page.tasks : [];
    if (!tasks.includes('ANALYZE')) {
      throw new Error(
        `Facebook Page ${pageId} does not grant the ANALYZE task required for insights`
      );
    }

    if (!page.access_token) {
      throw new Error(`Facebook Page ${pageId} access token is unavailable`);
    }

    return {
      id: pageId,
      name: page.name,
      accessToken: page.access_token,
    };
  }

  _getUserAccessToken() {
    return (
      this.config.AuthType?.items?.AccessToken?.value ||
      this.config.AuthType?.accessToken?.AccessToken?.value ||
      this.config.AccessToken?.value
    );
  }

  _isManualAccessTokenAuth() {
    const authType = this.config.AuthType || {};
    return authType.value === 'accessToken' || Boolean(this.config.AccessToken?.value);
  }

  _normalizePageId(pageId) {
    const normalized = String(pageId || '').trim();
    if (!/^\d+$/.test(normalized)) {
      throw new Error(`Invalid Facebook Page ID: ${pageId}`);
    }
    return normalized;
  }

  _transformInsights(metricRows, { pageId, pageName, requestedFields, fallbackDate }) {
    const byDate = new Map();
    const outputFields = new Set(requestedFields);

    metricRows.forEach(metricRow => {
      const metricName = metricRow.name;
      if (!outputFields.has(metricName)) {
        return;
      }

      (metricRow.values || []).forEach(valueRow => {
        const dateStart = this._getBucketDate(valueRow.end_time, fallbackDate);
        const dateStop = this._getNextDate(dateStart);
        const row = byDate.get(dateStart) || {
          page_id: pageId,
          page_name: pageName,
          date_start: dateStart,
          date_stop: dateStop,
        };
        row[metricName] = this._normalizeMetricValue(valueRow.value);
        byDate.set(dateStart, row);
      });
    });

    return Array.from(byDate.values()).map(row => {
      const result = {};
      requestedFields.forEach(field => {
        result[field] = Object.prototype.hasOwnProperty.call(row, field) ? row[field] : null;
      });
      return result;
    });
  }

  _getBucketDate(endTime, fallbackDate) {
    const datePart = typeof endTime === 'string' ? endTime.match(/^\d{4}-\d{2}-\d{2}/)?.[0] : null;
    if (!datePart) {
      return fallbackDate;
    }

    const end = new Date(`${datePart}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() - 1);
    return DateUtils.formatDate(end);
  }

  _getNextDate(dateValue) {
    const date = new Date(`${dateValue}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return DateUtils.formatDate(date);
  }

  _normalizeMetricValue(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return Number.isFinite(Number(value)) ? parseInt(value, 10) : null;
  }

  _redactAccessToken(url) {
    return String(url).replace(/([?&]access_token=)[^&]+/i, '$1[REDACTED]');
  }

  _stripAccessToken(url) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.delete('access_token');
      return parsed.toString();
    } catch {
      return this._redactAccessToken(url);
    }
  }

  _logUsageHeaders(headers, safeUrl) {
    const appUsage = headers?.['x-app-usage'];
    const pageUsage = headers?.['x-page-usage'];
    if (appUsage || pageUsage) {
      this.config.logMessage(
        `Facebook API usage for ${safeUrl}: app=${appUsage || 'n/a'}, page=${pageUsage || 'n/a'}`
      );
    }
  }
};

var FACEBOOK_RETRYABLE_ERROR_CODES = [
  2, 4, 17, 32, 99, 104, 613, 80000, 80001, 80002, 80003, 80004, 80005, 80006, 80008,
];
