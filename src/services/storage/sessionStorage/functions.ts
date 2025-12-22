export const customSessionStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.sessionStorage.getItem(key);

      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error(`sessionStorage.get: failed to parse ${key}`, err);

      return fallback;
    }
  },

  set(key: string, value: unknown) {
    try {
      const replacer = (_: string, v: unknown) => (typeof v === 'bigint' ? v.toString() : v);

      window.sessionStorage.setItem(key, JSON.stringify(value, replacer));
    } catch (err) {
      console.error(`sessionStorage.set: failed to save ${key}`, err);
    }
  },

  remove(key: string) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (err) {
      console.error(`sessionStorage.remove: failed to remove ${key}`, err);
    }
  },
};
