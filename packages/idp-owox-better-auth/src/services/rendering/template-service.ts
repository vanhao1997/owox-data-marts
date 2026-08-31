import ejs from 'ejs';
import { readFileSync } from 'fs';
import { MAGIC_LINK_INTENT } from '../../core/constants.js';
import {
  USE_CASE_OPTIONS,
  PRIMARY_ROLE_OPTIONS,
  PRIMARY_STORAGE_OPTIONS,
} from '../../core/onboarding-constants.js';
import type { UiAuthProviders } from '../../types/index.js';
import { resolveResourcePath } from '../../utils/template-paths.js';

/**
 * Loads and renders EJS templates for auth pages with layout composition.
 */
export class TemplateService {
  private static readonly templateCache = new Map<string, string>();

  private static getTemplatePath(templateName: string): string {
    return resolveResourcePath(`templates/${templateName}`);
  }

  private static loadTemplate(templateName: string): string {
    const cached = this.templateCache.get(templateName);
    if (cached) {
      return cached;
    }
    const templatePath = this.getTemplatePath(templateName);
    const content = readFileSync(templatePath, 'utf-8');
    this.templateCache.set(templateName, content);
    return content;
  }

  /**
   * Renders an EJS template with layout composition.
   * @param pagePath - Path to page template (e.g., 'pages/sign-in.ejs')
   * @param layoutPath - Path to layout template (e.g., 'layouts/auth.ejs')
   * @param data - Data to pass to templates
   */
  private static renderWithLayout(
    pagePath: string,
    layoutPath: string,
    data: Record<string, unknown>
  ): string {
    // 1. Load and render page content
    const pageTemplate = this.loadTemplate(pagePath);
    const pageContent = ejs.render(pageTemplate, data, {
      filename: this.getTemplatePath(pagePath),
    });

    // 2. Load and render layout with page content injected
    const layoutTemplate = this.loadTemplate(layoutPath);
    return ejs.render(
      layoutTemplate,
      { ...data, body: pageContent },
      {
        filename: this.getTemplatePath(layoutPath),
      }
    );
  }

  public static renderSignIn(
    data: Record<string, unknown> & { providers: UiAuthProviders; gtmContainerId?: string }
  ): string {
    return this.renderWithLayout('pages/sign-in.ejs', 'layouts/auth.ejs', {
      pageTitle: 'Đăng nhập - P2PDigital Data Marts',
      heading: 'Đăng nhập P2PDigital',
      ...data,
      providers: data.providers,
      gtmContainerId: data.gtmContainerId,
    });
  }

  public static renderSignUp(
    data: Record<string, unknown> & { providers: UiAuthProviders; gtmContainerId?: string }
  ): string {
    return this.renderWithLayout('pages/sign-up.ejs', 'layouts/auth.ejs', {
      pageTitle: 'Đăng ký - P2PDigital Data Marts',
      heading: 'Tạo tài khoản P2PDigital',
      magicLinkSignupIntent: MAGIC_LINK_INTENT.SIGNUP,
      ...data,
      providers: data.providers,
      gtmContainerId: data.gtmContainerId,
    });
  }

  public static renderMagicLinkConfirm(
    data: Record<string, unknown> & { gtmContainerId?: string } = {}
  ): string {
    return this.renderWithLayout('pages/magic-link-confirm.ejs', 'layouts/auth.ejs', {
      pageTitle: 'Xác nhận email',
      heading: 'Xác nhận email',
      magicLinkResetIntent: MAGIC_LINK_INTENT.RESET,
      ...data,
      gtmContainerId: data.gtmContainerId,
    });
  }

  public static renderPasswordSetup(
    data: Record<string, unknown> & { gtmContainerId?: string } = {}
  ): string {
    return this.renderWithLayout('pages/password-setup.ejs', 'layouts/auth.ejs', {
      pageTitle: 'Thiết lập mật khẩu',
      heading: 'Thiết lập mật khẩu',
      intent: MAGIC_LINK_INTENT.SIGNUP,
      magicLinkResetIntent: MAGIC_LINK_INTENT.RESET,
      resetToken: '',
      errorMessage: '',
      infoMessage: '',
      ...data,
      gtmContainerId: data.gtmContainerId,
    });
  }

  public static renderPasswordSuccess(
    data: Record<string, unknown> & { gtmContainerId?: string } = {}
  ): string {
    return this.renderWithLayout('pages/password-success.ejs', 'layouts/auth.ejs', {
      pageTitle: 'Đã cập nhật mật khẩu',
      heading: 'Đã cập nhật mật khẩu',
      ...data,
      gtmContainerId: data.gtmContainerId,
    });
  }

  public static renderAuthError(
    data: Record<string, unknown> & { gtmContainerId?: string } = {}
  ): string {
    return this.renderWithLayout('pages/auth-error.ejs', 'layouts/auth.ejs', {
      pageTitle: 'Đăng nhập thất bại',
      heading: 'Đăng nhập thất bại',
      errorMessage: 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.',
      errorCode: '',
      homeHref: '/',
      homeLabel: 'Về trang chủ',
      ...data,
      gtmContainerId: data.gtmContainerId,
    });
  }

  public static renderForgotPassword(
    data: Record<string, unknown> & { gtmContainerId?: string } = {}
  ): string {
    return this.renderWithLayout('pages/forgot-password.ejs', 'layouts/auth.ejs', {
      pageTitle: 'Quên mật khẩu',
      heading: 'Đặt lại mật khẩu',
      magicLinkResetIntent: MAGIC_LINK_INTENT.RESET,
      ...data,
      gtmContainerId: data.gtmContainerId,
    });
  }

  public static renderOnboarding(
    data: Record<string, unknown> & { gtmContainerId?: string } = {}
  ): string {
    return this.renderWithLayout('pages/onboarding.ejs', 'layouts/onboarding.ejs', {
      pageTitle: 'Chào mừng - P2PDigital Data Marts',
      heading: 'Cá nhân hóa trải nghiệm của bạn',
      useCaseOptions: USE_CASE_OPTIONS,
      primaryRoleOptions: PRIMARY_ROLE_OPTIONS,
      primaryStorageOptions: PRIMARY_STORAGE_OPTIONS,
      ...data,
      gtmContainerId: data.gtmContainerId,
    });
  }
}
