import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ifbpkwlfrsgstdapteqh.supabase.co',
        pathname: '/storage/v1/object/public/profile-pics/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  devIndicators: false,
  // Only enable PWA in production or when not using Turbopack
  ...(process.env.NODE_ENV === 'production' && {
    experimental: {
      turbo: {
        // Turbopack configuration can go here if needed
      },
    },
  }),
};

// Conditionally apply PWA only in production builds
const config =
  process.env.NODE_ENV === 'production'
    ? withPWA({
        dest: 'public',
        register: true,
        skipWaiting: true,
        disable: false,
        fallbacks: {
          document: '/offline',
        },
      })(nextConfig)
    : withPWA({
        dest: 'public',
        register: true,
        skipWaiting: true,
        disable: false, // Enable PWA in development too
        fallbacks: {
          document: '/offline',
        },
      })(nextConfig);

export default config;
