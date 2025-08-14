import ErrorBoundary from '@/components/ErrorBoundary';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import PWALifecycle from './ui/pwa-lifecycle';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'ELO Learning',
  description:
    'Transform the way you engage with math practice through gamified, adaptive learning experiences.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ELO Learning',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'ELO Learning',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#BD86F8',
    'msapplication-config': '/browserconfig.xml',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 0,
  viewportFit: 'cover',
  themeColor: '#BD86F8',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>{/* Debug utilities removed: debug.js no longer exists */}</head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            <PWALifecycle />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
