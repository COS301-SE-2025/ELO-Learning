import express from 'express';
import { supabase } from '../database/supabaseClient.js';
import {
  checkEloAchievements,
  checkMatchAchievements,
  checkQuestionAchievements,
} from './achievementRoutes.js';
import { updateSinglePlayerElo } from './utils/eloCalculator.js';
import { checkAndUpdateRankAndLevel } from './utils/userProgression.js';
import { calculateSinglePlayerXP } from './utils/xpCalculator.js';

const router = express.Router();

router.post('/singleplayer', async (req, res) => {
  try {
    const { user_id, question_id, isCorrect, timeSpent } = req.body;

    if (
      !user_id ||
      !question_id ||
      isCorrect === undefined ||
      timeSpent === undefined
    ) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('xp, currentLevel, elo_rating, rank')
      .eq('id', user_id)
      .single();

    if (userError || !userData)
      return res.status(404).json({ error: 'User not found' });

    const {
      xp: currentXP,
      currentLevel,
      elo_rating: currentElo,
      rank: currentRank,
    } = userData;

    const { data: levelData, error: levelError } = await supabase
      .from('Levels')
      .select('minXP')
      .eq('level', currentLevel + 1)
      .single();

    const nextLevelXP = levelData?.minXP ?? Infinity;

    const { data: questionData, error: qError } = await supabase
      .from('Questions')
      .select('xpGain, elo_rating')
      .eq('Q_id', question_id)
      .single();

    if (qError || !questionData)
      return res.status(404).json({ error: 'Question not found' });

    const xpEarned = await calculateSinglePlayerXP({
      CA: isCorrect ? 1 : 0,
      XPGain: questionData.xpGain,
      actualTimeSeconds: timeSpent,
      currentLevel,
      currentXP,
      nextLevelXP,
    });

    const newXP = currentXP + xpEarned;

    const newElo = updateSinglePlayerElo({
      playerRating: currentElo,
      questionRating: questionData.elo_rating ?? 5.0,
      isCorrect,
    });

    const eloChange = parseFloat((newElo - currentElo).toFixed(2));

    const { newLevel, newRank } = await checkAndUpdateRankAndLevel({
      user_id,
      newXP,
      newElo,
      supabase,
    });

    let rankUp = false,
      rankDown = false;
    if (currentRank !== newRank) {
      const { data: allRanks } = await supabase
        .from('Ranks')
        .select('rank, min_elo')
        .order('min_elo', { ascending: true });

      const rankIndex = (rank) => allRanks.findIndex((r) => r.rank === rank);
      const oldIndex = rankIndex(currentRank ?? 'Unranked');
      const newIndex = rankIndex(newRank ?? 'Unranked');

      if (newIndex > oldIndex) rankUp = true;
      else if (newIndex < oldIndex) rankDown = true;
    }

    await supabase.from('QuestionAttempts').insert([
      {
        question_id,
        user_id,
        isCorrect,
        timeSpent,
        ratingBefore: currentXP,
        ratingAfter: newXP,
        ratingChange: xpEarned,
        eloBefore: currentElo,
        eloAfter: newElo,
        eloChange,
        attemptDate: new Date(),
        attemptType: 'single',
      },
    ]);

    // 🎯 Check for achievements BEFORE updating user record
    let unlockedAchievements = [];

    try {
      console.log(`🎯 ACHIEVEMENT DEBUG: Starting achievement check for user ${user_id}, isCorrect: ${isCorrect}`);

      // Check question-based achievements (existing)
      console.log('🔍 Calling checkQuestionAchievements...');
      const questionAchievements = await checkQuestionAchievements(
        user_id,
        isCorrect,
      );
      console.log('✅ checkQuestionAchievements completed:', questionAchievements);
      unlockedAchievements.push(...questionAchievements);

      // 🆕 Check ELO-based achievements (NEW!)
      console.log('🔍 Calling checkEloAchievements...');
      const eloAchievements = await checkEloAchievements(user_id, newElo);
      console.log('✅ checkEloAchievements completed:', eloAchievements);
      unlockedAchievements.push(...eloAchievements);

      // 🆕 Check Match-based achievements (NEW!)
      console.log('🔍 Calling checkMatchAchievements...');
      const matchAchievements = await checkMatchAchievements(user_id);
      console.log('✅ checkMatchAchievements completed:', matchAchievements);
      unlockedAchievements.push(...matchAchievements);

      console.log(
        `🏆 Total achievements unlocked: ${unlockedAchievements.length}`,
      );
    } catch (achievementError) {
      console.error('❌ ACHIEVEMENT ERROR:', achievementError);
      console.error('❌ Achievement error stack:', achievementError.stack);
      // Don't fail the whole request if achievements fail
    }

    await supabase
      .from('Users')
      .update({
        xp: newXP,
        currentLevel: newLevel,
        elo_rating: newElo,
        rank: newRank,
      })
      .eq('id', user_id);

    return res.status(200).json({
      xpEarned,
      eloChange,
      newElo,
      leveledUp: newLevel > currentLevel,
      newRank,
      rankUp,
      rankDown,
      totalXP: newXP,
      newLevel,
      unlockedAchievements: unlockedAchievements, // 🎯 Include achievements in response
    });
  } catch (err) {
    console.error('Error in /singleplayer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;