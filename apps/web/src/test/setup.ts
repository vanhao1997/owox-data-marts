import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import i18n from '../i18n';
import { setI18n } from 'react-i18next';

setI18n(i18n);

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
