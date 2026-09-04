import path from 'path';
import { fileURLToPath } from 'url';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadGasClass } from '../../support/loadGasClass.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadGasClass(
  path.join(
    __dirname,
    '../../../src/Sources/AdmicroAds/AdmicroAPIReference/AdmicroAdsFieldsSchema.js'
  ),
  { DATA_TYPES: { DATE: 'DATE', STRING: 'STRING' } }
);
loadGasClass(path.join(__dirname, '../../../src/Sources/AdmicroAds/Helper.js'), {
  ConnectorConfigurationException: class extends Error {},
});
loadGasClass(path.join(__dirname, '../../../src/Sources/AdmicroAds/Source.js'), {
  AbstractSource: class {},
});

const sourceProto = globalThis.AdmicroAdsSource.prototype;
const getExtractorUrl = globalThis.AdmicroAdsHelper.getExtractorUrl;

describe('AdmicroAds source behavior', () => {
  beforeEach(() => {
    globalThis.AsyncUtils = { delay: vi.fn().mockResolvedValue(undefined) };
    globalThis.AdmicroAdsHelper.getExtractorUrl = () => 'http://admicro-extractor/v1/extract';
    globalThis.AdmicroAdsHelper.signBody = () => ({ raw: '{}', headers: {} });
  });

  it('rejects extractor calls while the connector feature flag is disabled', () => {
    const previous = process.env.ADMICRO_EXTRACTOR_ENABLED;
    delete process.env.ADMICRO_EXTRACTOR_ENABLED;

    expect(() => getExtractorUrl('/v1/extract')).toThrow('Admicro extractor is disabled');

    if (previous === undefined) delete process.env.ADMICRO_EXTRACTOR_ENABLED;
    else process.env.ADMICRO_EXTRACTOR_ENABLED = previous;
  });

  it('uses the mobile column default when the untouched desktop default is configured', () => {
    const self = { config: { ColumnIDs: { value: '1,8,2,4,5' } } };
    expect(sourceProto._columnIds.call(self, 'mobile')).toEqual(['1', '9', '2', '4', '5']);
  });

  it('uses the Admicro timezone when choosing the preview day', () => {
    expect(
      globalThis.AdmicroAdsHelper.todayInTimezone(
        'Asia/Ho_Chi_Minh',
        new Date('2026-09-02T18:00:00.000Z')
      )
    ).toBe('2026-09-03');
  });

  it('keeps canonical date fields in the dynamic date schema', () => {
    const self = {
      fieldsSchema: {
        campaign: {
          fields: {
            day: {},
            platform: {},
            report_type: {},
            campaign_scope: {},
            campaign_id: {},
          },
        },
        date: {
          fields: {
            day: {},
            date: {},
            platform: {},
            report_type: {},
            campaign_scope: {},
          },
        },
      },
    };

    const schema = sourceProto._schemaWithFields.call(
      self,
      {
        campaign_id: {},
        admicro_column_1: {},
      },
      ['1']
    );

    expect(schema.date.fields).toHaveProperty('date');
    expect(schema.date.fields).not.toHaveProperty('campaign_id');
    expect(schema.date.fields).toHaveProperty('admicro_column_1');
    expect(schema.date.defaultFields).toContain('date');
  });

  it('selects mobile column 9 instead of desktop column 8 in the dynamic schema', () => {
    const self = { fieldsSchema: globalThis.AdmicroAdsFieldsSchema };

    const schema = sourceProto._schemaWithFields.call(
      self,
      {
        admicro_column_1: {},
        admicro_column_2: {},
        admicro_column_4: {},
        admicro_column_5: {},
        admicro_column_9: {},
      },
      ['1', '9', '2', '4', '5']
    );

    expect(schema.campaign.defaultFields).toContain('admicro_column_9');
    expect(schema.campaign.defaultFields).not.toContain('admicro_column_8');
    expect(schema.date.defaultFields).toContain('admicro_column_9');
    expect(schema.date.defaultFields).not.toContain('admicro_column_8');
  });

  it('does not share dynamic schema metadata between source instances', () => {
    globalThis.CONFIG_ATTRIBUTES = {
      SECRET: 'SECRET',
      ADVANCED: 'ADVANCED',
      MANUAL_BACKFILL: 'MANUAL_BACKFILL',
      HIDE_IN_CONFIG_FORM: 'HIDE_IN_CONFIG_FORM',
    };
    const configRange = { mergeParameters: vi.fn(() => ({})) };
    const first = new globalThis.AdmicroAdsSource(configRange);
    const second = new globalThis.AdmicroAdsSource(configRange);

    first._mergeResponseSchema({ admicro_column_1: { label: 'first' } }, 'campaign');

    expect(first.fieldsSchema.campaign.fields.admicro_column_1.label).toBe('first');
    expect(second.fieldsSchema.campaign.fields.admicro_column_1.label).toBe('Click');
  });

  it('retries transient failures and succeeds within the bounded attempt count', async () => {
    const responses = [
      { code: 503, body: { error: 'temporary' } },
      { code: 200, body: { rows: [] } },
    ];
    globalThis.HttpUtils = {
      fetch: vi.fn(async () => {
        const response = responses.shift();
        return {
          getResponseCode: () => response.code,
          getContentText: async () => JSON.stringify(response.body),
        };
      }),
    };
    const self = {
      config: { MaxFetchRetries: { value: 3 } },
      _isRetryable: sourceProto._isRetryable,
    };

    await expect(sourceProto._post.call(self, '/v1/extract', {})).resolves.toEqual({ rows: [] });
    expect(globalThis.HttpUtils.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry credential failures and marks them for user action', async () => {
    globalThis.HttpUtils = {
      fetch: vi.fn(async () => ({
        getResponseCode: () => 401,
        getContentText: async () => JSON.stringify({ error: 'invalid credentials' }),
      })),
    };
    const self = {
      config: { MaxFetchRetries: { value: 3 } },
      _isRetryable: sourceProto._isRetryable,
    };

    const error = await sourceProto._post.call(self, '/v1/extract', {}).catch(value => value);

    expect(error).toMatchObject({ statusCode: 401, isWarning: true });
    expect(globalThis.HttpUtils.fetch).toHaveBeenCalledTimes(1);
  });
});
