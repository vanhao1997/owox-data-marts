var AdmicroAdsHelper = {
  parseIds(value) {
    return [
      ...new Set(
        String(value || '')
          .split(/[,;\s]+/u)
          .map(item => item.trim())
          .filter(Boolean)
      ),
    ];
  },

  parseFields(value) {
    return String(value || '')
      .split(',')
      .reduce((result, item) => {
        const parts = item.trim().split(/\s+/);
        if (parts.length < 2) return result;
        const [node, ...fieldParts] = parts;
        const field = fieldParts.join('_');
        (result[node] ||= []).push(field);
        return result;
      }, {});
  },

  defaultColumnIds(platform) {
    return platform === 'mobile' ? ['1', '9', '2', '4', '5'] : ['1', '8', '2', '4', '5'];
  },

  formatDate(date) {
    return DateUtils.formatDate(date);
  },

  todayInTimezone(timezone = 'Asia/Ho_Chi_Minh', now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(now)
      .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
    return `${parts.year}-${parts.month}-${parts.day}`;
  },

  asUtcDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) throw new Error(`Invalid Admicro date: ${value}`);
    return new Date(`${DateUtils.formatDate(date)}T00:00:00.000Z`);
  },

  getExtractorUrl(path) {
    if (
      String(process.env.ADMICRO_EXTRACTOR_ENABLED || '')
        .trim()
        .toLowerCase() !== 'true'
    ) {
      throw new ConnectorConfigurationException('Admicro extractor is disabled');
    }
    const base = String(process.env.ADMICRO_EXTRACTOR_URL || '').replace(/\/$/, '');
    if (!base) throw new ConnectorConfigurationException('ADMICRO_EXTRACTOR_URL is not configured');
    return `${base}${path}`;
  },

  signBody(body, secret) {
    if (!secret)
      throw new ConnectorConfigurationException(
        'ADMICRO_EXTRACTOR_SHARED_SECRET is not configured'
      );
    const crypto = require('node:crypto');
    const raw = JSON.stringify(body);
    const timestamp = String(Date.now());
    const nonce = crypto.randomUUID();
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${nonce}.${hash}`)
      .digest('hex');
    return {
      raw,
      headers: {
        'content-type': 'application/json',
        'x-owox-timestamp': timestamp,
        'x-owox-nonce': nonce,
        'x-owox-body-sha256': hash,
        'x-owox-signature': `sha256=${signature}`,
      },
    };
  },
};
