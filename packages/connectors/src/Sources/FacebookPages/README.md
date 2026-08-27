# Facebook Fanpage

The Facebook Fanpage connector imports organic Page data for one or more Facebook Pages into an existing OWOX storage.

## Supported data

The connector exposes these nodes:

- `page_insights_daily`
- `page_profile`
- `page_posts_insights_daily` and `page_videos_insights_daily`
- `instagram_account_insights_daily` and `instagram_media_insights_daily`
- `page_audience_breakdown_daily`

The core `page_insights_daily` node includes:

- `page_views_total`
- `page_post_engagements`
- `page_follows`

Meta Page Insights is delayed and may only retain historical data for a limited period. The connector keeps missing metric values as `null` and does not use deprecated metrics such as `page_fans` or generic `impressions`.

## Before you start

1. Configure a Facebook App for the OWOX web/backend URLs.
2. Set `OAUTH_FACEBOOK_PAGES_APP_ID` and `OAUTH_FACEBOOK_PAGES_APP_SECRET`.
3. Request `pages_show_list`, `read_insights`, `pages_read_engagement`, `instagram_basic`, and `instagram_manage_insights`. Meta App Review or business verification may be required.
4. Create a Data Mart with an existing storage and choose **Facebook Fanpage**.
5. Sign in with Facebook and select one or more managed Pages that have the `ANALYZE` task, or select manual Access Token auth and enter `Access Token`, `App ID`, `App Secret`, and `Page IDs`.

## Incremental and backfill runs

Incremental runs import the current complete day available from Meta and apply `ReimportLookbackWindow` (default: two days). Use manual backfill to request a historical range supported by Meta.

## Known limits

- OAuth and manual setup support multiple Page IDs. Each Page is validated against the authenticated user's managed Pages before import.
- Page access tokens are resolved server-side and are never written to configuration or returned to the browser.
- Permission changes, Page removal, expired user tokens, rate limits, and Meta API version changes can stop an import.
- Page Insights values are bucketed using the date returned by Meta; freshness is commonly T+1 or approximately 24 hours. Latest-day values can be missing until processing completes.
