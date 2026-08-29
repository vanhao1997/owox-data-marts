# Import Facebook Fanpage Insights

1. Create a storage in P2PDigital Data Marts.
2. Create a new Data Mart and select the storage.
3. Choose **Connector** as the input source and select **Facebook Fanpage**.
4. Click **Continue with Facebook**, approve requested Page permissions, and select one or more managed Pages; or choose manual Access Token auth and enter `Access Token`, `App ID`, `App Secret`, and comma-separated `Page IDs`.
5. Select the `page_insights_daily` fields and publish the Data Mart.
6. Run an incremental import or use a custom backfill period.

The output table is `facebook_pages_page_insights_daily` unless a destination override is configured. Optional nodes add Page profile, post/video, linked Instagram, and audience breakdown data.

Page Insights freshness: Meta normally publishes data T+1 / approximately 24 hours after the day ends. Latest-day rows can be incomplete or unavailable.
