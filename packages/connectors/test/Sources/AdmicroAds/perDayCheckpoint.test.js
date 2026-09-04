import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadGasClass } from '../../support/loadGasClass.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

globalThis.DateUtils = { formatDate: date => date.toISOString().slice(0, 10) };
globalThis.RUN_CONFIG_TYPE = { INCREMENTAL: 'INCREMENTAL', MANUAL_BACKFILL: 'MANUAL_BACKFILL' };
loadGasClass(path.join(__dirname, '../../../src/Sources/AdmicroAds/Helper.js'));
loadGasClass(path.join(__dirname, '../../../src/Sources/AdmicroAds/Connector.js'), {
  AbstractConnector: class {},
});

const connectorProto = globalThis.AdmicroAdsConnector.prototype;

const buildConnector = ({
  nodes = { campaign: ['admicro_column_1'], date: ['admicro_column_2'] },
  runType = 'INCREMENTAL',
  startDate = new Date('2026-08-10T00:00:00Z'),
  daysToFetch = 2,
  fetchData = async () => [{ value: 1 }],
  saveData = async () => undefined,
} = {}) => {
  const cursorMovedTo = [];
  const fetched = [];
  const self = Object.create(connectorProto);
  self.runConfig = { type: runType };
  self.source = {
    fieldsSchema: {
      campaign: { uniqueKeys: ['day', 'campaign_id'] },
      date: { uniqueKeys: ['day'] },
    },
    fetchData: async params => {
      fetched.push({
        nodeName: params.nodeName,
        date: DateUtils.formatDate(params.date),
        fields: params.fields,
      });
      return fetchData(params);
    },
  };
  self.getStorageByNode = async () => ({ saveData });
  self.addMissingFieldsToData = (data, fields) =>
    data.map(row => ({ ...row, injectedFields: fields }));
  self.getStartDateAndDaysToFetch = () => [startDate, daysToFetch];
  self.config = {
    Fields: {
      value: Object.entries(nodes)
        .flatMap(([node, fields]) => fields.map(field => `${node} ${field}`))
        .join(', '),
    },
    CreateEmptyTables: { value: false },
    logMessage: () => {},
    updateLastRequstedDate: date => cursorMovedTo.push(DateUtils.formatDate(date)),
  };
  return { self, cursorMovedTo, fetched };
};

describe('AdmicroAds per-day checkpointing', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches every selected node before advancing the cursor', async () => {
    const { self, cursorMovedTo, fetched } = buildConnector();

    await connectorProto.startImportProcess.call(self);

    expect(fetched.map(item => `${item.date}/${item.nodeName}`)).toEqual([
      '2026-08-10/campaign',
      '2026-08-10/date',
      '2026-08-11/campaign',
      '2026-08-11/date',
    ]);
    expect(cursorMovedTo).toEqual(['2026-08-10', '2026-08-11']);
  });

  it('does not advance past a day when a later node fails', async () => {
    const { self, cursorMovedTo } = buildConnector({
      fetchData: async ({ nodeName, date }) => {
        if (nodeName === 'date' && DateUtils.formatDate(date) === '2026-08-11') {
          throw new Error('Admicro node failed');
        }
        return [{ value: 1 }];
      },
    });

    await expect(connectorProto.startImportProcess.call(self)).rejects.toThrow(
      'Admicro node failed'
    );
    expect(cursorMovedTo).toEqual(['2026-08-10']);
  });

  it('injects unique keys into each request and skips cursor updates for manual backfill', async () => {
    const { self, cursorMovedTo, fetched } = buildConnector({
      runType: 'MANUAL_BACKFILL',
      daysToFetch: 1,
    });

    await connectorProto.startImportProcess.call(self);

    expect(fetched[0].fields).toEqual(['day', 'campaign_id', 'admicro_column_1']);
    expect(fetched[1].fields).toEqual(['day', 'admicro_column_2']);
    expect(cursorMovedTo).toEqual([]);
  });

  it('includes the current Vietnam day near the UTC date boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-02T18:00:00.000Z'));
    const self = Object.create(connectorProto);
    self.runConfig = { type: 'INCREMENTAL' };
    self.config = {
      LastRequestedDate: { value: '2026-09-03' },
      ReimportLookbackWindow: { value: 0 },
    };

    const [startDate, daysToFetch] = connectorProto.getStartDateAndDaysToFetch.call(self);

    expect(DateUtils.formatDate(startDate)).toBe('2026-09-03');
    expect(daysToFetch).toBe(1);
  });

  it('scopes storage fields to the current node', async () => {
    let storageFields;
    globalThis.AdmicroTestStorage = class {
      constructor(config) {
        storageFields = config.Fields.value;
      }

      async init() {}
    };

    class TestConfig {
      constructor() {
        this.Fields = {
          value: 'campaign day, campaign campaign_id, date day, date date',
        };
      }

      mergeParameters(parameters) {
        Object.assign(this, parameters);
        return this;
      }
    }

    const self = Object.create(connectorProto);
    self.config = new TestConfig();
    self.storageName = 'AdmicroTestStorage';
    self.source = {
      fieldsSchema: {
        date: {
          destinationName: 'admicro_date',
          description: 'Date report.',
          documentation: 'https://example.test',
          uniqueKeys: ['day', 'platform', 'campaign_scope'],
          fields: { day: {}, date: {}, platform: {}, campaign_scope: {} },
        },
      },
    };
    self.getDestinationName = (_nodeName, _config, defaultName) => defaultName;

    await connectorProto.getStorageByNode.call(self, 'date', ['date']);

    expect(storageFields).toBe('date day, date platform, date campaign_scope, date date');
    expect(self.config.Fields.value).toContain('campaign campaign_id');
  });
});
