import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadGasClass } from '../../support/loadGasClass.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const referenceDir = path.join(
  __dirname,
  '../../../src/Sources/FacebookMarketing/MarketingAPIReference'
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

beforeAll(() => {
  const baseFiles = fs
    .readdirSync(referenceDir)
    .filter(file => file.endsWith('.js') && file !== 'FieldsSchema.js' && !file.startsWith('ZZ'));
  baseFiles.forEach(file => loadGasClass(path.join(referenceDir, file)));
  loadGasClass(path.join(referenceDir, 'ZZFacebookMarketingFields.js'));
  loadGasClass(path.join(referenceDir, 'FieldsSchema.js'));
  globalThis.AbstractSource = class {};
  loadGasClass(path.join(__dirname, '../../../src/Sources/FacebookMarketing/Source.js'));
});

const standardFieldNames = [
  'adAccountInsightsFields',
  'adAccountInsightsFieldsByAdset',
  'adAccountInsightsFieldsByCampaign',
];

describe('Facebook Marketing insights fields', () => {
  it.each(standardFieldNames)('adds stable Meta v25 metrics to %s', fieldName => {
    const fields = globalThis[fieldName];
    expect(fields).toBeTruthy();
    expect(fields).toMatchObject({
      actions_per_impression: { type: 'NUMBER' },
      app_store_clicks: { type: 'NUMBER' },
      call_to_action_clicks: { type: 'NUMBER' },
      cost_per_total_action: { type: 'NUMBER' },
      landing_page_view_per_link_click: { type: 'NUMBER' },
      marketing_messages_delivered: { type: 'NUMBER' },
      purchase_per_landing_page_view: { type: 'NUMBER' },
      thumb_stops: { type: 'NUMBER' },
      total_actions: { type: 'NUMBER' },
      total_action_value: { type: 'NUMBER' },
      total_unique_actions: { type: 'NUMBER' },
      unique_impressions: { type: 'NUMBER' },
      video_6_sec_watched_actions: { type: 'ARRAY' },
      video_complete_watched_actions: { type: 'ARRAY' },
      video_completed_view_or_15s_passed_actions: { type: 'ARRAY' },
    });
  });

  it('does not add the MVP metrics to breakdown-only field maps', () => {
    expect(globalThis.adAccountInsightsFieldsByCountry.actions_per_impression).toBeUndefined();
    expect(
      globalThis.adAccountInsightsFieldsByPublisherPlatformAndPosition.total_actions
    ).toBeUndefined();
  });

  it('keeps existing default field selections unchanged', () => {
    const defaults = globalThis.FacebookMarketingFieldsSchema['ad-account/insights'].defaultFields;
    expect(defaults).toEqual([
      'account_id',
      'account_name',
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'ad_name',
      'impressions',
      'reach',
      'clicks',
      'spend',
      'cpc',
      'cpm',
      'ctr',
      'frequency',
      'actions',
      'action_values',
    ]);
  });

  it('casts numeric additions and preserves action arrays', () => {
    const proto = globalThis.FacebookMarketingSource.prototype;
    const record = {
      total_actions: '12',
      unique_impressions: '9.5',
      video_6_sec_watched_actions: [{ action_type: 'video_view', value: '3' }],
    };
    const result = proto.castRecordFields.call(
      { fieldsSchema: { insights: { fields: globalThis.adAccountInsightsFields } } },
      'insights',
      record
    );

    expect(result.total_actions).toBe(12);
    expect(result.unique_impressions).toBe(9.5);
    expect(result.video_6_sec_watched_actions).toEqual([{ action_type: 'video_view', value: '3' }]);
  });
});
