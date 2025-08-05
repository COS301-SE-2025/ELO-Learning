'use client';

import CachingExample from '../../components/CachingExample';

export default function TestCachePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 Cache Testing Dashboard
        </h1>

        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">How to Test:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure you're logged in</li>
            <li>Open Browser Dev Tools (F12) → Application → Local Storage</li>
            <li>Try the buttons below and watch the cache update</li>
            <li>Refresh the page and see data load instantly from cache</li>
            <li>Test both login methods (email/password and Google OAuth)</li>
          </ol>
        </div>

        <CachingExample />

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">What to Check:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <strong>Local Storage:</strong> Should see cached session and user
              data
            </li>
            <li>
              <strong>Network Tab:</strong> Fewer API calls on subsequent page
              loads
            </li>
            <li>
              <strong>Performance:</strong> Instant user data loading after
              refresh
            </li>
            <li>
              <strong>Cross-tab updates:</strong> Open multiple tabs and test
              data sync
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
