import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Set your Sentry DSN in your environment variables
  tracesSampleRate: 1.0,
  // Add other Sentry options here as needed
});
