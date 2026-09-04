# Getting Started

1. Run `@owox/admicro-extractor` on a private network.
2. Set `ADMICRO_EXTRACTOR_ENABLED=true`, `ADMICRO_EXTRACTOR_URL`, and a Secret Manager-backed
   `ADMICRO_EXTRACTOR_SHARED_SECRET` on the OWOX backend.
3. Add an `Admicro Ads` Data Mart source and save the project-scoped credentials.
4. Select `campaign` or `date` fields in the Data Mart schema.

The sidecar creates a fresh browser context per extraction and does not persist cookies,
passwords, or raw `DATAVIEW` payloads.
