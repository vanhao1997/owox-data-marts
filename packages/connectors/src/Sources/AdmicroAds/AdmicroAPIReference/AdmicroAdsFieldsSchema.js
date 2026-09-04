const admicroColumnDescriptors = {
  1: { type: DATA_TYPES.INTEGER, sourceKey: 'displayclick', label: 'Click' },
  2: { type: DATA_TYPES.INTEGER, sourceKey: 'displayview', label: 'Impressions' },
  4: { type: DATA_TYPES.NUMBER, sourceKey: 'ctr', label: 'CTR' },
  5: { type: DATA_TYPES.NUMBER, sourceKey: 'money', label: 'Money' },
  8: { type: DATA_TYPES.INTEGER, sourceKey: 'click', label: 'Total click' },
  9: { type: DATA_TYPES.INTEGER, sourceKey: 'click', label: 'Total click' },
};

function admicroFields(ids) {
  const fields = {
    day: {
      type: DATA_TYPES.DATE,
      description: 'Report day in Asia/Ho_Chi_Minh.',
      GoogleBigQueryPartitioned: true,
    },
    platform: { type: DATA_TYPES.STRING, description: 'Admicro report platform.' },
    report_type: { type: DATA_TYPES.STRING, description: 'Admicro report type.' },
    campaign_scope: { type: DATA_TYPES.STRING, description: 'all or requested campaign ID.' },
    campaign_id: { type: DATA_TYPES.STRING, description: 'Campaign ID returned by Admicro.' },
    date: {
      type: DATA_TYPES.DATE,
      description: 'Date dimension returned by Admicro, when available.',
    },
  };
  for (const id of ids) {
    const descriptor = admicroColumnDescriptors[id];
    fields[`admicro_column_${id}`] = {
      type: descriptor?.type || DATA_TYPES.STRING,
      label: descriptor?.label,
      description: descriptor
        ? `Admicro source column ${id}, DATAVIEW key ${descriptor.sourceKey}. Value returned by Admicro.`
        : `Admicro source column ${id}. Provider type and key are not mapped.`,
    };
  }
  return fields;
}

const admicroCampaignFields = admicroFields(['1', '2', '4', '5', '8', '9']);
delete admicroCampaignFields.date;

const admicroDateFields = admicroFields(['1', '2', '4', '5', '8', '9']);
delete admicroDateFields.campaign_id;

var AdmicroAdsFieldsSchema = {
  campaign: {
    overview: 'Admicro campaign report',
    description: 'Daily Admicro campaign report with canonical dimensions and raw source columns.',
    documentation: 'https://digitalreport.p2pdigital.io.vn/',
    uniqueKeys: ['day', 'platform', 'campaign_id', 'campaign_scope'],
    defaultFields: [
      'day',
      'platform',
      'report_type',
      'campaign_scope',
      'campaign_id',
      'admicro_column_1',
      'admicro_column_8',
      'admicro_column_2',
      'admicro_column_4',
      'admicro_column_5',
    ],
    destinationName: 'admicro_campaign',
    isTimeSeries: true,
    fields: admicroCampaignFields,
  },
  date: {
    overview: 'Admicro date report',
    description: 'Daily Admicro date report with canonical dimensions and raw source columns.',
    documentation: 'https://digitalreport.p2pdigital.io.vn/',
    uniqueKeys: ['day', 'platform', 'campaign_scope'],
    defaultFields: [
      'day',
      'date',
      'platform',
      'report_type',
      'campaign_scope',
      'admicro_column_1',
      'admicro_column_8',
      'admicro_column_2',
      'admicro_column_4',
      'admicro_column_5',
    ],
    destinationName: 'admicro_date',
    isTimeSeries: true,
    fields: admicroDateFields,
  },
};
