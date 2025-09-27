'use client';

import Back from '@/app/ui/back';
import {
  fetchCommunityLeaderboard,
  fetchInstitutionLeaderboard,
  fetchLocationLeaderboards,
} from '@/services/api';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LeaderboardTable from '../../ui/leaderboard-table';

export default function CommunityRankingsPage() {
  const { data: session, status } = useSession();
  const [communityLeaderboard, setCommunityLeaderboard] = useState([]);
  const [institutionLeaderboard, setInstitutionLeaderboard] = useState([]);
  const [institutionName, setInstitutionName] = useState('');
  const [locationLeaderboards, setLocationLeaderboards] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadLeaderboards() {
      try {
        setLoading(true);
        setError(null);
        if (!session?.user?.id) {
          setCommunityLeaderboard([]);
          setInstitutionLeaderboard([]);
          setLocationLeaderboards({});
          setLoading(false);
          setError('Session missing. Please log in.');
          return;
        }
        const [communityData, institutionData, locationData] =
          await Promise.all([
            fetchCommunityLeaderboard(session.user.id, session.token),
            fetchInstitutionLeaderboard(session.user.id, session.token),
            fetchLocationLeaderboards(session.user.id, session.token),
          ]);
        setCommunityLeaderboard(
          Array.isArray(communityData.leaderboard)
            ? communityData.leaderboard
            : [],
        );
        setInstitutionLeaderboard(
          Array.isArray(institutionData.leaderboard)
            ? institutionData.leaderboard
            : [],
        );
        setInstitutionName(institutionData.institution || '');
        setLocationLeaderboards(locationData || {});
        console.log(
          '[COMMUNITY RANKINGS] institutionLeaderboard:',
          institutionData,
        );
        console.log('[COMMUNITY RANKINGS] locationLeaderboards:', locationData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load leaderboards.');
        setLoading(false);
      }
    }
    if (status === 'loading') return;
    if (status === 'authenticated') {
      loadLeaderboards();
    }
  }, [status, session?.user?.id, session?.token]);

  // Check if user has institution/locations
  const hasInstitution = session?.user?.institution;
  const hasLocations = Array.isArray(session?.user?.location)
    ? session.user.location.length > 0
    : !!session?.user?.location;
  const noLeaderboards =
    (!communityLeaderboard || communityLeaderboard.length === 0) &&
    (!institutionLeaderboard || institutionLeaderboard.length === 0) &&
    (!locationLeaderboards || Object.keys(locationLeaderboards).length === 0);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Back header */}
      <div>
        <Back pagename="Community" />
      </div>
      {loading ? (
        <div>Loading leaderboards...</div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      ) : institutionLeaderboard.length === 0 &&
        Object.keys(locationLeaderboards).length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">
            No leaderboards available. Add your institution and location to see
            more rankings!
          </p>
          <Link href="/settings/community">
            <button className="secondary-button">Configure Community</button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Institution leaderboard */}
          {institutionLeaderboard && institutionLeaderboard.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-center">
                Institution Leaderboard
              </h2>
              {institutionName && (
                <h3 className="text-lg font-medium mb-2 text-center text-elo-secondary">
                  {institutionName}
                </h3>
              )}
              <LeaderboardTable
                users={[...institutionLeaderboard].sort(
                  (a, b) => (b.xp ?? 0) - (a.xp ?? 0),
                )}
              />
            </div>
          )}
          {/* Location leaderboards */}
          {locationLeaderboards &&
            Object.keys(locationLeaderboards).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2 text-center">
                  Location Leaderboards
                </h2>
                {Object.entries(locationLeaderboards).map(([loc, lb]) =>
                  lb && lb.length > 0 ? (
                    <div key={loc} className="mb-4">
                      <h3 className="text-lg font-medium mb-1 text-center">
                        {(() => {
                          let locName = loc;
                          if (typeof locName === 'string') {
                            let parsed = null;
                            try {
                              parsed = JSON.parse(locName);
                            } catch {
                              // Use regex to extract all quoted words, fallback to showing as is
                              const regex = /"([^"]+)"|'([^']+)'/g;
                              let matches = [];
                              let m;
                              while ((m = regex.exec(locName)) !== null) {
                                matches.push(m[1] || m[2]);
                              }
                              if (matches.length > 0) {
                                parsed = matches;
                              } else {
                                // fallback: remove brackets and quotes
                                parsed = [
                                  locName.replace(/[[\]"']/g, '').trim(),
                                ];
                              }
                            }
                            if (Array.isArray(parsed)) {
                              locName = parsed.join(', ');
                            } else if (parsed) {
                              locName = String(parsed);
                            }
                          } else if (Array.isArray(locName)) {
                            locName = locName.join(', ');
                          }
                          return locName;
                        })()}
                      </h3>
                      <LeaderboardTable
                        users={[...lb].sort(
                          (a, b) => (b.xp ?? 0) - (a.xp ?? 0),
                        )}
                      />
                    </div>
                  ) : null,
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
