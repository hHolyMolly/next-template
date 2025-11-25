const website_url = process.env.NEXT_PUBLIC_CLIENT_URL;

const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

const urls = {
  website: website_url,

  server: {
    base: server_url,
    api: `${server_url}/api`,
  },
} as const;

export default urls;
