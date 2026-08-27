# Troubleshooting Facebook Fanpage

## Latest day is empty

Meta Page Insights normally has T+1 / approximately 24-hour delay. Keep `ReimportLookbackWindow` at 2 or higher.

## Manual auth fails

Verify `Access Token`, `App ID`, `App Secret`, and numeric comma-separated `Page IDs`. The token must manage every selected Page and include `ANALYZE`.

## Instagram or audience node is empty

Instagram requires a linked professional account and permissions. Meta can omit demographic metrics for a Page, date, or permission set; empty responses remain empty, without synthetic zeroes.

## No Pages are listed

Confirm that the Facebook user manages the Page, the app has `pages_show_list`, and the Page grants the `ANALYZE` task. Re-authorize after changing permissions.

## Page access is unavailable

The Page may have been removed from the user's managed Pages or the user token may have expired or been revoked. Reconnect Facebook and select the Page again.

## Insights request fails with a permission error

Check Meta App Review/business verification for `read_insights` and `pages_read_engagement`. Also confirm that the selected Page still grants `ANALYZE`.

## Rate limit or server error

The connector retries transient network errors, rate limits, and 5xx responses with bounded exponential backoff. Re-run after the limit resets if all retries are exhausted.
