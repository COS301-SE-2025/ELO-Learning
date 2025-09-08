/**
 * Idempotency middleware for preventing duplicate multiplayer match processing
 * Uses match fingerprint (player IDs + timestamp) to ensure each match is processed only once
 */

import { supabase } from '../../database/supabaseClient.js';

// In-memory cache for recent requests (helps with immediate duplicates)
const recentRequests = new Map();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Generate a unique fingerprint for a multiplayer match
 */
function generateMatchFingerprint(player1_id, player2_id, score1, xpTotal) {
  // Sort player IDs to ensure consistent fingerprint regardless of order
  const players = [player1_id, player2_id].sort();

  // Create fingerprint with essential match data
  return `${players[0]}-${players[1]}-${score1}-${xpTotal}`;
}

/**
 * Check if this exact match has been processed recently
 */
async function checkDuplicateMatch(fingerprint, req) {
  try {
    // Check in-memory cache first (for immediate duplicates)
    if (recentRequests.has(fingerprint)) {
      const cachedData = recentRequests.get(fingerprint);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log(
          `🔄 IDEMPOTENCY: Found recent duplicate request for fingerprint: ${fingerprint}`,
        );
        return { isDuplicate: true, cachedResponse: cachedData.response };
      } else {
        // Expired cache entry
        recentRequests.delete(fingerprint);
      }
    }

    // Check database for recent matches (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: recentMatches, error } = await supabase
      .from('QuestionAttempts')
      .select('user_id, ratingAfter, eloAfter, attemptDate')
      .in('user_id', [req.body.player1_id, req.body.player2_id])
      .eq('attemptType', 'multi')
      .gte('attemptDate', fiveMinutesAgo)
      .order('attemptDate', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error checking for duplicate matches:', error);
      return { isDuplicate: false };
    }

    // Group by timestamp to find potential duplicates
    const matchGroups = new Map();
    recentMatches.forEach((attempt) => {
      const timestamp = attempt.attemptDate;
      if (!matchGroups.has(timestamp)) {
        matchGroups.set(timestamp, []);
      }
      matchGroups.get(timestamp).push(attempt);
    });

    // Check if we have a match with both players at the same timestamp
    for (const [timestamp, attempts] of matchGroups) {
      if (attempts.length === 2) {
        const userIds = attempts.map((a) => a.user_id).sort();
        const requestUserIds = [
          req.body.player1_id,
          req.body.player2_id,
        ].sort();

        if (
          userIds[0] === requestUserIds[0] &&
          userIds[1] === requestUserIds[1]
        ) {
          // Found exact match - this appears to be a duplicate
          console.log(
            `🔄 IDEMPOTENCY: Found duplicate match in database for timestamp: ${timestamp}`,
          );

          // Return the existing results
          const player1Data = attempts.find(
            (a) => a.user_id === req.body.player1_id,
          );
          const player2Data = attempts.find(
            (a) => a.user_id === req.body.player2_id,
          );

          return {
            isDuplicate: true,
            existingResponse: {
              message: 'Multiplayer match processed successfully (from cache)',
              players: [
                {
                  id: req.body.player1_id,
                  xpEarned: player1Data
                    ? parseFloat(
                        (
                          player1Data.ratingAfter -
                          (player1Data.ratingAfter - player1Data.ratingChange)
                        ).toFixed(2),
                      )
                    : 0,
                  eloChange: player1Data
                    ? parseFloat(
                        player1Data.eloAfter -
                          (player1Data.eloAfter - player1Data.eloChange),
                      ).toFixed(2)
                    : 0,
                  newXP: player1Data ? player1Data.ratingAfter : 0,
                  newElo: player1Data ? player1Data.eloAfter : 0,
                  achievements: [], // Don't re-trigger achievements
                  achievementSummary: null,
                },
                {
                  id: req.body.player2_id,
                  xpEarned: player2Data
                    ? parseFloat(
                        (
                          player2Data.ratingAfter -
                          (player2Data.ratingAfter - player2Data.ratingChange)
                        ).toFixed(2),
                      )
                    : 0,
                  eloChange: player2Data
                    ? parseFloat(
                        player2Data.eloAfter -
                          (player2Data.eloAfter - player2Data.eloChange),
                      ).toFixed(2)
                    : 0,
                  newXP: player2Data ? player2Data.ratingAfter : 0,
                  newElo: player2Data ? player2Data.eloAfter : 0,
                  achievements: [], // Don't re-trigger achievements
                  achievementSummary: null,
                },
              ],
              unlockedAchievements: [], // Don't re-trigger legacy achievements
              source: 'idempotency_cache',
            },
          };
        }
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Error in duplicate match check:', error);
    return { isDuplicate: false };
  }
}

/**
 * Cache the response for this request fingerprint
 */
function cacheResponse(fingerprint, response) {
  recentRequests.set(fingerprint, {
    response,
    timestamp: Date.now(),
  });

  // Clean up old cache entries
  for (const [key, value] of recentRequests.entries()) {
    if (Date.now() - value.timestamp > CACHE_DURATION) {
      recentRequests.delete(key);
    }
  }
}

/**
 * Idempotency middleware for multiplayer routes
 */
export async function idempotencyMiddleware(req, res, next) {
  try {
    // Only apply to multiplayer POST requests
    if (req.method !== 'POST' || !req.url.includes('/multiplayer')) {
      return next();
    }

    const { player1_id, player2_id, score1, xpTotal } = req.body;

    // Validate required fields
    if (!player1_id || !player2_id || score1 === undefined || !xpTotal) {
      return next(); // Let the main route handle validation errors
    }

    // Generate fingerprint for this match
    const fingerprint = generateMatchFingerprint(
      player1_id,
      player2_id,
      score1,
      xpTotal,
    );
    console.log(`🔍 IDEMPOTENCY: Checking match fingerprint: ${fingerprint}`);

    // Check for duplicates
    const duplicateCheck = await checkDuplicateMatch(fingerprint, req);

    if (duplicateCheck.isDuplicate) {
      console.log(
        `✅ IDEMPOTENCY: Returning cached response for fingerprint: ${fingerprint}`,
      );

      if (duplicateCheck.cachedResponse) {
        return res.status(200).json(duplicateCheck.cachedResponse);
      } else if (duplicateCheck.existingResponse) {
        return res.status(200).json(duplicateCheck.existingResponse);
      }
    }

    // Store fingerprint in request for caching after processing
    req.matchFingerprint = fingerprint;

    console.log(
      `✅ IDEMPOTENCY: New request, proceeding with processing: ${fingerprint}`,
    );
    next();
  } catch (error) {
    console.error('Error in idempotency middleware:', error);
    // Don't block the request if idempotency fails
    next();
  }
}

/**
 * Cache successful response after processing
 */
export function cacheSuccessfulResponse(req, response) {
  if (req.matchFingerprint && response) {
    console.log(
      `💾 IDEMPOTENCY: Caching successful response for: ${req.matchFingerprint}`,
    );
    cacheResponse(req.matchFingerprint, response);
  }
}

export { checkDuplicateMatch, generateMatchFingerprint };
