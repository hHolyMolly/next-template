import { createWebStorage } from '@/services/storage/createWebStorage';

function createMockStorage(): Storage {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key) as unknown as void,
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
  };
}

describe('createWebStorage', () => {
  let mockStorage: Storage;
  let adapter: ReturnType<typeof createWebStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    adapter = createWebStorage(() => mockStorage);
  });

  describe('get', () => {
    it('should return fallback when key does not exist', () => {
      expect(adapter.get('missing', 'default')).toBe('default');
    });

    it('should parse stored JSON value', () => {
      mockStorage.setItem('user', JSON.stringify({ name: 'Alice' }));
      expect(adapter.get('user', null)).toEqual({ name: 'Alice' });
    });

    it('should return fallback on invalid JSON', () => {
      mockStorage.setItem('bad', 'not-json');
      expect(adapter.get('bad', 'fallback')).toBe('fallback');
    });
  });

  describe('set', () => {
    it('should store value as JSON', () => {
      adapter.set('items', [1, 2, 3]);
      expect(mockStorage.getItem('items')).toBe('[1,2,3]');
    });

    it('should handle objects', () => {
      adapter.set('config', { debug: true });
      expect(JSON.parse(mockStorage.getItem('config')!)).toEqual({ debug: true });
    });
  });

  describe('remove', () => {
    it('should remove the key', () => {
      mockStorage.setItem('temp', '"value"');
      adapter.remove('temp');
      expect(mockStorage.getItem('temp')).toBeNull();
    });
  });
});
