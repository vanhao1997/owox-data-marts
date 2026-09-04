/**
 * Copyright (c) OWOX, Inc.
 *
 * Additional stable Page Insights fields. Loaded after page-insights-fields.js.
 */

Object.assign(pageInsightsFields, {
  page_daily_follows: {
    description: 'Daily Page follows returned by Meta.',
    type: DATA_TYPES.INTEGER,
  },
  page_daily_follows_unique: {
    description: 'Estimated unique Page follows for the selected day.',
    type: DATA_TYPES.INTEGER,
  },
  page_daily_unfollows_unique: {
    description: 'Estimated unique Page unfollows for the selected day.',
    type: DATA_TYPES.INTEGER,
  },
  page_media_view: {
    description: 'Number of times Page content was played or displayed.',
    type: DATA_TYPES.INTEGER,
  },
  page_total_actions: {
    description: 'Clicks on Page contact information and call-to-action buttons.',
    type: DATA_TYPES.INTEGER,
  },
  page_total_media_view_unique: {
    description: 'Total unique viewers of Page media.',
    type: DATA_TYPES.INTEGER,
  },
});
