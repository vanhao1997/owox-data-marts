# Facebook Page metric dictionary

The connector uses Graph API `v26.0` and synchronizes Page Insights daily.
Date fields preserve the bucket date returned by Meta; no timezone conversion or
reach/impression alias is calculated.

| Field | Source | Type | Formula | Grain | Timezone | Frequency | Lookback | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `page_media_view` | `page_media_view` | `INTEGER` | Number of times Page content was played or displayed | Page + day | Meta bucket | Daily | 7 days | Replacement for legacy reach/impression reporting |
| `page_total_media_view_unique` | `page_total_media_view_unique` | `INTEGER` | Total unique Page media viewers | Page + day | Meta bucket | Daily | 7 days | Meta unique estimate |
| `page_total_actions` | `page_total_actions` | `INTEGER` | Page contact and CTA clicks | Page + day | Meta bucket | Daily | 7 days | Direct Meta value |
| `page_daily_follows` | `page_daily_follows` | `INTEGER` | Daily Page follows | Page + day | Meta bucket | Daily | 7 days | Meta definition may change |
| `page_daily_follows_unique` | `page_daily_follows_unique` | `INTEGER` | Estimated unique Page follows | Page + day | Meta bucket | Daily | 7 days | Meta estimate |
| `page_daily_unfollows_unique` | `page_daily_unfollows_unique` | `INTEGER` | Estimated unique Page unfollows | Page + day | Meta bucket | Daily | 7 days | Meta estimate |
| `page_media_view_breakdown_daily.metric_value` | `page_media_view` with `is_from_ads` or `is_from_followers` | `INTEGER` | Media views for each breakdown value | Page + day + breakdown | Meta bucket | Daily | 7 days | Stored as `breakdown`, `dimension_value`, `metric_value` |
| `post_media_view` | `post_media_view` | `INTEGER` | Lifetime post content plays/displays | Page + post | Meta bucket | Daily | 7 days | Latest lifetime snapshot only |
| `post_total_media_view_unique` | `post_total_media_view_unique` | `INTEGER` | Lifetime unique post media viewers | Page + post | Meta bucket | Daily | 7 days | Latest lifetime snapshot only |

Legacy Page/Post reach and impression metrics marked deprecated by Meta are not
added to the schema. Lifetime post metrics are not placed in the daily post node.
