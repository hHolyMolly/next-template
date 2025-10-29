import { type NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

const withNextIntl = createNextIntlPlugin('./src/services/i18n/request.ts');
export default withNextIntl(nextConfig);
