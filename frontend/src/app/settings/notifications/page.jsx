'use client';
import React from 'react';
import Back from '@/app/ui/back';
import NotificationSettings from '@/components/NotificationSettings.jsx';
import { useSession } from 'next-auth/react';

export default function NotificationsPage() {
  // Community page styles
  const cardClass =
    'bg-elo-bg border border-gray-200 rounded-xl shadow-lg p-4 md:p-6 w-full';
  const btnClass =
    'main-button-landing px-2 py-1 rounded-lg text-white bg-elo-primary hover:bg-elo-primary-dark transition w-full md:w-auto text-xs font-semibold';
  const rejectBtnClass =
    'secondary-button px-2 py-1 rounded-lg text-white bg-elo-secondary hover:bg-elo-secondary-dark transition w-full md:w-auto text-xs font-semibold';
  const { data: session, status } = useSession();
  const [pendingError, setPendingError] = React.useState('');
  const [incomingRequests, setIncomingRequests] = React.useState([]);
  React.useEffect(() => {
    async function fetchIncoming() {
      if (!session?.user?.id) return;
      try {
        const token =
          session.backendToken ||
          session.user.accessToken ||
          session.accessToken;
        const api = await import('../../../services/api');
        const response = await api.fetchIncomingFriendRequests(
          session.user.id,
          token,
        );
        if (Array.isArray(response)) {
          setIncomingRequests(response);
          setPendingError('');
        } else {
          setIncomingRequests([]);
          setPendingError(response.error || 'Failed to fetch friend requests');
        }
      } catch (err) {
        setIncomingRequests([]);
        setPendingError('Failed to fetch friend requests');
      }
    }
    fetchIncoming();
  }, [session]);

  // --- Accept/Reject Handlers ---
  const handleAccept = async (requestId) => {
    if (!session?.user?.id) return;
    try {
      const token =
        session.backendToken || session.user.accessToken || session.accessToken;
      const api = await import('../../../services/api');
      await apiAcceptFriendRequest(session.user.id, requestId, token);
      // Remove accepted request from UI
      setIncomingRequests((prev) =>
        prev.filter((r) => r.request_id !== requestId),
      );
    } catch (err) {
      setPendingError('Failed to accept friend request');
    }
  };

  const handleReject = async (requestId) => {
    if (!session?.user?.id) return;
    try {
      const token =
        session.backendToken || session.user.accessToken || session.accessToken;
      const api = await import('../../../services/api');
      await apiRejectFriendRequest(session.user.id, requestId, token);
      // Remove rejected request from UI
      setIncomingRequests((prev) =>
        prev.filter((r) => r.request_id !== requestId),
      );
    } catch (err) {
      setPendingError('Failed to reject friend request');
    }
  };

  // API helpers for accept/reject
  async function apiAcceptFriendRequest(userId, requestId, token) {
    const { default: axios } = await import('axios');
    return axios.post(
      `/user/${userId}/friend-accept`,
      { request_id: requestId },
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
  }
  async function apiRejectFriendRequest(userId, requestId, token) {
    const { default: axios } = await import('axios');
    return axios.post(
      `/user/${userId}/friend-reject`,
      { request_id: requestId },
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
  }
  if (!session || !session.user) {
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
      <div className="mb-6">
        <Back pagename="Notifications" />
      </div>

      {/* Pending Friend Requests Section */}
      <div className="mb-6 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2">Friend Requests</h2>
        {pendingError && (
          <p className="text-red-500 mb-2 text-center">{pendingError}</p>
        )}
        {Array.isArray(incomingRequests) && incomingRequests.length === 0 ? (
          <p className="text-gray-500 text-center">
            No incoming friend requests.
          </p>
        ) : (
          <div className="w-full max-w-lg space-y-3">
            {Array.isArray(incomingRequests) &&
              incomingRequests.map((req) => (
                <div
                  key={req.request_id}
                  className={cardClass + ' flex flex-col gap-2'}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-elo-primary truncate">
                        {req.sender_name} {req.sender_surname}
                      </span>
                      <span className="text-xs text-elo-primary truncate">
                        {req.sender_email}
                      </span>
                    </div>
                    <div className="flex gap-2 w-32">
                      <button
                        className={btnClass}
                        onClick={() => handleAccept(req.request_id)}
                      >
                        Accept
                      </button>
                      <button
                        className={rejectBtnClass}
                        onClick={() => handleReject(req.request_id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Push Notifications Section - Only Enable Button */}
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col items-center justify-center">
        <NotificationSettings
          userId={session.user.id}
          accessToken={session.backendToken}
        />
      </div>
    </div>
  );
}
