/**
 * Copyright (c) OWOX, Inc.
 *
 * Additional stable Meta Marketing API v25 fields. This file is loaded after
 * the generated field maps and before FieldsSchema.js by the connector builder.
 */

var FACEBOOK_MARKETING_INSIGHTS_MVP_FIELDS = {
  actions_per_impression: {
    description: 'Total attributed actions divided by impressions.',
    type: DATA_TYPES.NUMBER,
  },
  app_store_clicks: {
    description: 'Clicks on links to an app store from the ad.',
    type: DATA_TYPES.NUMBER,
  },
  call_to_action_clicks: {
    description: 'Clicks on the call-to-action button in the ad.',
    type: DATA_TYPES.NUMBER,
  },
  cost_per_total_action: {
    description: 'Average cost of a relevant tracked action.',
    type: DATA_TYPES.NUMBER,
  },
  landing_page_view_per_link_click: {
    description: 'Landing page views divided by link clicks.',
    type: DATA_TYPES.NUMBER,
  },
  marketing_messages_delivered: {
    description: 'Marketing messages successfully delivered to customers.',
    type: DATA_TYPES.NUMBER,
  },
  purchase_per_landing_page_view: {
    description: 'Purchases divided by landing page views.',
    type: DATA_TYPES.NUMBER,
  },
  thumb_stops: {
    description: 'Number of times someone viewed the display ad attentively.',
    type: DATA_TYPES.NUMBER,
  },
  total_actions: {
    description: 'Total attributed actions, including engagement, clicks, and conversions.',
    type: DATA_TYPES.NUMBER,
  },
  total_action_value: {
    description: 'Total value attributed to all tracked actions.',
    type: DATA_TYPES.NUMBER,
  },
  total_unique_actions: {
    description: 'Estimated number of Accounts Center accounts that performed an attributed action.',
    type: DATA_TYPES.NUMBER,
  },
  unique_impressions: {
    description: 'Estimated number of Accounts Center accounts that saw the ad at least once.',
    type: DATA_TYPES.NUMBER,
  },
  video_6_sec_watched_actions: {
    description: 'Video views lasting at least six seconds.',
    type: DATA_TYPES.ARRAY,
  },
  video_complete_watched_actions: {
    description: 'Video views lasting at least thirty seconds or until the video ends.',
    type: DATA_TYPES.ARRAY,
  },
  video_completed_view_or_15s_passed_actions: {
    description: 'Video completions or views that passed fifteen seconds.',
    type: DATA_TYPES.ARRAY,
  },
};

[
  adAccountInsightsFields,
  adAccountInsightsFieldsByAdset,
  adAccountInsightsFieldsByCampaign,
].forEach(fields => Object.assign(fields, FACEBOOK_MARKETING_INSIGHTS_MVP_FIELDS));
