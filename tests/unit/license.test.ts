import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('license return flow', () => {
  beforeEach(() => {
    localStorage.clear();
    history.replaceState(null, '', '/?license=paid-token&source=return');
    vi.resetModules();
  });

  it('stores and removes a returned license from the visible URL', async () => {
    const { captureReturnedLicense, storedLicense } = await import('../../src/license');
    captureReturnedLicense();
    expect(storedLicense()).toBe('paid-token');
    expect(location.search).toBe('?source=return');
  });
});
