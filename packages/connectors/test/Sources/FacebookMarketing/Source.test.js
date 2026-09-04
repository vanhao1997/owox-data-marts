import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it, vi } from 'vitest';
import { loadGasClass } from '../../support/loadGasClass.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const httpConstantsPath = path.join(__dirname, '../../../src/Constants/HttpConstants.js');
const errorCodesPath = path.join(
  __dirname,
  '../../../src/Sources/FacebookMarketing/Constants/ErrorCodes.js'
);
const coreSourcePath = path.join(__dirname, '../../../src/Core/AbstractSource.js');
const sourcePath = path.join(__dirname, '../../../src/Sources/FacebookMarketing/Source.js');

loadGasClass(httpConstantsPath);
loadGasClass(errorCodesPath);
loadGasClass(coreSourcePath);
loadGasClass(sourcePath);
const proto = globalThis.FacebookMarketingSource.prototype;

const fbError = (code, extra = {}) => ({
  statusCode: 400,
  payload: { error: { code, type: 'OAuthException', ...extra } },
});

// _isAuthError now defers to the retry logic, so `this` must resolve the real
// prototype methods rather than being a bare object.
const stub = Object.assign(Object.create(proto), { config: { logMessage: () => {} } });

describe('authentication configuration', () => {
  it('offers OAuth2 and project-scoped manual credentials', () => {
    globalThis.CONFIG_ATTRIBUTES = {
      ADVANCED: 'ADVANCED',
      DEPRECATED: 'DEPRECATED',
      HIDE_IN_CONFIG_FORM: 'HIDE_IN_CONFIG_FORM',
      MANUAL_BACKFILL: 'MANUAL_BACKFILL',
      OAUTH_FLOW: 'OAUTH_FLOW',
      SECRET: 'SECRET',
    };
    globalThis.OAUTH_CONSTANTS = {
      UI: 'UI',
      SECRET: 'SECRET',
      REQUIRED: 'REQUIRED',
    };
    globalThis.FacebookMarketingFieldsSchema = {};

    let mergedParameters = {};
    const config = {
      setParametersValues() {},
      mergeParameters(parameters) {
        mergedParameters = { ...mergedParameters, ...parameters };
        return this;
      },
    };

    new globalThis.FacebookMarketingSource(config);

    expect(mergedParameters.AuthType.oneOf.map(option => option.value)).toEqual([
      'accessToken',
      'oauth2',
    ]);
    const manual = mergedParameters.AuthType.oneOf.find(option => option.value === 'accessToken');
    expect(manual.items).toMatchObject({
      AccessToken: { isRequired: true, attributes: ['SECRET'] },
      AppId: { isRequired: true },
      AppSecret: { isRequired: true, attributes: ['SECRET'] },
    });
  });

  it('reads the selected manual token without exposing it through logs', () => {
    const accessToken = 'manual-token-for-test';
    const logMessage = vi.fn();
    const source = Object.assign(Object.create(proto), {
      config: {
        AuthType: {
          value: 'accessToken',
          items: { AccessToken: { value: accessToken } },
        },
        logMessage,
      },
    });

    expect(source._getAccessToken()).toBe(accessToken);
    expect(logMessage).not.toHaveBeenCalled();
  });

  it('keeps OAuth and legacy access-token configurations compatible', () => {
    expect(
      proto._getAccessToken.call({
        config: { AuthType: { value: 'oauth2', items: { AccessToken: { value: 'oauth-token' } } } },
      })
    ).toBe('oauth-token');
    expect(
      proto._getAccessToken.call({
        config: { AccessToken: { value: 'legacy-token' } },
      })
    ).toBe('legacy-token');
  });

  it('validates and exchanges a manually configured token when refresh is requested', async () => {
    const exchangeOauthCredentials = vi.fn().mockResolvedValue({
      secret: { accessToken: 'refreshed-token' },
    });
    const source = Object.assign(Object.create(proto), { exchangeOauthCredentials });

    await expect(
      source.refreshCredentials(
        {
          AuthType: {
            accessToken: {
              AccessToken: 'manual-token',
              AppId: 'app-id',
              AppSecret: 'app-secret',
            },
          },
        },
        {},
        {}
      )
    ).resolves.toEqual({ secret: { accessToken: 'refreshed-token' } });

    expect(exchangeOauthCredentials).toHaveBeenCalledWith(
      { accessToken: 'manual-token' },
      { AppId: 'app-id', AppSecret: 'app-secret' }
    );
  });
});

describe('_isAuthError', () => {
  // Codes below are taken from real production error payloads.
  it.each([
    ['session expired / app deleted', 190],
    ['missing ads_management or business_management permission', 200],
  ])('flags credential failure: %s (code %i)', (_label, code) => {
    expect(proto._isAuthError.call(stub, fbError(code))).toBe(true);
  });

  // Facebook reuses OAuthException for throttling and outages. Those are listed in
  // FB_RETRYABLE_ERROR_CODES, so exhausting retries on them is a real failure to alert on.
  it.each([
    ['ad-account rate limit', 80004],
    ['temporary service unavailability', 2],
  ])('does not flag retryable condition: %s (code %i)', (_label, code) => {
    expect(proto._isAuthError.call(stub, fbError(code))).toBe(false);
  });

  it('does not flag an OAuthException whose retryable marker is the subcode', () => {
    expect(proto._isAuthError.call(stub, fbError(1, { error_subcode: 1504018 }))).toBe(false);
  });

  // isValidToRetry treats these as retryable, so exhausting the attempts on them is a
  // real failure. Classifying them as warnings would silence the alert instead.
  it('does not flag an OAuthException Facebook marked is_transient', () => {
    expect(proto._isAuthError.call(stub, fbError(1, { is_transient: true }))).toBe(false);
  });

  it('does not flag a 5xx carrying an OAuthException payload', () => {
    const error = { statusCode: 500, payload: { error: { code: 1, type: 'OAuthException' } } };
    expect(proto._isAuthError.call(stub, error)).toBe(false);
  });

  it('does not flag a network-level error with no statusCode', () => {
    const error = { payload: { error: { code: 1, type: 'OAuthException' } } };
    expect(proto._isAuthError.call(stub, error)).toBe(false);
  });

  it('still falls back to the default 401/403 check for non-Facebook-shaped errors', () => {
    expect(proto._isAuthError.call(stub, { statusCode: 401 })).toBe(true);
  });

  it('does not flag a non-OAuth Facebook error (reduce-data, code 1 without type)', () => {
    const error = {
      statusCode: 400,
      payload: {
        error: { code: 1, message: "Please reduce the amount of data you're asking for" },
      },
    };
    expect(proto._isAuthError.call(stub, error)).toBe(false);
  });

  it('does not flag a plain server error', () => {
    expect(proto._isAuthError.call(stub, { statusCode: 500 })).toBe(false);
  });
});
