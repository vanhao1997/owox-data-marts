import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadGasClass } from '../../support/loadGasClass.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiReferenceDir = path.join(
  __dirname,
  '../../../src/Sources/FacebookPages/FacebookPagesAPIReference'
);

globalThis.DATA_TYPES = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  ARRAY: 'ARRAY',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  DATETIME: 'DATETIME',
  TIMESTAMP: 'TIMESTAMP',
};

globalThis.DateUtils = {
  formatDate: date => date.toISOString().slice(0, 10),
};

globalThis.AbstractSource = class AbstractSource {};

beforeAll(() => {
  loadGasClass(path.join(apiReferenceDir, 'page-insights-fields.js'));
  loadGasClass(path.join(__dirname, '../../../src/Sources/FacebookPages/ZZFacebookPagesFields.js'));
  loadGasClass(path.join(apiReferenceDir, 'FieldsSchema.js'));
  loadGasClass(path.join(__dirname, '../../../src/Sources/FacebookPages/Source.js'));
});

describe('Facebook Pages insights fields', () => {
  it('exposes only non-deprecated MVP Page metrics', () => {
    expect(globalThis.pageInsightsFields).toMatchObject({
      page_daily_follows: { type: 'INTEGER' },
      page_daily_follows_unique: { type: 'INTEGER' },
      page_daily_unfollows_unique: { type: 'INTEGER' },
      page_media_view: { type: 'INTEGER' },
      page_total_actions: { type: 'INTEGER' },
      page_total_media_view_unique: { type: 'INTEGER' },
    });
    expect(globalThis.pageInsightsFields.page_impressions_unique).toBeUndefined();
    expect(globalThis.pageInsightsFields.page_posts_impressions).toBeUndefined();
  });

  it('defines dedicated daily breakdown and lifetime post nodes', () => {
    expect(globalThis.FacebookPagesFieldsSchema.page_media_view_breakdown_daily).toMatchObject({
      uniqueKeys: ['page_id', 'date_start', 'date_stop', 'breakdown', 'dimension_value'],
      isTimeSeries: true,
    });
    expect(globalThis.FacebookPagesFieldsSchema.page_posts_insights_lifetime).toMatchObject({
      uniqueKeys: ['page_id', 'post_id'],
      isTimeSeries: false,
    });
    expect(globalThis.FacebookPagesFieldsSchema.page_insights_daily.defaultFields).toEqual([
      'page_id',
      'page_name',
      'date_start',
      'date_stop',
      'page_views_total',
      'page_post_engagements',
      'page_follows',
    ]);
  });

  it('sends the selected daily Page metrics to Meta', async () => {
    let capturedUrl = null;
    const proto = globalThis.FacebookPagesSource.prototype;
    const source = Object.assign(Object.create(proto), {
      fieldsSchema: globalThis.FacebookPagesFieldsSchema,
      BASE_URL: 'https://graph.facebook.com/v26.0',
      config: { PageName: { value: 'Fallback Page' } },
      _normalizePageId: pageId => pageId,
      _getManagedPage: async () => ({ accessToken: 'token', name: 'Managed Page' }),
      _fetchJson: async url => {
        capturedUrl = url;
        return { data: [] };
      },
    });

    await proto.fetchData.call(
      source,
      'page_insights_daily',
      '123456789',
      ['page_id', 'date_start', 'date_stop', 'page_media_view', 'page_total_media_view_unique'],
      new Date('2026-08-05T00:00:00Z')
    );

    expect(capturedUrl).toContain('metric=page_media_view%2Cpage_total_media_view_unique');
    expect(capturedUrl).toContain('period=day');
  });

  it('expands Page media-view breakdown objects into rows', async () => {
    const urls = [];
    const proto = globalThis.FacebookPagesSource.prototype;
    const source = Object.assign(Object.create(proto), {
      fieldsSchema: globalThis.FacebookPagesFieldsSchema,
      BASE_URL: 'https://graph.facebook.com/v26.0',
      config: {},
      _normalizePageId: pageId => pageId,
      _getManagedPage: async () => ({ accessToken: 'token' }),
      _fetchJson: async url => {
        urls.push(url);
        return {
          data: [
            {
              name: 'page_media_view',
              values: [{ end_time: '2026-08-06T00:00:00+0000', value: { paid: 4, organic: 6 } }],
            },
          ],
        };
      },
    });

    const rows = await proto.fetchData.call(
      source,
      'page_media_view_breakdown_daily',
      '123456789',
      ['page_id', 'date_start', 'date_stop', 'breakdown', 'dimension_value', 'metric_value'],
      new Date('2026-08-05T00:00:00Z')
    );

    expect(urls).toHaveLength(2);
    expect(urls[0]).toContain('breakdown=is_from_ads');
    expect(urls[1]).toContain('breakdown=is_from_followers');
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({ dimension_value: 'paid', metric_value: 4 });
  });

  it('fetches lifetime post metrics without a daily date bucket', async () => {
    const proto = globalThis.FacebookPagesSource.prototype;
    const source = Object.assign(Object.create(proto), {
      fieldsSchema: globalThis.FacebookPagesFieldsSchema,
      BASE_URL: 'https://graph.facebook.com/v26.0',
      config: {},
      _normalizePageId: pageId => pageId,
      _getManagedPage: async () => ({ accessToken: 'token' }),
      _fetchAllPages: async () => [
        { id: 'post-1', message: 'Hello', created_time: '2026-08-05T00:00:00+0000' },
      ],
      _fetchJson: async () => ({
        data: [
          { name: 'post_media_view', values: [{ value: 12 }] },
          { name: 'post_total_media_view_unique', values: [{ value: 9 }] },
        ],
      }),
    });

    const rows = await proto.fetchData.call(source, 'page_posts_insights_lifetime', '123456789', [
      'page_id',
      'post_id',
      'post_media_view',
      'post_total_media_view_unique',
      'fetched_at',
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      page_id: '123456789',
      post_id: 'post-1',
      post_media_view: 12,
      post_total_media_view_unique: 9,
    });
    expect(rows[0].date_start).toBeUndefined();
  });
});
