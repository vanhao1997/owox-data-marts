# Admicro Ads Metric Dictionary

MVP keeps provider columns under stable raw names. Mapping below was confirmed against sanitized
Campaign and Date `DATAVIEW` fixtures plus live desktop/mobile report rendering. Semantic aliases
remain deferred so source column IDs stay lossless.

| Field                 | Source                                                                 | Formula                                                  | Grain                                                                         | Timezone           | Sync  | Lookback |
| --------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------ | ----- | -------- |
| `admicro_column_1`    | `col_view=1`, `displayclick`                                           | Click value returned by Admicro                          | `campaign`: day + campaign + platform + scope; `date`: day + platform + scope | `Asia/Ho_Chi_Minh` | Daily | 7 days   |
| `admicro_column_8`    | Desktop `col_view=8`, `click`                                          | Total click value returned by Admicro                    | Node grain                                                                    | `Asia/Ho_Chi_Minh` | Daily | 7 days   |
| `admicro_column_9`    | Mobile `col_view=9`, `click`                                           | Total click value returned by Admicro                    | Node grain                                                                    | `Asia/Ho_Chi_Minh` | Daily | 7 days   |
| `admicro_column_2`    | `col_view=2`, `displayview`                                            | Impression value returned by Admicro                     | Node grain                                                                    | `Asia/Ho_Chi_Minh` | Daily | 7 days   |
| `admicro_column_4`    | `col_view=4`, `ctr`                                                    | CTR percentage returned by Admicro                       | Node grain                                                                    | `Asia/Ho_Chi_Minh` | Daily | 7 days   |
| `admicro_column_5`    | `col_view=5`, `money`                                                  | Money value returned by Admicro                          | Node grain                                                                    | `Asia/Ho_Chi_Minh` | Daily | 7 days   |
| `admicro_column_<id>` | Other requested `col_view` ID and matching discovered source key       | Value returned by Admicro; provider type remains dynamic | Node grain                                                                    | `Asia/Ho_Chi_Minh` | Daily | 7 days   |
| `day`                 | Requested report day, replaced by returned date dimension when present | Canonical ISO date                                       | Node grain                                                                    | `Asia/Ho_Chi_Minh` | Daily | 7 days   |
| `platform`            | Connector configuration                                                | `desktop` or `mobile`                                    | Node grain                                                                    | N/A                | Daily | 7 days   |
| `report_type`         | Connector node                                                         | `campaign` or `date`                                     | Node grain                                                                    | N/A                | Daily | 7 days   |
| `campaign_scope`      | Requested `lstid`                                                      | Campaign ID or `all`                                     | Node grain                                                                    | N/A                | Daily | 7 days   |
| `campaign_id`         | Returned campaign dimension, with requested scope as fallback          | String identifier                                        | Campaign only                                                                 | N/A                | Daily | 7 days   |
| `date`                | Returned date dimension, with requested day as fallback                | Canonical ISO date                                       | Date only                                                                     | `Asia/Ho_Chi_Minh` | Daily | 7 days   |

Dynamic preview supplies each raw field's current provider label, inferred type, source column ID,
and source key. Do not introduce semantic aliases without a sanitized fixture and a versioned
mapping review.
