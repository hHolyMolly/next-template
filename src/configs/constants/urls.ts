/** Strip trailing slashes so `${base}${path}` can never produce `//`. */
const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const websiteUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000');

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
  ? trimTrailingSlash(process.env.NEXT_PUBLIC_SERVER_URL)
  : undefined;

export const urls = {
  website: websiteUrl,

  server: {
    api: serverUrl ? `${serverUrl}/api` : undefined,
  },
} as const;
