'use client';

import { useEffect, useState } from 'react';
import {
  sessionManager,
  useSessionWithCache,
} from '../hooks/useSessionWithCache';
import { enhancedAPI } from '../services/enhancedAPI';
import { cache, CACHE_KEYS } from '../utils/cache';

export default function CachingExample() {
  const session = useSessionWithCache();
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session.status === 'authenticated') {
      setXp(session.getXP());
    }
  }, [session]);

  const handleUpdateXP = async () => {
    if (!session?.user?.id || loading) {
      return;
    }

    setLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      const newXP = xp + 100; // Award 100 XP

      // This will update both the API and the cached session data
      await enhancedAPI.updateUserXP(session.user.id, newXP);

      // Update local state
      setXp(newXP);

      console.log('XP updated successfully!');
    } catch (error) {
      console.error('Failed to update XP:', error);
      setError('Failed to update XP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    cache.clear();
    console.log('Cache cleared!');
  };

  const handleSignOut = async () => {
    await sessionManager.signOut();
  };

  if (session.status === 'loading') {
    return <div className="p-4">Loading session...</div>;
  }

  if (session.status === 'unauthenticated') {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Not authenticated</h2>
        <p className="mb-4">Please log in to see this example.</p>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold mb-2">🔍 Debugging Info:</h3>
          <p className="text-sm mb-2">
            If you're having login issues, check the browser console for error
            messages.
          </p>
          <p className="text-sm mb-2">
            <strong>For email/password:</strong> Make sure you have an account
            created via the register page.
          </p>
          <p className="text-sm">
            <strong>For Google OAuth:</strong> This should work immediately.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">NextAuth + Caching Example</h2>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Session Data</h3>
          <p>Username: {session.getUsername()}</p>
          <p>XP: {xp}</p>
          <p>Email: {session?.user?.email}</p>
          <p>Provider: {session?.user?.email ? 'credentials' : 'google'}</p>
          <p className="text-xs text-gray-600">User ID: {session?.user?.id}</p>
          <p className="text-xs text-gray-600">Status: {session.status}</p>
        </div>

        <div className="space-y-2">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleUpdateXP}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Updating XP...' : 'Award 100 XP (Test Cache Update)'}
          </button>

          <button
            onClick={handleClearCache}
            disabled={loading}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Clear Cache
          </button>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Sign Out
          </button>
        </div>

        <div className="p-4 bg-green-100 rounded">
          <h3 className="font-semibold mb-2">Caching Benefits</h3>
          <ul className="text-sm space-y-1">
            <li>✅ Session data is cached for faster access</li>
            <li>✅ API responses are cached to reduce network calls</li>
            <li>✅ User data stays consistent across components</li>
            <li>✅ Automatic cache updates when data changes</li>
            <li>✅ Works with both Google OAuth and email/password</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-semibold mb-2">Cache Status</h3>
          <pre className="text-xs">
            {JSON.stringify(
              {
                hasSession: !!cache.get(CACHE_KEYS.NEXTAUTH_SESSION),
                hasUser: !!cache.get(CACHE_KEYS.USER),
                hasLeaderboard: !!cache.get(CACHE_KEYS.LEADERBOARD),
                hasQuestions: !!cache.get(CACHE_KEYS.QUESTIONS),
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
