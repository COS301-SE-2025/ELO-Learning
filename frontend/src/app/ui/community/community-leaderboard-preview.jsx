import Link from 'next/link';
import LeaderboardTable from '../leaderboard-table';

export default function CommunityLeaderboardPreview({
  institutionLeaderboard,
  institutionName,
  locationLeaderboards,
  loading,
}) {
  return (
    <div className="shadow-lg p-4 my-2 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl uppercase font-bold">Community</h3>
        <Link
          href="/settings/community-rankings"
          className="text-lg font-bold uppercase"
          aria-label="View community leaderboards"
        >
          <button className="text-lg font-bold uppercase text-[var(--radical-rose)]">
            VIEW ALL
          </button>
        </Link>
      </div>
      {loading ? (
        <div>Loading leaderboards...</div>
      ) : (
        <>
          {/* Institution leaderboard preview */}
          {institutionLeaderboard && institutionLeaderboard.length > 0 && (
            <div className="mb-4 w-full">
              <h4 className="text-center font-medium text-lg mb-3">
                Institution: {institutionName}
              </h4>
              <div className="w-full">
                <LeaderboardTable
                  users={[...institutionLeaderboard]
                    .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
                    .slice(0, 5)}
                />
              </div>
            </div>
          )}
          {/* Top location leaderboard preview */}
          {locationLeaderboards &&
            Object.keys(locationLeaderboards).length > 0 && (
              <div className="mb-2 w-full">
                <h4 className="text-center text-lg font-medium mb-1">
                  Top Location
                </h4>
                {(() => {
                  // Find location with most users
                  const topLoc = Object.entries(locationLeaderboards).sort(
                    ([, lbA], [, lbB]) =>
                      (lbB?.length ?? 0) - (lbA?.length ?? 0),
                  )[0];
                  if (topLoc && topLoc[1] && topLoc[1].length > 0) {
                    let locName = topLoc[0];
                    // Always try to parse stringified arrays
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
                          parsed = [locName.replace(/[[\]"']/g, '').trim()];
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
                    return (
                      <div className="flex flex-col items-center w-full">
                        <div className="text-sm mb-1 text-center">
                          {locName}
                        </div>
                        <div className="w-full">
                          <LeaderboardTable
                            users={[...topLoc[1]]
                              .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
                              .slice(0, 5)}
                          />
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
        </>
      )}
    </div>
  );
}
