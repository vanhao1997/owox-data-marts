import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadGasClass } from '../../support/loadGasClass.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

globalThis.RUN_CONFIG_TYPE = {
  INCREMENTAL: 'INCREMENTAL',
  MANUAL_BACKFILL: 'MANUAL_BACKFILL',
};
globalThis.DateUtils = {
  formatDate: date => date.toISOString().slice(0, 10),
};
globalThis.FormatUtils = {
  parseFields: value => JSON.parse(value),
};
globalThis.ConnectorUtils = {
  isTimeSeriesNode: schema => schema?.isTimeSeries === true,
};
globalThis.AbstractConnector = class {
  constructor(config, source, _unused, runConfig) {
    this.config = config;
    this.source = source;
    this.runConfig = runConfig;
  }
};

beforeAll(() => {
  loadGasClass(path.join(__dirname, '../../../src/Sources/FacebookPages/Connector.js'));
});

const buildConnector = ({ fail = false } = {}) => {
  const yesterday = new Date();
  yesterday.setUTCHours(0, 0, 0, 0);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const fetches = [];
  const saves = [];
  const source = {
    fieldsSchema: {
      page_insights_daily: {
        isTimeSeries: true,
        uniqueKeys: ['page_id', 'date_start', 'date_stop'],
        fields: {},
      },
      page_media_view_breakdown_daily: {
        isTimeSeries: true,
        uniqueKeys: ['page_id', 'date_start', 'date_stop', 'breakdown', 'dimension_value'],
        fields: {},
      },
      page_posts_insights_lifetime: {
        isTimeSeries: false,
        uniqueKeys: ['page_id', 'post_id'],
        fields: {},
      },
    },
    getConfiguredPageIds: () => ['page-1', 'page-2'],
    fetchData: vi.fn(async (nodeName, pageId, fields, date) => {
      fetches.push({ nodeName, pageId, fields, date });
      if (fail && nodeName === 'page_media_view_breakdown_daily' && pageId === 'page-2') {
        throw new Error('provider failure');
      }
      return [];
    }),
  };
  const config = {
    Fields: {
      value: JSON.stringify({
        page_posts_insights_lifetime: ['page_id', 'post_id'],
        page_insights_daily: ['page_id', 'date_start', 'date_stop'],
        page_media_view_breakdown_daily: [
          'page_id',
          'date_start',
          'date_stop',
          'breakdown',
          'dimension_value',
        ],
      }),
    },
    CreateEmptyTables: { value: true },
    logMessage: vi.fn(),
    updateLastRequstedDate: vi.fn(),
  };
  const connector = new globalThis.FacebookPagesConnector(config, source, 'TestStorage', {
    type: RUN_CONFIG_TYPE.INCREMENTAL,
  });
  connector.getStartDateAndDaysToFetch = () => [yesterday, 1];
  connector.getStorageByNode = vi.fn(async () => ({ saveData: async data => saves.push(data) }));
  return { connector, source, config, fetches, saves, yesterday };
};

describe('Facebook Pages connector scheduling', () => {
  it('does not advance the cursor when a Page/node fails mid-day', async () => {
    const { connector, config } = buildConnector({ fail: true });

    await expect(connector.startImportProcess()).rejects.toThrow('provider failure');
    expect(config.updateLastRequstedDate).not.toHaveBeenCalled();
  });

  it('advances the cursor once after all configured nodes and Pages complete', async () => {
    const { connector, config, fetches, yesterday } = buildConnector();

    await connector.startImportProcess();

    expect(config.updateLastRequstedDate).toHaveBeenCalledTimes(1);
    expect(config.updateLastRequstedDate).toHaveBeenCalledWith(yesterday);
    expect(
      fetches.find(item => item.nodeName === 'page_posts_insights_lifetime').date
    ).toBeUndefined();
    expect(config.logMessage.mock.calls.flat().join(' ')).not.toContain('page-1');
  });
});
