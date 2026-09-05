// Keep cloud SDKs from probing instance metadata during local unit tests.
process.env.SNOWFLAKE_DISABLE_PLATFORM_DETECTION ??= 'true';
process.env.AWS_EC2_METADATA_DISABLED ??= 'true';
