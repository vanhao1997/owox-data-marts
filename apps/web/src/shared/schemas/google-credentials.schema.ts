import { z } from 'zod';

/**
 * Schema for Google credentials that supports both Service Account and OAuth.
 * OAuth is managed via credentialId on the parent entity.
 * At least one authentication method must be provided: a new serviceAccount JSON
 * or an existing credentialId (which could be either a SA or OAuth credential).
 */
export const googleCredentialsWithOAuthSchema = z
  .object({
    serviceAccount: z.string().optional(),
    credentialId: z.string().uuid('Invalid credential ID').nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const hasServiceAccount = !!data.serviceAccount && data.serviceAccount.trim().length > 0;
    const hasCredentialId = !!data.credentialId && data.credentialId.trim().length > 0;
    if (hasServiceAccount || hasCredentialId) return;

    // The form renders only one auth method at a time, so the issue is
    // addressed to both fields — whichever is mounted will display it.
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either Service Account or OAuth connection must be provided',
      path: ['serviceAccount'],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Connect your Google account or provide a Service Account to save',
      path: ['credentialId'],
    });
  });
