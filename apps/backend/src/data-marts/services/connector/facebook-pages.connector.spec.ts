// @ts-expect-error - Package lacks TypeScript declarations
import { Core, FacebookPages } from '@owox/connectors';

describe('FacebookPages connector', () => {
  const createSource = () => {
    const config = new Core.AbstractConfig({});
    config.logMessage = jest.fn();
    const source = new FacebookPages.FacebookPagesSource(config);
    source.config.MaxFetchRetries.value = 2;
    source.config.InitialRetryDelay.value = 0;
    return source;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exchanges a user token and sanitizes discovered Pages', async () => {
    const source = createSource();
    jest.spyOn(source, '_fetchOauthJson').mockImplementation(async (endpoint: string) => {
      if (endpoint.endsWith('/debug_token')) {
        return { data: { is_valid: true } };
      }
      if (endpoint.endsWith('/oauth/access_token')) {
        return { access_token: 'long-lived-user-token', expires_in: 3600 };
      }
      return { id: 'user-1', name: 'Page Admin' };
    });
    jest.spyOn(source, '_fetchManagedPages').mockResolvedValue([
      {
        id: '123',
        name: 'Demo Page',
        tasks: ['ANALYZE'],
        access_token: 'page-access-token',
      },
    ]);

    const result = await source.exchangeOauthCredentials(
      { accessToken: 'short-token' },
      { AppId: 'app-id', AppSecret: 'app-secret' }
    );

    expect(result.secret).toEqual({ accessToken: 'long-lived-user-token' });
    expect(result.additional).toEqual({
      pages: [{ id: '123', name: 'Demo Page', tasks: ['ANALYZE'] }],
    });
    expect(JSON.stringify(result.additional)).not.toContain('page-access-token');
  });

  it('rejects an invalid Facebook user token', async () => {
    const source = createSource();
    jest.spyOn(source, '_fetchOauthJson').mockResolvedValue({ data: { is_valid: false } });

    await expect(
      source.exchangeOauthCredentials(
        { accessToken: 'invalid-token' },
        { AppId: 'app-id', AppSecret: 'app-secret' }
      )
    ).rejects.toThrow('Invalid Facebook access token');
  });

  it('follows managed Page pagination', async () => {
    const source = createSource();
    const fetchJson = jest
      .spyOn(source, '_fetchJson')
      .mockResolvedValueOnce({
        data: [{ id: '1', name: 'One', tasks: ['ANALYZE'], access_token: 'page-1-token' }],
        paging: {
          next: 'https://graph.facebook.com/v26.0/me/accounts?after=cursor&access_token=leak',
        },
      })
      .mockResolvedValueOnce({
        data: [{ id: '2', name: 'Two', tasks: ['ANALYZE'], access_token: 'page-2-token' }],
      });

    const pages = await source._fetchManagedPages('user-token');

    expect(pages.map((page: { id: string }) => page.id)).toEqual(['1', '2']);
    expect(fetchJson).toHaveBeenNthCalledWith(
      2,
      'https://graph.facebook.com/v26.0/me/accounts?after=cursor&access_token=leak',
      'user-token'
    );
  });

  it('builds a daily request and flattens missing metrics to null', async () => {
    const source = createSource();
    jest.spyOn(source, '_getManagedPage').mockResolvedValue({
      id: '123',
      name: 'Demo Page',
      accessToken: 'page-token',
    });
    const fetchJson = jest.spyOn(source, '_fetchJson').mockResolvedValue({
      data: [
        {
          name: 'page_views_total',
          values: [{ end_time: '2026-08-27T07:00:00+0000', value: 12 }],
        },
        {
          name: 'page_post_engagements',
          values: [{ end_time: '2026-08-27T07:00:00+0000', value: 4 }],
        },
      ],
    });

    const rows = await source.fetchData(
      'page_insights_daily',
      '123',
      [
        'page_id',
        'page_name',
        'date_start',
        'date_stop',
        'page_views_total',
        'page_post_engagements',
        'page_follows',
      ],
      new Date('2026-08-26T00:00:00Z')
    );

    const requestUrl = new URL(fetchJson.mock.calls[0][0]);
    expect(requestUrl.pathname).toBe('/v26.0/123/insights');
    expect(requestUrl.searchParams.get('metric')).toBe(
      'page_views_total,page_post_engagements,page_follows'
    );
    expect(requestUrl.searchParams.get('period')).toBe('day');
    expect(requestUrl.searchParams.get('since')).toBe('2026-08-26');
    expect(requestUrl.searchParams.get('until')).toBe('2026-08-27');
    expect(fetchJson).toHaveBeenCalledWith(expect.any(String), 'page-token');
    expect(rows).toEqual([
      {
        page_id: '123',
        page_name: 'Demo Page',
        date_start: '2026-08-26',
        date_stop: '2026-08-27',
        page_views_total: 12,
        page_post_engagements: 4,
        page_follows: null,
      },
    ]);
  });

  it('rejects unsupported or deprecated fields', async () => {
    const source = createSource();

    await expect(
      source.fetchData(
        'page_insights_daily',
        '123',
        ['page_id', 'page_name', 'date_start', 'date_stop', 'page_views_total', 'page_fans'],
        new Date('2026-08-26T00:00:00Z')
      )
    ).rejects.toThrow('Unsupported Facebook Page Insights field(s): page_fans');
  });

  it('retries transient Facebook errors without leaking tokens in request URLs', async () => {
    const source = createSource();
    jest.spyOn(source, '_waitBeforeRetry').mockResolvedValue(undefined);
    const fetch = jest
      .spyOn(Core.HttpUtils, 'fetch')
      .mockResolvedValueOnce(
        createResponse({ error: { code: 2, is_transient: true, message: 'Transient error' } })
      )
      .mockResolvedValueOnce(createResponse({ data: [] }));

    await expect(
      source._fetchJson(
        'https://graph.facebook.com/v26.0/me/accounts?limit=100&access_token=leak',
        'user-token'
      )
    ).resolves.toEqual({ data: [] });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toBe('https://graph.facebook.com/v26.0/me/accounts?limit=100');
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer user-token');
  });

  it('parses and deduplicates multiple Page IDs', () => {
    const source = createSource();
    source.config.PageIDs.value = '123, 456;123\n789';
    expect(source.getConfiguredPageIds()).toEqual(['123', '456', '789']);
  });

  it('supports manual Access Token auth fields', () => {
    const source = createSource();
    expect(source.config.AuthType.oneOf.map((option: { value: string }) => option.value)).toEqual([
      'oauth2',
      'accessToken',
    ]);
    expect(source.config.AuthType.oneOf[1].items).toMatchObject({
      AccessToken: { isRequired: true },
      AppId: { isRequired: true },
      AppSecret: { isRequired: true },
    });
  });

  it('fetches Page profile metadata without a date range', async () => {
    const source = createSource();
    jest.spyOn(source, '_getManagedPage').mockResolvedValue({
      id: '123',
      name: 'Demo Page',
      accessToken: 'page-token',
    });
    jest.spyOn(source, '_fetchJson').mockResolvedValue({
      id: '123',
      name: 'Demo Page',
      category: 'Retail',
      followers_count: 42,
      instagram_business_account: { id: 'ig-1' },
    });

    await expect(
      source.fetchData('page_profile', '123', [
        'page_id',
        'page_name',
        'category',
        'followers_count',
        'instagram_business_account_id',
        'fetched_at',
      ])
    ).resolves.toEqual([
      expect.objectContaining({
        page_id: '123',
        page_name: 'Demo Page',
        category: 'Retail',
        followers_count: 42,
        instagram_business_account_id: 'ig-1',
      }),
    ]);
  });

  it('flattens audience breakdown dimensions into stable rows', async () => {
    const source = createSource();
    jest.spyOn(source, '_getManagedPage').mockResolvedValue({
      id: '123',
      name: 'Demo Page',
      accessToken: 'page-token',
    });
    jest.spyOn(source, '_fetchJson').mockResolvedValue({
      data: [
        {
          name: 'page_follows_by_country',
          values: [{ end_time: '2026-08-27T07:00:00+0000', value: { VN: 10, TH: 3 } }],
        },
      ],
    });

    await expect(
      source.fetchData(
        'page_audience_breakdown_daily',
        '123',
        ['page_id', 'date_start', 'date_stop', 'breakdown', 'dimension_value', 'metric_value'],
        new Date('2026-08-26T00:00:00Z')
      )
    ).resolves.toEqual([
      {
        page_id: '123',
        date_start: '2026-08-26',
        date_stop: '2026-08-27',
        breakdown: 'page_follows_by_country',
        dimension_value: 'VN',
        metric_value: 10,
      },
      {
        page_id: '123',
        date_start: '2026-08-26',
        date_stop: '2026-08-27',
        breakdown: 'page_follows_by_country',
        dimension_value: 'TH',
        metric_value: 3,
      },
    ]);
  });
});

function createResponse(body: Record<string, unknown>) {
  return {
    getResponseCode: () => 200,
    getAsJson: async () => body,
    getContentText: async () => JSON.stringify(body),
    getHeaders: () => ({}),
  };
}
