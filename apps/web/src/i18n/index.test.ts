import { describe, it, expect, beforeEach } from 'vitest';
import i18n, { LANGUAGE_STORAGE_KEY } from './index';

describe('i18n configuration & language switching', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  });

  it('initializes with supported languages en and vi', () => {
    expect(i18n.options.supportedLngs).toContain('en');
    expect(i18n.options.supportedLngs).toContain('vi');
  });

  it('switches language to Vietnamese and resolves translations', async () => {
    await i18n.changeLanguage('vi');
    expect(i18n.language).toBe('vi');
    expect(i18n.t('userMenu.language')).toBe('Ngôn ngữ');
    expect(i18n.t('sidebar.runHistory')).toBe('Lịch sử chạy');
    expect(i18n.t('actionButton.newDataMart')).toBe('Tạo Data Mart mới');
    expect(i18n.t('projectMenu.switchProject')).toBe('Chuyển dự án');
  });

  it('switches back to English and resolves translations', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
    expect(i18n.t('userMenu.language')).toBe('Language');
    expect(i18n.t('sidebar.runHistory')).toBe('Run History');
    expect(i18n.t('actionButton.newDataMart')).toBe('New Data Mart');
    expect(i18n.t('projectMenu.switchProject')).toBe('Switch project');
  });

  it('normalizes regional Vietnamese locale vi-VN to vi', async () => {
    await i18n.changeLanguage('vi-VN');
    expect(i18n.resolvedLanguage).toBe('vi');
    expect(i18n.t('userMenu.language')).toBe('Ngôn ngữ');
  });
});
