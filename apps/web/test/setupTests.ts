import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'vitest';
import i18n from '../src/i18n';
import { setI18n } from 'react-i18next';

setI18n(i18n);

beforeEach(async () => {
  await i18n.changeLanguage('en');
  localStorage.removeItem('p2p_language');
});

// Keep tests deterministic when a language-switching test leaves i18n in Vietnamese.
afterEach(async () => {
  await i18n.changeLanguage('en');
  localStorage.removeItem('p2p_language');
});
