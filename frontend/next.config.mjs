import { withSentryConfig } from '@sentry/nextjs';
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

export default withSentryConfig(config, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'zeroday-a0',

  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
