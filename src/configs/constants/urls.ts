const website_url = process.env.CLIENT_URL || `http://localhost:${process.env.VITE_PORT || 3000}`;

const server_url = process.env.SERVER_URL;

const urls = {
  website: website_url,

  server: {
    base: server_url,
    api: `${server_url}/api`,
  },
} as const;

export default urls;
