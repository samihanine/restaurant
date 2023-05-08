/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  withPlausibleProxy
} = require('next-plausible');

module.exports = withPlausibleProxy()({
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  async redirects() {
    return [{
        source: '/login',
        destination: '/signin',
        permanent: true,
      },
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  images: {
    domains: ['gkqwaqtqljdwkbntswzy.supabase.co'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
});