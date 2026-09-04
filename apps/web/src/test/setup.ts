import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import i18n from '../i18n';
import { setI18n } from 'react-i18next';
import { server } from './mocks/server';

setI18n(i18n);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

beforeEach(async () => {
  await i18n.changeLanguage('en');
  localStorage.removeItem('p2p_language');
});

afterAll(() => {
  server.close();
});

afterEach(async () => {
  server.resetHandlers();
  // Keep tests deterministic when a language-switching test leaves i18n in Vietnamese.
  await i18n.changeLanguage('en');
  localStorage.removeItem('p2p_language');
});
