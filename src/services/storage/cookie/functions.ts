const customCookieStorage = {
  get<T>(name: string, fallback: T): T {
    try {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (!match) return fallback;

      return JSON.parse(decodeURIComponent(match[2]));
    } catch (err) {
      console.error(`cookie.get: failed to parse ${name}`, err);

      return fallback;
    }
  },

  set(name: string, value: unknown, options?: { path?: string; expires?: Date; maxAge?: number }) {
    try {
      const cookieValue = encodeURIComponent(
        JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)),
      );
      let cookieStr = `${name}=${cookieValue}`;

      if (options?.path) cookieStr += `; path=${options.path}`;
      if (options?.expires) cookieStr += `; expires=${options.expires.toUTCString()}`;
      if (options?.maxAge) cookieStr += `; max-age=${options.maxAge}`;

      document.cookie = cookieStr;
    } catch (err) {
      console.error(`cookie.set: failed to save ${name}`, err);
    }
  },

  remove(name: string, path = '/') {
    try {
      document.cookie = `${name}=; path=${path}; max-age=0`;
    } catch (err) {
      console.error(`cookie.remove: failed to remove ${name}`, err);
    }
  },
};

export default customCookieStorage;
