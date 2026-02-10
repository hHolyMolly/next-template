const website_url = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';

const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

export const urls = {
  website: website_url,

  server: {
    api: server_url ? `${server_url}/api` : '/api/proxy',
  },
} as const;
