import { describe, expect, it, jest } from '@jest/globals';
import type { EmailProvider } from '@owox/internal-helpers';
import { MAGIC_LINK_INTENT } from '../../core/constants.js';
import { MagicLinkEmailService } from './magic-link-email-service.js';

describe('MagicLinkEmailService', () => {
  it('sends signup email with confirmation subject and content', async () => {
    const sendEmail = jest.fn<EmailProvider['sendEmail']>(async () => undefined);
    const emailProvider: jest.Mocked<EmailProvider> = { sendEmail };
    const service = new MagicLinkEmailService(emailProvider);

    await service.send({
      email: 'user@example.com',
      magicLink: 'https://auth.example.com/auth/magic-link?token=t1',
      intent: MAGIC_LINK_INTENT.SIGNUP,
    });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    const [to, subject, html, options] = sendEmail.mock.calls[0] as [
      string,
      string,
      string,
      { bodyText: string; categories: string[] },
    ];
    expect(to).toBe('user@example.com');
    expect(subject).toBe('Xác nhận email');
    expect(html).toContain('Xác nhận email');
    expect(html).toContain('https://auth.example.com/auth/magic-link?token=t1');
    expect(options.categories).toEqual(['transactional', 'auth']);
    expect(options.bodyText).toContain('Xác nhận email');
    expect(options.bodyText).toContain(
      'Xác nhận email: https://auth.example.com/auth/magic-link?token=t1'
    );
  });

  it('sends reset email with reset subject and content', async () => {
    const sendEmail = jest.fn<EmailProvider['sendEmail']>(async () => undefined);
    const emailProvider: jest.Mocked<EmailProvider> = { sendEmail };
    const service = new MagicLinkEmailService(emailProvider);

    await service.send({
      email: 'user@example.com',
      magicLink: 'https://auth.example.com/auth/magic-link?token=t2',
      intent: MAGIC_LINK_INTENT.RESET,
    });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    const [to, subject, html, options] = sendEmail.mock.calls[0] as [
      string,
      string,
      string,
      { bodyText: string; categories: string[] },
    ];
    expect(to).toBe('user@example.com');
    expect(subject).toBe('Đặt lại mật khẩu');
    expect(html).toContain('Đặt lại mật khẩu');
    expect(html).toContain('https://auth.example.com/auth/magic-link?token=t2');
    expect(options.categories).toEqual(['transactional', 'auth']);
    expect(options.bodyText).toContain('Đặt lại mật khẩu');
    expect(options.bodyText).toContain(
      'Đặt lại mật khẩu: https://auth.example.com/auth/magic-link?token=t2'
    );
  });
});
