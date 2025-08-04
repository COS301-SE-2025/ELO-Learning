import express from 'express';
import { supabase } from '../database/supabaseClient.js';

import { calculateSinglePlayerXP } from './utils/xpCalculator.js';
import { updateSinglePlayerElo } from './utils/eloCalculator.js';
import { checkAndUpdateRankAndLevel } from './utils/userProgression.js';
import { calculateExpected, distributeXP } from './multiPlayer.js';

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
      .select('id, xp, currentLevel')
      .in('id', [player1_id, player2_id]);

    if (playersError || playersData.length !== 2) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    const player1 = playersData.find((p) => p.id === player1_id);
    const player2 = playersData.find((p) => p.id === player2_id);

    // Expected outcomes
    const [expected1, expected2] = calculateExpected(player1.xp, player2.xp);
    const [xp1_raw, xp2_raw] = distributeXP(
      xpTotal,
      expected1,
      expected2,
      score1,
    );

    // Clamp XP
    const updatedXP1 = Math.max(0, player1.xp + xp1_raw);
    const updatedXP2 = Math.max(0, player2.xp + xp2_raw);

    // Fetch level thresholds
    const { data: levelsData, error: levelsError } = await supabase
      .from('Levels')
      .select('level, minXP')
      .order('minXP', { ascending: true });

    if (levelsError || !levelsData.length) {
      return res.status(500).json({ error: 'Levels data not found' });
    }

    // Determine new levels
    const newLevel1 = levelsData
      .filter((l) => updatedXP1 >= l.minXP)
      .pop().level;

    const newLevel2 = levelsData
      .filter((l) => updatedXP2 >= l.minXP)
      .pop().level;

    const leveledUp1 = newLevel1 > player1.currentLevel;
    const leveledUp2 = newLevel2 > player2.currentLevel;

    // Update users
    const { error: updateError1 } = await supabase
      .from('Users')
      .update({ xp: updatedXP1, currentLevel: newLevel1 })
      .eq('id', player1_id);

    const { error: updateError2 } = await supabase
      .from('Users')
      .update({ xp: updatedXP2, currentLevel: newLevel2 })
      .eq('id', player2_id);

    if (updateError1 || updateError2) {
      return res.status(500).json({ error: 'Error updating users XP/level' });
    }

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
        ratingChange: xp1_raw,
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
        ratingChange: xp2_raw,
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

    return res.status(200).json({
      message: 'Multiplayer match processed successfully',
      players: [
        {
          id: player1_id,
          xpEarned: parseFloat(xp1_raw.toFixed(2)),
          newXP: updatedXP1,
          currentLevel: newLevel1,
          leveledUp: leveledUp1,
        },
        {
          id: player2_id,
          xpEarned: parseFloat(xp2_raw.toFixed(2)),
          newXP: updatedXP2,
          currentLevel: newLevel2,
          leveledUp: leveledUp2,
        },
      ],
    });
  } catch (err) {
    console.error('Error in /multiplayer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
