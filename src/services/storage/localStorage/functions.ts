const customLocalStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key);

      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error(`storage.get: failed to parse ${key}`, err);

      return fallback;
    }
  },

  set(key: string, value: unknown) {
    try {
      const replacer = (_: string, v: unknown) => (typeof v === 'bigint' ? v.toString() : v);

      window.localStorage.setItem(key, JSON.stringify(value, replacer));
    } catch (err) {
      console.error(`storage.set: failed to save ${key}`, err);
    }
  },

  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.error(`storage.remove: failed to remove ${key}`, err);
    }
  },
};

export default customLocalStorage;
