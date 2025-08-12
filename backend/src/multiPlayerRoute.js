import express from 'express';
import { supabase } from '../database/supabaseClient.js';

import { checkLeaderboardAchievements, checkMatchAchievements } from './achievementRoutes.js';
import {
    calculateExpectedRating,
    updateEloRating,
} from './utils/eloCalculator.js';
import { checkAndUpdateRankAndLevel } from './utils/userProgression.js';
import { calculateMultiplayerXP } from './utils/xpCalculator.js';
//import { calculateExpected, distributeXP } from './multiPlayer.js';

const router = express.Router();

router.post('/multiplayer', async (req, res) => {
  try {
    const { player1_id, player2_id, question_id, score1, xpTotal } = req.body;

    if (
      !player1_id ||
      !player2_id ||
      !question_id ||
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
      }).toFixed(2),
    );

    const newElo2 = parseFloat(
      updateEloRating({
        rating: player2.elo_rating,
        expected: expected2,
        actual: actual2,
      }).toFixed(2),
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
        question_id,
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
        question_id,
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
    
    try {
      // Check match achievements for both players
      const player1Achievements = await checkMatchAchievements(player1_id);
      const player2Achievements = await checkMatchAchievements(player2_id);
      
      // 🆕 Check leaderboard position achievements after XP changes
      const player1LeaderboardAchievements = await checkLeaderboardAchievements(player1_id);
      const player2LeaderboardAchievements = await checkLeaderboardAchievements(player2_id);
      
      unlockedAchievements = [
        ...player1Achievements.map(achievement => ({ ...achievement, playerId: player1_id })),
        ...player2Achievements.map(achievement => ({ ...achievement, playerId: player2_id })),
        ...player1LeaderboardAchievements.map(achievement => ({ ...achievement, playerId: player1_id })),
        ...player2LeaderboardAchievements.map(achievement => ({ ...achievement, playerId: player2_id }))
      ];
      
      console.log(`🏆 Multiplayer match achievements unlocked: ${unlockedAchievements.length}`);
    } catch (achievementError) {
      console.error('Error checking match achievements:', achievementError);
      // Don't fail the whole request if achievements fail
    }

    // Final JSON response
    return res.status(200).json({
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
        },
        {
          id: player2_id,
          xpEarned: parseFloat(xp2_raw.toFixed(2)),
          eloChange: parseFloat(eloChange2.toFixed(2)),
          newXP: updatedXP2,
          newElo: newElo2,
          currentLevel: newLevel2,
          currentRank: newRank2,
        },
      ],
      unlockedAchievements: unlockedAchievements, // 🎯 Include match achievements
    });
  } catch (err) {
    console.error('Error in /multiplayer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
