/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var pageInsightsFields = {
  page_id: {
    description: 'The unique ID of the Facebook Page.',
    type: DATA_TYPES.STRING,
  },
  page_name: {
    description: 'The current name of the Facebook Page.',
    type: DATA_TYPES.STRING,
  },
  date_start: {
    description: 'Start date of the daily Page Insights bucket returned by Meta.',
    type: DATA_TYPES.DATE,
    GoogleBigQueryPartitioned: true,
  },
  date_stop: {
    description: 'End date of the daily Page Insights bucket returned by Meta.',
    type: DATA_TYPES.DATE,
  },
  page_views_total: {
    description: 'Total Page views returned by the Page Insights API for the day.',
    type: DATA_TYPES.INTEGER,
  },
  page_post_engagements: {
    description: 'Total engagements with Page posts returned by the Page Insights API for the day.',
    type: DATA_TYPES.INTEGER,
  },
  page_follows: {
    description: 'Page follows returned by the Page Insights API for the day.',
    type: DATA_TYPES.INTEGER,
  },
};

var pageProfileFields = {
  page_id: { description: 'The unique Facebook Page ID.', type: DATA_TYPES.STRING },
  page_name: { description: 'Current Facebook Page name.', type: DATA_TYPES.STRING },
  category: { description: 'Page category.', type: DATA_TYPES.STRING },
  fan_count: { description: 'Page fan count when supplied by Meta.', type: DATA_TYPES.INTEGER },
  followers_count: {
    description: 'Page follower count when supplied by Meta.',
    type: DATA_TYPES.INTEGER,
  },
  link: { description: 'Public Page URL.', type: DATA_TYPES.STRING },
  about: { description: 'Page about text.', type: DATA_TYPES.STRING },
  instagram_business_account_id: {
    description: 'Linked Instagram professional account ID.',
    type: DATA_TYPES.STRING,
  },
  fetched_at: {
    description: 'UTC timestamp when profile metadata was fetched.',
    type: DATA_TYPES.DATETIME,
  },
};

var pagePostInsightsFields = {
  page_id: { description: 'Facebook Page ID.', type: DATA_TYPES.STRING },
  post_id: { description: 'Facebook post ID.', type: DATA_TYPES.STRING },
  post_message: { description: 'Post message, when available.', type: DATA_TYPES.STRING },
  post_created_time: { description: 'Post creation timestamp.', type: DATA_TYPES.DATETIME },
  permalink_url: { description: 'Public post URL.', type: DATA_TYPES.STRING },
  date_start: {
    description: 'Daily insight bucket start.',
    type: DATA_TYPES.DATE,
    GoogleBigQueryPartitioned: true,
  },
  date_stop: { description: 'Daily insight bucket end.', type: DATA_TYPES.DATE },
  post_engaged_users: {
    description: 'People who engaged with the post.',
    type: DATA_TYPES.INTEGER,
  },
  post_clicks: { description: 'Post clicks.', type: DATA_TYPES.INTEGER },
  post_reactions: { description: 'Post reactions.', type: DATA_TYPES.INTEGER },
};

var pageVideoInsightsFields = {
  page_id: { description: 'Facebook Page ID.', type: DATA_TYPES.STRING },
  video_id: { description: 'Facebook video ID.', type: DATA_TYPES.STRING },
  video_title: { description: 'Video title.', type: DATA_TYPES.STRING },
  video_created_time: { description: 'Video creation timestamp.', type: DATA_TYPES.DATETIME },
  permalink_url: { description: 'Public video URL.', type: DATA_TYPES.STRING },
  date_start: {
    description: 'Daily insight bucket start.',
    type: DATA_TYPES.DATE,
    GoogleBigQueryPartitioned: true,
  },
  date_stop: { description: 'Daily insight bucket end.', type: DATA_TYPES.DATE },
  total_video_views: { description: 'Total video views.', type: DATA_TYPES.INTEGER },
  total_video_10s_views: {
    description: 'Video views reaching ten seconds.',
    type: DATA_TYPES.INTEGER,
  },
  total_video_30s_views: {
    description: 'Video views reaching thirty seconds.',
    type: DATA_TYPES.INTEGER,
  },
};

var instagramAccountInsightsFields = {
  page_id: {
    description: 'Facebook Page ID owning the Instagram account.',
    type: DATA_TYPES.STRING,
  },
  instagram_account_id: {
    description: 'Instagram professional account ID.',
    type: DATA_TYPES.STRING,
  },
  instagram_username: { description: 'Instagram username.', type: DATA_TYPES.STRING },
  date_start: {
    description: 'Daily insight bucket start.',
    type: DATA_TYPES.DATE,
    GoogleBigQueryPartitioned: true,
  },
  date_stop: { description: 'Daily insight bucket end.', type: DATA_TYPES.DATE },
  impressions: { description: 'Instagram account impressions.', type: DATA_TYPES.INTEGER },
  reach: { description: 'Instagram account reach.', type: DATA_TYPES.INTEGER },
  profile_views: { description: 'Instagram profile views.', type: DATA_TYPES.INTEGER },
  website_clicks: { description: 'Instagram website clicks.', type: DATA_TYPES.INTEGER },
};

var instagramMediaInsightsFields = {
  page_id: {
    description: 'Facebook Page ID owning the Instagram account.',
    type: DATA_TYPES.STRING,
  },
  instagram_media_id: { description: 'Instagram media ID.', type: DATA_TYPES.STRING },
  media_type: { description: 'Instagram media type.', type: DATA_TYPES.STRING },
  caption: { description: 'Instagram media caption.', type: DATA_TYPES.STRING },
  media_timestamp: { description: 'Instagram media timestamp.', type: DATA_TYPES.DATETIME },
  date_start: {
    description: 'Daily insight bucket start.',
    type: DATA_TYPES.DATE,
    GoogleBigQueryPartitioned: true,
  },
  date_stop: { description: 'Daily insight bucket end.', type: DATA_TYPES.DATE },
  impressions: { description: 'Instagram media impressions.', type: DATA_TYPES.INTEGER },
  reach: { description: 'Instagram media reach.', type: DATA_TYPES.INTEGER },
  engagement: { description: 'Instagram media engagements.', type: DATA_TYPES.INTEGER },
  saves: { description: 'Instagram media saves.', type: DATA_TYPES.INTEGER },
  comments: { description: 'Instagram media comments.', type: DATA_TYPES.INTEGER },
  likes: { description: 'Instagram media likes.', type: DATA_TYPES.INTEGER },
};

var pageAudienceBreakdownFields = {
  page_id: { description: 'Facebook Page ID.', type: DATA_TYPES.STRING },
  date_start: {
    description: 'Daily insight bucket start.',
    type: DATA_TYPES.DATE,
    GoogleBigQueryPartitioned: true,
  },
  date_stop: { description: 'Daily insight bucket end.', type: DATA_TYPES.DATE },
  breakdown: { description: 'Audience breakdown metric name.', type: DATA_TYPES.STRING },
  dimension_value: { description: 'Audience dimension value.', type: DATA_TYPES.STRING },
  metric_value: { description: 'Audience count returned by Meta.', type: DATA_TYPES.INTEGER },
};
