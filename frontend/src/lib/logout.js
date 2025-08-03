import { signOut } from 'next-auth/react';
import { deleteCookie } from '../app/lib/authCookie';

/**
 * Comprehensive logout function that clears all authentication data
 * Works for both OAuth users and credential users
 */
export async function performLogout() {
  try {
    // Clear custom auth cookie (for credential users) - non-blocking
    deleteCookie().catch(console.error);

    // Clear localStorage (if used) - immediate and lightweight
    if (typeof window !== 'undefined') {
      localStorage.clear(); // Clear ALL localStorage
      sessionStorage.clear(); // Clear ALL sessionStorage
    }

    // Clear all cookies manually first (more aggressive)
    if (typeof window !== 'undefined') {
      // Get all cookies and clear them
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        // Clear for current domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        // Clear for domain with dot prefix
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        // Clear for localhost
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`;
      });

      // Extra aggressive clearing - NextAuth specific cookies
      const nextAuthCookies = [
        'next-auth.session-token',
        'next-auth.csrf-token',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.csrf-token',
      ];
      nextAuthCookies.forEach((cookieName) => {
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`;
      });
    }

    // Sign out from NextAuth (for OAuth users and credentials)
    await signOut({
      callbackUrl: '/', // Redirect to home page after logout
      redirect: true,
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Fallback: redirect to home page even if there's an error
    if (typeof window !== 'undefined') {
      // Force reload to clear any cached data
      window.location.href = '/';
      window.location.reload();
    }
  }
}
