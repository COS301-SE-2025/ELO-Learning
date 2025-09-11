import express from 'express';
import { supabase } from '../database/supabaseClient.js';
import {
  checkBadgeCollectorAchievement,
  checkLeaderboardAchievements,
  checkMatchAchievements,
  checkQuestionAchievements,
  checkStreakAchievements,
} from './achievementRoutes.js';
import {
  cacheSuccessfulResponse,
  idempotencyMiddleware,
} from './middleware/idempotency.js';
import { checkAllProgressAchievements } from './progressAchievements.js';
import {
  calculateExpectedRating,
  updateEloRating,
} from './utils/eloCalculator.js';
import { formatAchievementsForResponse } from './utils/gameplayAchievementNotifier.js';
import { updateUserStreak } from './utils/streakCalculator.js';
import { checkAndUpdateRankAndLevel } from './utils/userProgression.js';
import { calculateMultiplayerXP } from './utils/xpCalculator.js';

const router = express.Router();

// NEW: track in-progress processing by fingerprint so concurrent requests can await the same result
const processingMap = new Map();

// Apply idempotency middleware directly to the route
router.post('/multiplayer', idempotencyMiddleware, async (req, res) => {
  const startTime = Date.now();

  // If we have a fingerprint, use it to prevent concurrent processing of the same match.
  const fingerprint = req.matchFingerprint;

  // If another request is already processing this fingerprint, await its result and return it.
  if (fingerprint && processingMap.has(fingerprint)) {
    console.log(
      `🔁 IDEMPOTENCY: Duplicate request detected for fingerprint ${fingerprint}, awaiting existing processing...`,
    );
    try {
      const existingPromise = processingMap.get(fingerprint);
      const existingResult = await existingPromise;
      console.log(
        `🔁 IDEMPOTENCY: Returning existing cached result for fingerprint ${fingerprint}`,
      );
      return res.status(200).json(existingResult);
    } catch (err) {
      console.error(
        `❌ IDEMPOTENCY: Error while awaiting existing processing for ${fingerprint}:`,
        err,
      );
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Create a deferred promise for this fingerprint so duplicates can await it.
  let resolveProcessing;
  let rejectProcessing;
  if (fingerprint) {
    const processingPromise = new Promise((resolve, reject) => {
      resolveProcessing = resolve;
      rejectProcessing = reject;
    });
    processingMap.set(fingerprint, processingPromise);
  }

  try {
    console.log('Using multiplayer route... --------------------');
    console.log('Received multiplayer request:', req.body);

    // Log idempotency status
    if (req.matchFingerprint) {
      console.log(
        `🔍 IDEMPOTENCY: Processing new match with fingerprint: ${req.matchFingerprint}`,
      );
    } else {
      console.log(
        '⚠️ IDEMPOTENCY: No fingerprint found - middleware may not be working',
      );
    }

    const { player1_id, player2_id, score1, xpTotal } = req.body;

    if (
      !player1_id ||
      !player2_id ||
      (score1 !== 0 && score1 !== 0.5 && score1 !== 1) ||
      typeof xpTotal !== 'number' ||
      xpTotal <= 0
    ) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    // Fetch players' current XP + level
    const { data: playersData, error: playersError } = await supabase
      .from('Users')
      .select('id, xp, currentLevel, elo_rating')
      .in('id', [player1_id, player2_id]);

    if (playersError || playersData.length !== 2) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    const player1 = playersData.find((p) => p.id === player1_id);
    const player2 = playersData.find((p) => p.id === player2_id);

    // Expected outcomes
    const expected1 = calculateExpectedRating(
      player1.elo_rating,
      player2.elo_rating,
    );
    const expected2 = calculateExpectedRating(
      player2.elo_rating,
      player1.elo_rating,
    );

    //Actual outcomes
    const actual1 = score1;
    const actual2 = 1 - score1;

    // Update ELO ratings
    const newElo1 = parseFloat(
      updateEloRating({
        rating: player1.elo_rating,
        expected: expected1,
        actual: actual1,
      }),
    );

    const newElo2 = parseFloat(
      updateEloRating({
        rating: player2.elo_rating,
        expected: expected2,
        actual: actual2,
      }),
    );

    const eloChange1 = newElo1 - player1.elo_rating;
    const eloChange2 = newElo2 - player2.elo_rating;

    //Distribute XP based on expected outcomes and actual scores
    const [xp1_raw, xp2_raw] = calculateMultiplayerXP(
      xpTotal,
      expected1,
      expected2,
      score1,
    );

    // Ensure players don't lose XP
    const updatedXP1 = Math.max(0, player1.xp + xp1_raw);
    const updatedXP2 = Math.max(0, player2.xp + xp2_raw);

    const { newLevel: newLevel1, newRank: newRank1 } =
      await checkAndUpdateRankAndLevel({
        user_id: player1_id,
        newXP: updatedXP1,
        newElo: newElo1,
        supabase,
      });

    const { newLevel: newLevel2, newRank: newRank2 } =
      await checkAndUpdateRankAndLevel({
        user_id: player2_id,
        newXP: updatedXP2,
        newElo: newElo2,
        supabase,
      });

    //update players' data in the database
    await supabase
      .from('Users')
      .update({
        xp: updatedXP1,
        currentLevel: newLevel1,
        elo_rating: newElo1,
        rank: newRank1,
      })
      .eq('id', player1_id);

    await supabase
      .from('Users')
      .update({
        xp: updatedXP2,
        currentLevel: newLevel2,
        elo_rating: newElo2,
        rank: newRank2,
      })
      .eq('id', player2_id);

    // Insert attempt records
    const attemptDate = new Date().toISOString();

    const inserts = [
      {
        question_id: null,
        user_id: player1_id,
        isCorrect: score1 === 1,
        timeSpent: null,
        ratingBefore: player1.xp,
        ratingAfter: updatedXP1,
        ratingChange: parseFloat(xp1_raw.toFixed(2)),
        eloBefore: player1.elo_rating,
        eloAfter: newElo1,
        eloChange: parseFloat(eloChange1.toFixed(2)),
        attemptDate,
        attemptType: 'multi',
      },
      {
        question_id: null,
        user_id: player2_id,
        isCorrect: score1 === 0,
        timeSpent: null,
        ratingBefore: player2.xp,
        ratingAfter: updatedXP2,
        ratingChange: parseFloat(xp2_raw.toFixed(2)),
        eloBefore: player2.elo_rating,
        eloAfter: newElo2,
        eloChange: parseFloat(eloChange2.toFixed(2)),
        attemptDate,
        attemptType: 'multi',
      },
    ];

    const { error: insertError } = await supabase
      .from('QuestionAttempts')
      .insert(inserts);

    if (insertError) {
      return res.status(500).json({ error: 'Error saving attempts' });
    }

    // 🎯 Check for match achievements (both players participated in a match)
    let unlockedAchievements = [];

    // Initialize achievement response variables at the start of achievement processing
    let player1AchievementResponse = null;
    let player2AchievementResponse = null;

    try {
      console.log(
        '🎯 MULTIPLAYER ACHIEVEMENT DEBUG: Starting achievement check',
      );
      console.log(
        `🔍 Player 1: ${player1_id}, Score: ${
          score1 === 1 ? 'WIN' : score1 === 0 ? 'LOSS' : 'DRAW'
        }`,
      );
      console.log(
        `🔍 Player 2: ${player2_id}, Score: ${
          1 - score1 === 1 ? 'WIN' : 1 - score1 === 0 ? 'LOSS' : 'DRAW'
        }`,
      );

      // 🆕 Check question achievements for both players (MISSING FEATURE!)
      console.log('🔍 Checking question achievements for both players...');

      // In multiplayer, both players "answered" by participating in the match
      // Unlike practice mode, both players get credit regardless of who wins
      console.log(
        `🎯 Player 1 question achievements: Both players participated in multiplayer match`,
      );
      const player1QuestionAchievements = await checkQuestionAchievements(
        player1_id,
        true, // Both players get credit for participating (answering the "question" of the match)
        'multiplayer',
      );
      console.log(
        `✅ Player 1 question achievements result:`,
        player1QuestionAchievements,
      );

      // Player 2 also gets credit for participating
      console.log(
        `🎯 Player 2 question achievements: Both players participated in multiplayer match`,
      );
      const player2QuestionAchievements = await checkQuestionAchievements(
        player2_id,
        true, // Both players get credit for participating (answering the "question" of the match)
        'multiplayer',
      );
      console.log(
        `✅ Player 2 question achievements result:`,
        player2QuestionAchievements,
      );

      // Check match achievements for both players
      console.log('🔍 Checking match achievements...');
      const player1Achievements = await checkMatchAchievements(player1_id);
      const player2Achievements = await checkMatchAchievements(player2_id);
      console.log(
        `✅ Match achievements - Player 1: ${player1Achievements.length}, Player 2: ${player2Achievements.length}`,
      );

      // Check leaderboard position achievements after XP changes
      console.log('🔍 Checking leaderboard achievements...');
      const player1LeaderboardAchievements =
        await checkLeaderboardAchievements(player1_id);
      const player2LeaderboardAchievements =
        await checkLeaderboardAchievements(player2_id);
      console.log(
        `✅ Leaderboard achievements - Player 1: ${player1LeaderboardAchievements.length}, Player 2: ${player2LeaderboardAchievements.length}`,
      );

      // Always check Badge Collector achievement for both players to ensure count accuracy
      console.log('🔍 Checking Badge Collector achievements...');
      const player1BadgeCollectorAchievements =
        await checkBadgeCollectorAchievement(player1_id);
      const player2BadgeCollectorAchievements =
        await checkBadgeCollectorAchievement(player2_id);
      console.log(
        `✅ Badge Collector achievements - Player 1: ${player1BadgeCollectorAchievements.length}, Player 2: ${player2BadgeCollectorAchievements.length}`,
      );

      // 🔥 Update daily streaks and check streak achievements for both players
      console.log('🔍 Updating streaks for both players...');

      // Player 1 streak update
      const player1StreakResult = await updateUserStreak(player1_id);
      console.log(`✅ Player 1 streak update:`, player1StreakResult);

      let player1StreakAchievements = [];
      if (
        player1StreakResult.success &&
        player1StreakResult.currentStreak > 0
      ) {
        player1StreakAchievements = await checkStreakAchievements(
          player1_id,
          player1StreakResult.currentStreak,
        );
        console.log(
          `🔥 Player 1 streak achievements:`,
          player1StreakAchievements,
        );
      }

      // Player 2 streak update
      const player2StreakResult = await updateUserStreak(player2_id);
      console.log(`✅ Player 2 streak update:`, player2StreakResult);

      let player2StreakAchievements = [];
      if (
        player2StreakResult.success &&
        player2StreakResult.currentStreak > 0
      ) {
        player2StreakAchievements = await checkStreakAchievements(
          player2_id,
          player2StreakResult.currentStreak,
        );
        console.log(
          `🔥 Player 2 streak achievements:`,
          player2StreakAchievements,
        );
      }

      // 🆕 Check progress achievements (Personal Best, Comeback, Consecutive Improvements) for both players
      console.log('🔍 Checking progress achievements for both players...');
      console.log(
        `🔍 DEBUG - About to call checkAllProgressAchievements with calculated values:`,
      );
      console.log(
        `🔍 Player 1 ELO calculation: ${player1.elo_rating} + ${eloChange1} = ${newElo1}`,
      );
      console.log(
        `🔍 Player 2 ELO calculation: ${player2.elo_rating} + ${eloChange2} = ${newElo2}`,
      );

      // Player 1 progress achievements
      console.log(
        `🎯 Checking progress achievements for Player 1: ELO ${
          player1.elo_rating
        } → ${newElo1} (${eloChange1 >= 0 ? '+' : ''}${eloChange1})`,
      );
      let player1ProgressAchievements = [];
      try {
        player1ProgressAchievements = await checkAllProgressAchievements(
          player1_id, // Player 1 ID
          newElo1, // Player 1's new ELO after this match
          player1.elo_rating, // Player 1's ELO before this match
          eloChange1, // Player 1's ELO change amount
        );
        console.log(`✅ Player 1 progress achievements result:`, {
          count: player1ProgressAchievements.length,
          achievements: player1ProgressAchievements.map((a) => ({
            name: a.name,
            id: a.id,
          })),
        });
      } catch (error) {
        console.error(`❌ Error in Player 1 progress achievements:`, error);
      }

      // Player 2 progress achievements
      console.log(
        `🎯 Checking progress achievements for Player 2: ELO ${
          player2.elo_rating
        } → ${newElo2} (${eloChange2 >= 0 ? '+' : ''}${eloChange2})`,
      );
      let player2ProgressAchievements = [];
      try {
        player2ProgressAchievements = await checkAllProgressAchievements(
          player2_id, // Player 2 ID
          newElo2, // Player 2's new ELO after this match
          player2.elo_rating, // Player 2's ELO before this match
          eloChange2, // Player 2's ELO change amount
        );
        console.log(`✅ Player 2 progress achievements result:`, {
          count: player2ProgressAchievements.length,
          achievements: player2ProgressAchievements.map((a) => ({
            name: a.name,
            id: a.id,
          })),
        });
      } catch (error) {
        console.error(`❌ Error in Player 2 progress achievements:`, error);
      }

      // Combine all achievements with player IDs
      unlockedAchievements = [
        ...player1QuestionAchievements.map((achievement) => ({
          ...achievement,
          playerId: player1_id,
        })),
        ...player2QuestionAchievements.map((achievement) => ({
          ...achievement,
          playerId: player2_id,
        })),
        ...player1Achievements.map((achievement) => ({
          ...achievement,
          playerId: player1_id,
        })),
        ...player2Achievements.map((achievement) => ({
          ...achievement,
          playerId: player2_id,
        })),
        ...player1LeaderboardAchievements.map((achievement) => ({
          ...achievement,
          playerId: player1_id,
        })),
        ...player2LeaderboardAchievements.map((achievement) => ({
          ...achievement,
          playerId: player2_id,
        })),
        ...player1BadgeCollectorAchievements.map((achievement) => ({
          ...achievement,
          playerId: player1_id,
        })),
        ...player2BadgeCollectorAchievements.map((achievement) => ({
          ...achievement,
          playerId: player2_id,
        })),
        ...player1StreakAchievements.map((achievement) => ({
          ...achievement,
          playerId: player1_id,
        })),
        ...player2StreakAchievements.map((achievement) => ({
          ...achievement,
          playerId: player2_id,
        })),
        ...player1ProgressAchievements.map((achievement) => ({
          ...achievement,
          playerId: player1_id,
        })),
        ...player2ProgressAchievements.map((achievement) => ({
          ...achievement,
          playerId: player2_id,
        })),
      ];

      console.log(
        `🏆 Multiplayer match achievements unlocked: ${unlockedAchievements.length}`,
      );

      // Log detailed achievement breakdown
      const player1Question = unlockedAchievements.filter(
        (ach) =>
          ach.playerId === player1_id &&
          (ach.name === 'New Challenger' || ach.name?.includes('Question')),
      );
      const player2Question = unlockedAchievements.filter(
        (ach) =>
          ach.playerId === player2_id &&
          (ach.name === 'New Challenger' || ach.name?.includes('Question')),
      );
      const player1Progress = unlockedAchievements.filter(
        (ach) =>
          ach.playerId === player1_id &&
          (ach.name === 'Peak Performance' ||
            ach.name === 'Comeback Kid' ||
            ach.name === 'Consistent Climber'),
      );
      const player2Progress = unlockedAchievements.filter(
        (ach) =>
          ach.playerId === player2_id &&
          (ach.name === 'Peak Performance' ||
            ach.name === 'Comeback Kid' ||
            ach.name === 'Consistent Climber'),
      );

      if (player1Question.length > 0) {
        console.log(
          `🎯 Player 1 question achievements: ${player1Question
            .map((a) => a.name)
            .join(', ')}`,
        );
      }
      if (player2Question.length > 0) {
        console.log(
          `🎯 Player 2 question achievements: ${player2Question
            .map((a) => a.name)
            .join(', ')}`,
        );
      }
      if (player1Progress.length > 0) {
        console.log(
          `🎯 Player 1 progress achievements: ${player1Progress
            .map((a) => a.name)
            .join(', ')}`,
        );
      }
      if (player2Progress.length > 0) {
        console.log(
          `🎯 Player 2 progress achievements: ${player2Progress
            .map((a) => a.name)
            .join(', ')}`,
        );
      }

      // Debug: Show total achievements by type
      console.log(`📊 Achievement breakdown:`, {
        total: unlockedAchievements.length,
        player1: unlockedAchievements.filter(
          (ach) => ach.playerId === player1_id,
        ).length,
        player2: unlockedAchievements.filter(
          (ach) => ach.playerId === player2_id,
        ).length,
        questionAchievements: player1Question.length + player2Question.length,
        progressAchievements: player1Progress.length + player2Progress.length,
      });

      // 🆕 NEW: Show notifications for each player's achievements
      if (unlockedAchievements.length > 0) {
        // Group achievements by player
        const player1NewAchievements = unlockedAchievements.filter(
          (ach) => ach.playerId === player1_id,
        );
        const player2NewAchievements = unlockedAchievements.filter(
          (ach) => ach.playerId === player2_id,
        );

        if (player1NewAchievements.length > 0) {
          try {
            player1AchievementResponse = formatAchievementsForResponse(
              player1NewAchievements,
              player1_id,
              true,
            );
            console.log(
              `🏆 Formatted ${player1NewAchievements.length} achievements for player 1`,
            );
          } catch (error) {
            console.error('❌ Error formatting player 1 achievements:', error);
          }
        }

        if (player2NewAchievements.length > 0) {
          try {
            player2AchievementResponse = formatAchievementsForResponse(
              player2NewAchievements,
              player2_id,
              true,
            );
            console.log(
              `🏆 Formatted ${player2NewAchievements.length} achievements for player 2`,
            );
          } catch (error) {
            console.error('❌ Error formatting player 2 achievements:', error);
          }
        }
      }
    } catch (achievementError) {
      console.error('❌ MULTIPLAYER ACHIEVEMENT ERROR:', achievementError);
      console.error('❌ Achievement error stack:', achievementError.stack);

      // Log specific details about duplicate key errors
      if (
        achievementError.message &&
        achievementError.message.includes(
          'duplicate key value violates unique constraint',
        )
      ) {
        console.log(
          '🔄 DUPLICATE KEY CONFLICT DETECTED: This is expected behavior when the same match is processed twice',
        );
        console.log(
          '🔄 Achievement system handled the conflict gracefully - continuing with response',
        );
      }

      // Don't fail the whole request if achievements fail
    }

    console.log('Player1 XP change:', xp1_raw);
    console.log('Player2 XP change:', xp2_raw);

    // Final JSON response
    const finalResponse = {
      message: 'Multiplayer match processed successfully',
      players: [
        {
          id: player1_id,
          xpEarned: parseFloat(xp1_raw.toFixed(2)),
          eloChange: parseFloat(eloChange1.toFixed(2)),
          newXP: updatedXP1,
          newElo: newElo1,
          currentLevel: newLevel1,
          currentRank: newRank1,
          achievements: player1AchievementResponse?.achievements || [],
          achievementSummary:
            player1AchievementResponse?.achievementSummary || null,
        },
        {
          id: player2_id,
          xpEarned: parseFloat(xp2_raw.toFixed(2)),
          eloChange: parseFloat(eloChange2.toFixed(2)),
          newXP: updatedXP2,
          newElo: newElo2,
          currentLevel: newLevel2,
          currentRank: newRank2,
          achievements: player2AchievementResponse?.achievements || [],
          achievementSummary:
            player2AchievementResponse?.achievementSummary || null,
        },
      ],
      unlockedAchievements: unlockedAchievements,
    };

    // Cache the successful response for idempotency
    cacheSuccessfulResponse(req, finalResponse);

    // Resolve any waiting duplicate requests with the same final response
    if (fingerprint && resolveProcessing) {
      try {
        resolveProcessing(finalResponse);
      } catch (e) {
        console.error(
          `❌ Error resolving processing promise for fingerprint ${fingerprint}:`,
          e,
        );
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(
      `✅ MULTIPLAYER: Successfully processed match in ${processingTime}ms`,
    );
    if (req.matchFingerprint) {
      console.log(
        `💾 IDEMPOTENCY: Cached response for fingerprint: ${req.matchFingerprint}`,
      );
    }

    return res.status(200).json(finalResponse);
  } catch (err) {
    // Reject waiting duplicates so they know processing failed
    if (fingerprint && rejectProcessing) {
      try {
        rejectProcessing(err);
      } catch (e) {
        console.error(
          `❌ Error rejecting processing promise for fingerprint ${fingerprint}:`,
          e,
        );
      }
    }

    const processingTime = Date.now() - startTime;
    console.error(`❌ MULTIPLAYER: Error after ${processingTime}ms:`, err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ error: 'Server error' });
  } finally {
    // Clean up in-progress tracking
    if (fingerprint) {
      processingMap.delete(fingerprint);
    }
  }
});

export default router;
