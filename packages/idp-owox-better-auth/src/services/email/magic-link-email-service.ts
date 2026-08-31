import type { EmailProvider } from '@owox/internal-helpers';
import ejs from 'ejs';
import { readFileSync } from 'fs';
import { MAGIC_LINK_INTENT } from '../../core/constants.js';
import { createServiceLogger } from '../../core/logger.js';
import type { MagicLinkEmailPayload, MagicLinkIntent } from '../../types/index.js';
import { maskEmail } from '../../utils/email-utils.js';
import { resolveResourcePath } from '../../utils/template-paths.js';

/**
 * Renders and sends magic-link emails using one shared template.
 */
export class MagicLinkEmailService {
  private readonly logger = createServiceLogger(MagicLinkEmailService.name);
  private readonly template: string;

  constructor(private readonly emailProvider: EmailProvider) {
    this.template = this.loadTemplate();
  }

  private loadTemplate(): string {
    const templatePath = resolveResourcePath('templates/email/magic-link-email.ejs');
    return readFileSync(templatePath, 'utf-8');
  }

  private buildViewModel(payload: MagicLinkEmailPayload): Record<string, string> {
    const intent: MagicLinkIntent =
      payload.intent === MAGIC_LINK_INTENT.RESET ? MAGIC_LINK_INTENT.RESET : payload.intent;
    const isReset = intent === MAGIC_LINK_INTENT.RESET;

    return {
      title: isReset ? 'Đặt lại mật khẩu' : 'Xác nhận email',
      description: isReset
        ? 'Nhấn nút bên dưới để đặt lại mật khẩu. Liên kết có hiệu lực trong 1 giờ.'
        : 'Nhấn nút bên dưới để xác nhận email và hoàn tất thiết lập mật khẩu. Liên kết có hiệu lực trong 1 giờ.',
      buttonText: isReset ? 'Đặt lại mật khẩu' : 'Xác nhận email',
      magicLink: payload.magicLink,
      footer: 'Nếu bạn không yêu cầu thao tác này, bạn có thể bỏ qua email.',
    };
  }

  private buildSubject(intent: MagicLinkIntent): string {
    return intent === MAGIC_LINK_INTENT.RESET ? 'Đặt lại mật khẩu' : 'Xác nhận email';
  }

  private renderPlainText(viewModel: Record<string, string>): string {
    return [
      viewModel.title,
      '',
      viewModel.description,
      '',
      `${viewModel.buttonText}: ${viewModel.magicLink}`,
      '',
      viewModel.footer,
    ].join('\n');
  }

  async send(payload: MagicLinkEmailPayload): Promise<void> {
    const viewModel = this.buildViewModel(payload);
    const html = ejs.render(this.template, viewModel);
    const plainText = this.renderPlainText(viewModel);
    const subject = this.buildSubject(payload.intent);
    try {
      await this.emailProvider.sendEmail(payload.email, subject, html, {
        bodyText: plainText,
        categories: ['transactional', 'auth'],
        isMultiple: false,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send magic link email',
        { email: maskEmail(payload.email) },
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }
}
