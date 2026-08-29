import { describe, expect, it } from '@jest/globals';
import {
  McpOAuthProjectMemberContextSchema,
  McpTokenPayloadSchema,
  OAuthAuthorizationServerMetadataSchema,
  OAuthProtectedResourceMetadataSchema,
  OAuthTokenExchangeResultSchema,
} from './oauth.js';

describe('MCP OAuth protocol schemas', () => {
  it('accepts protected-resource metadata for the MCP resource', () => {
    const result = OAuthProtectedResourceMetadataSchema.parse({
      resource: 'https://mcp.owox.com/mcp',
      authorization_servers: ['https://app.p2pdigital.vn'],
      scopes_supported: ['mcp:read', 'mcp:write'],
      resource_documentation: 'https://docs.p2pdigital.vn/docs/mcp',
    });

    expect(result.resource).toBe('https://mcp.owox.com/mcp');
    expect(result.authorization_servers).toEqual(['https://app.p2pdigital.vn']);
  });

  it('accepts authorization-code metadata with PKCE and dynamic registration', () => {
    const result = OAuthAuthorizationServerMetadataSchema.parse({
      issuer: 'https://app.p2pdigital.vn',
      authorization_endpoint: 'https://app.p2pdigital.vn/oauth/authorize',
      token_endpoint: 'https://app.p2pdigital.vn/oauth/token',
      registration_endpoint: 'https://app.p2pdigital.vn/oauth/register',
      jwks_uri: 'https://app.p2pdigital.vn/oauth/jwks',
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      scopes_supported: ['mcp:read', 'mcp:write'],
      token_endpoint_auth_methods_supported: ['none'],
    });

    expect(result.response_types_supported).toEqual(['code']);
    expect(result.code_challenge_methods_supported).toEqual(['S256']);
    expect(result.token_endpoint_auth_methods_supported).toEqual(['none']);
  });

  it('requires project-member scoped MCP token claims', () => {
    const payload = McpTokenPayloadSchema.parse({
      clientId: 'mcp-client-1',
      userId: 'user-1',
      projectId: 'project-1',
      email: 'user@example.com',
      roles: ['viewer'],
      resource: 'https://mcp.owox.com/mcp',
      scopes: ['mcp:read'],
      authFlow: 'mcp',
    });

    expect(payload).toEqual(
      expect.objectContaining({
        clientId: 'mcp-client-1',
        userId: 'user-1',
        projectId: 'project-1',
        roles: ['viewer'],
        resource: 'https://mcp.owox.com/mcp',
        scopes: ['mcp:read'],
        authFlow: 'mcp',
      })
    );

    expect(() =>
      McpTokenPayloadSchema.parse({
        clientId: 'mcp-client-1',
        userId: 'user-1',
        roles: ['viewer'],
        resource: 'https://mcp.owox.com/mcp',
        scopes: ['mcp:read'],
      })
    ).toThrow();

    expect(() =>
      McpTokenPayloadSchema.parse({
        userId: 'user-1',
        projectId: 'project-1',
        roles: ['viewer'],
        resource: 'https://mcp.owox.com/mcp',
        scopes: ['mcp:read'],
        authFlow: 'mcp',
      })
    ).toThrow();
  });

  it('accepts a null avatar from the identity service and normalizes it to undefined', () => {
    const payload = McpTokenPayloadSchema.parse({
      clientId: 'mcp-client-1',
      userId: 'user-1',
      projectId: 'project-1',
      email: 'user@example.com',
      avatar: null,
      roles: ['viewer'],
      resource: 'https://mcp.owox.com/mcp',
      scopes: ['mcp:read'],
      authFlow: 'mcp',
    });

    expect(payload.avatar).toBeUndefined();
    expect(payload.projectId).toBe('project-1');
  });

  it('requires project-member context before issuing an authorization code', () => {
    const context = McpOAuthProjectMemberContextSchema.parse({
      userId: 'user-1',
      projectId: 'project-1',
      roles: ['editor'],
      email: 'user@example.com',
    });

    expect(context).toEqual(
      expect.objectContaining({
        userId: 'user-1',
        projectId: 'project-1',
        roles: ['editor'],
      })
    );
  });

  it('maps token exchange response without IB transport fields', () => {
    const result = OAuthTokenExchangeResultSchema.parse({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'mcp:read',
    });

    expect(result).toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'mcp:read',
    });
  });
});
