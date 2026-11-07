import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});
