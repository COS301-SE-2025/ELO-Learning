'use client';
import React from 'react';
import Back from '@/app/ui/back';
import NotificationSettings from '@/components/NotificationSettings.jsx';
import { useSession } from 'next-auth/react';

export default function NotificationsPage() {
  // Remove handler for accepted friends
  const handleRemove = async (friendId) => {
    if (!session?.user?.id) {
      setPendingError('User not authenticated.');
      return;
    }
    try {
      const token =
        session?.user?.accessToken ||
        session?.accessToken ||
        session?.backendToken;
      const api = await import('../../../services/api');
      console.log(
        '[FRONTEND] Calling removeAcceptedFriend with:',
        session.user.id,
        friendId,
        token,
      );
      const result = await api.removeAcceptedFriend(
        session.user.id,
        friendId,
        token,
      );
      console.log('[FRONTEND] removeAcceptedFriend result:', result);
      if (result && result.message) {
        setPendingError('Friend removed!');
        await fetchIncoming();
      } else {
        setPendingError(result.error || 'Failed to remove friend.');
      }
    } catch (err) {
      console.error('[FRONTEND] Error in handleRemove:', err);
      setPendingError(err?.message || 'Failed to remove friend.');
    }
  };
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
  // Move fetchIncoming outside useEffect so it can be called after accept/reject
  const fetchIncoming = React.useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const token =
        session.backendToken || session.user.accessToken || session.accessToken;
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
  }, [session]);

  React.useEffect(() => {
    fetchIncoming();
  }, [session, fetchIncoming]);

  // --- Accept/Reject Handlers ---
  const handleAccept = async (requestId) => {
    if (!session?.user?.id) {
      setPendingError('User not authenticated.');
      return;
    }
    try {
      const token =
        session?.user?.accessToken ||
        session?.accessToken ||
        session?.backendToken;
      const api = await import('../../../services/api');
      const result = await api.apiAcceptFriendRequest(
        session.user.id,
        requestId,
        token,
      );
      if (
        result &&
        (result.status === 200 ||
          result.success ||
          result.message === 'Friend request accepted')
      ) {
        setPendingError('Accepted!');
        await fetchIncoming(); // Force refresh
      } else {
        setPendingError(result?.error || 'Failed to accept friend request.');
      }
    } catch (err) {
      setPendingError(err?.message || 'Failed to accept friend request.');
    }
  };

  const handleReject = async (requestId) => {
    if (!session?.user?.id) {
      setPendingError('User not authenticated.');
      return;
    }
    setPendingError(''); // Clear error before API call
    try {
      const token =
        session?.user?.accessToken ||
        session?.accessToken ||
        session?.backendToken;
      const api = await import('../../../services/api');
      const result = await api.apiRejectFriendRequest(
        session.user.id,
        requestId,
        token,
      );
      if (
        result &&
        (result.status === 200 ||
          result.success ||
          result.message === 'Friend request rejected')
      ) {
        setPendingError('Rejected!');
        await fetchIncoming(); // Force refresh
      } else {
        setPendingError(result?.error || 'Failed to reject friend request.');
      }
    } catch (err) {
      setPendingError(err?.message || 'Failed to reject friend request.');
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
      <div className="m-4 p-6 flex flex-col items-center border border-[#696969] rounded-md">
        <h2 className="text-xl font-bold mb-2">Friend Requests</h2>
        {pendingError && (
          <p
            className={`mb-2 text-center ${
              pendingError === 'Accepted!' ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {pendingError}
          </p>
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
                  className="flex flex-col gap-2 mx-5 w-full"
                >
                  <div className="">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-elo-primary truncate">
                        {req.sender_name} {req.sender_surname}
                      </span>
                      <span className="text-xs truncate">
                        {req.sender_email}
                      </span>
                    </div>
                    <div className="flex gap-2 w-[90%] my-5">
                      <button
                        className="main-button"
                        onClick={() => handleAccept(req.request_id)}
                      >
                        Accept
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => handleReject(req.request_id)}
                      >
                        Reject
                      </button>
                      {/* Remove button for accepted friends only */}
                      {req.status === 'accepted' && req.sender_id && (
                        <div className="main-button-landing px-2 py-1 rounded-lg text-white bg-elo-primary hover:bg-elo-primary-dark transition w-fit text-xs font-semibold flex items-center justify-center">
                          <button
                            style={{ minWidth: '60px', padding: '2px 8px' }}
                            onClick={() => handleRemove(req.sender_id)}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Push Notifications Section - Only Enable Button */}
      <div className="p-6 max-w-2xl mx-auto w-full flex flex-col items-center justify-center">
        <NotificationSettings
          userId={session.user.id}
          accessToken={session.backendToken}
        />
      </div>
    </div>
  );
}
