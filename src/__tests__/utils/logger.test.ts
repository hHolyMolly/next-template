import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger utility', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('calls console.log in dev', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { logger } = await import('@/utils/logger');
      logger.log('test message');
      expect(spy).toHaveBeenCalled();
    });

    it('calls console.warn in dev', async () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { logger } = await import('@/utils/logger');
      logger.warn('test warning');
      expect(spy).toHaveBeenCalled();
    });

    it('calls console.error in dev', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { logger } = await import('@/utils/logger');
      logger.error('test error');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('does not call console.log in production', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { logger } = await import('@/utils/logger');
      logger.log('test message');
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not call console.warn in production', async () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { logger } = await import('@/utils/logger');
      logger.warn('test warning');
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not call console.error in production', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { logger } = await import('@/utils/logger');
      logger.error('test error');
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
