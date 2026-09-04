# Admicro Ads Source

`AdmicroAds` imports the Admicro ADX `campaign` and `date` reports through the private
`@owox/admicro-extractor` sidecar. Configure the sidecar URL and HMAC secret on the OWOX
runtime, then enter the project-scoped Admicro username and password in the connector form.

The MVP keeps canonical dimensions (`day`, `platform`, `report_type`, `campaign_scope`, and
`campaign_id` for the campaign node) and raw provider columns as `admicro_column_<id>`. The current
source-key mapping for default columns still needs validation against sanitized Campaign and Date
fixtures. Semantic aliases stay deferred until that validation and a versioned mapping review.

See [METRIC_DICTIONARY.md](METRIC_DICTIONARY.md) for source, formula, grain, timezone, sync,
and lookback definitions.
