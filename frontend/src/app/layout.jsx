import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AchievementNotificationManager from '@/app/ui/achievements/achievement-notification-manager';
import Providers from './providers';

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
  description: 'An app focused on making learning fun through gamification',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Achievement notifications - appears above all content */}
        <AchievementNotificationManager />
      </body>
    </html>
  );
}