'use client';

import { SessionProvider } from 'next-auth/react';
import { AvatarProvider } from './context/avatar-context';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AvatarProvider>{children}</AvatarProvider>
    </SessionProvider>
  );
}
