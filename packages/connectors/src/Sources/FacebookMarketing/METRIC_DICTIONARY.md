# Facebook Ads metric dictionary

The connector uses Meta Marketing API `v25.0` and keeps the source field name as
the OWOX field name. New metrics are selectable, but are not selected by default.

| Field | Source | Type | Formula | Grain | Timezone | Frequency | Lookback | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `actions_per_impression` | `actions_per_impression` | `NUMBER` | Actions / impressions (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Direct Meta value |
| `app_store_clicks` | `app_store_clicks` | `NUMBER` | App-store link clicks (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Direct Meta value |
| `call_to_action_clicks` | `call_to_action_clicks` | `NUMBER` | CTA clicks (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Direct Meta value |
| `cost_per_total_action` | `cost_per_total_action` | `NUMBER` | Cost per relevant action (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Direct Meta value |
| `landing_page_view_per_link_click` | `landing_page_view_per_link_click` | `NUMBER` | Landing-page views / link clicks (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Direct Meta value |
| `marketing_messages_delivered` | `marketing_messages_delivered` | `NUMBER` | Successfully delivered marketing messages (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Meta may estimate this value |
| `purchase_per_landing_page_view` | `purchase_per_landing_page_view` | `NUMBER` | Purchases / landing-page views (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Direct Meta value |
| `thumb_stops` | `thumb_stops` | `NUMBER` | Attentive display-ad views (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Direct Meta value |
| `total_actions` | `total_actions` | `NUMBER` | Total attributed actions (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Direct Meta value |
| `total_action_value` | `total_action_value` | `NUMBER` | Total attributed action value (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Direct Meta value |
| `total_unique_actions` | `total_unique_actions` | `NUMBER` | Estimated unique accounts with an attributed action (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Meta estimate |
| `unique_impressions` | `unique_impressions` | `NUMBER` | Estimated unique accounts seeing the ad (Meta value) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Meta estimate |
| `video_6_sec_watched_actions` | `video_6_sec_watched_actions` | `ARRAY` | Video views reaching six seconds (JSON array from Meta) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Preserve action array |
| `video_complete_watched_actions` | `video_complete_watched_actions` | `ARRAY` | Video views reaching thirty seconds/end (JSON array from Meta) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Preserve action array |
| `video_completed_view_or_15s_passed_actions` | `video_completed_view_or_15s_passed_actions` | `ARRAY` | Completed views or fifteen-second passes (JSON array from Meta) | Ad, ad set, campaign + day | Ad account timezone | Daily | 7 days | Preserve action array |

The connector does not calculate aliases such as `clicks`, `impressions`, or
`ctr` from these fields. Meta-estimated or in-development labels remain visible
in the field descriptions where applicable.
