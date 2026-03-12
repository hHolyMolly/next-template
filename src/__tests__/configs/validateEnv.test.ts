import { validateEnv } from '@/configs/env';

describe('validateEnv', () => {
  it('should not throw when required vars are present', () => {
    vi.stubEnv('NEXT_PUBLIC_CLIENT_URL', 'http://localhost:3000');

    expect(() => validateEnv()).not.toThrow();
  });

  it('should throw when NEXT_PUBLIC_CLIENT_URL is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_CLIENT_URL', '');

    expect(() => validateEnv()).toThrow('Missing required environment variables');
    expect(() => validateEnv()).toThrow('NEXT_PUBLIC_CLIENT_URL');
  });

  it('should list all missing vars in error message', () => {
    vi.stubEnv('NEXT_PUBLIC_CLIENT_URL', '');

    try {
      validateEnv();
    } catch (err) {
      expect((err as Error).message).toContain('NEXT_PUBLIC_CLIENT_URL');
      expect((err as Error).message).toContain('.env.example');
    }
  });
});
