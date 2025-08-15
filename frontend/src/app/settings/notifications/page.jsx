'use client';
import Back from '@/app/ui/back';
import NotificationSettings from '@/components/NotificationSettings.jsx';
import { useSession } from 'next-auth/react';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  console.log('NotificationsPage session:', session);

  if (status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Authentication Required
          </h2>
          <p>Please sign in to manage your notification settings.</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No User Data</h2>
          <p>Unable to load user information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div>
        <Back pagename="Notifications" />
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Push Notifications</h1>
          <p className="text-gray-600">
            Manage your notification preferences and test the push notification
            system.
          </p>
        </div>

        {/* Notification Settings Component */}
        <NotificationSettings
          userId={session.user.id}
          accessToken={session.backendToken}
        />

        {/* Additional Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 About Push Notifications
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              <strong>🎉 Level Up:</strong> Get notified when you reach a new
              level
            </p>
            <p>
              <strong>🏆 Achievements:</strong> Celebrate when you unlock new
              achievements
            </p>
            <p>
              <strong>🎮 Game Invites:</strong> Receive invitations from friends
            </p>
            <p>
              <strong>📚 Practice Reminders:</strong> Daily reminders to keep
              learning
            </p>
            <p>
              <strong>📢 Updates:</strong> Important announcements from ELO
              Learning
            </p>
          </div>
        </div>

        {/* Quick Test Section */}
        <div className="mt-6 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3">🧪 Quick Test</h3>
          <p className="text-sm text-gray-600 mb-4">
            Test different types of notifications to see how they work:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={async () => {
                await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/notifications/send-level-up`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(session?.backendToken && {
                        Authorization: `Bearer ${session.backendToken}`,
                      }),
                    },
                    body: JSON.stringify({
                      userId: session.user.id,
                      newLevel: 10,
                    }),
                  },
                );
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              🎉 Test Level Up
            </button>

            <button
              onClick={async () => {
                await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/notifications/send-achievement`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(session?.backendToken && {
                        Authorization: `Bearer ${session.backendToken}`,
                      }),
                    },
                    body: JSON.stringify({
                      userId: session.user.id,
                      achievementName: 'Math Master',
                    }),
                  },
                );
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              🏆 Test Achievement
            </button>

            <button
              onClick={async () => {
                await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/notifications/send-test`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(session?.backendToken && {
                        Authorization: `Bearer ${session.backendToken}`,
                      }),
                    },
                    body: JSON.stringify({
                      userId: session.user.id,
                      title: '🎮 Game Invitation',
                      body: 'Alex challenged you to a math duel!',
                    }),
                  },
                );
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              🎮 Test Game Invite
            </button>

            <button
              onClick={async () => {
                await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/notifications/send-test`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(session?.backendToken && {
                        Authorization: `Bearer ${session.backendToken}`,
                      }),
                    },
                    body: JSON.stringify({
                      userId: session.user.id,
                      title: '📚 Practice Reminder',
                      body: 'Time for your daily math practice!',
                    }),
                  },
                );
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              📚 Test Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
