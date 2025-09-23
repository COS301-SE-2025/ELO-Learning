// baselineRoutes.js
import express from 'express';
import { supabase } from '../database/supabaseClient.js';

const router = express.Router();

// Submit answer and get next question or result
router.post('/baseline/answer', async (req, res) => {
  const { user_id, question_id, isCorrect, currentLevel, questionNumber } =
    req.body;

  if (!user_id || !question_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Log attempt
  await supabase.from('QuestionAttempts').insert([
    {
      user_id,
      question_id,
      isCorrect,
      attemptType: 'baseline',
      attemptDate: new Date(),
    },
  ]);

  let nextLevel = currentLevel;
  if (isCorrect) {
    nextLevel = Math.min(currentLevel + 1, 10);
  } else {
    nextLevel = Math.max(currentLevel - 1, 1);
  }

  // Check if test is done
  if (questionNumber >= 15) {
    //to be changed to 15 later - done
    //const finalElo = await setBaselineElo(user_id, nextLevel);
    //return res.json({ done: true, finalLevel: nextLevel , elo_rating: finalElo});
    return res.json({
      done: true,
      finalLevel: nextLevel,
      elo_rating: currentLevel,
    });
  }

  // Fetch next question
  const { data: nextQuestion } = await supabase
    .from('Questions')
    .select('*')
    .eq('level', nextLevel)
    // .limit(1)
    // .single();
    .order('RANDOM()'); //try

  res.json({
    question: nextQuestion,
    currentLevel: nextLevel,
    questionNumber: questionNumber + 1,
  });
});

// POST /baseline/skip
//we will only use this when the user chooses to skip also in the profile section
router.post('/baseline/skip', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const { error } = await supabase
      .from('Users')
      .update({ base_line_test: true })
      .eq('id', user_id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update baseLineTest' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Confirm baseline test: update baseLineTest = true
router.post('/baseline/confirm', async (req, res) => {
  const { user_id } = req.body;

  console.log('🎯 /baseline/confirm called with user_id:', user_id);

  if (!user_id) {
    console.error('❌ Missing user_id in request body');
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    console.log('🔄 Updating base_line_test to true for user:', user_id);

    // Update the baseLineTest flag to true
    const { data, error } = await supabase
      .from('Users')
      .update({ base_line_test: true })
      .eq('id', user_id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Database error updating base_line_test:', error);
      return res
        .status(500)
        .json({ error: 'Database update failed', details: error.message });
    }

    console.log('✅ Successfully updated base_line_test for user:', user_id);

    // Return the updated user data with proper field name conversion
    const updatedUser = {
      id: data.id,
      name: data.name,
      surname: data.surname,
      username: data.username,
      email: data.email,
      currentLevel: data.currentLevel,
      joinDate: data.joinDate,
      xp: data.xp,
      avatar: data.avatar,
      elo_rating: data.elo_rating,
      rank: data.rank,
      baseLineTest: data.base_line_test, // Convert snake_case to camelCase
    };

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /baseline/questions
 * Fetch all questions for baseline test.
 */
router.get('/baseline/questions', async (req, res) => {
  try {
    // fetch all questions grouped by level
    const { data: questions, error } = await supabase.from('Questions').select(`
        Q_id,
        topic,
        difficulty,
        level,
        questionText,
        Answers (
          answer_id,
          answer_text,
          isCorrect
        )
      `);

    if (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    // group by level
    const byLevel = {};
    for (let q of questions) {
      if (!byLevel[q.level]) byLevel[q.level] = [];
      byLevel[q.level].push(q);
    }

    res.json({ questions: byLevel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /baseline/complete
 * Update user's final Elo rating and rank after baseline test.
 * Body: { user_id, finalElo } - finalElo is actually the final level achieved
 */
router.post('/baseline/complete', async (req, res) => {
  const { user_id, finalElo, testPerformance } = req.body; // Add testPerformance

  if (!user_id || finalElo == null) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    console.log(
      `🎯 Processing baseline completion for user ${user_id}, final level: ${finalElo}`,
    );

    // Step 1: Get the minXP for the achieved level from Levels table
    const { data: levelData, error: levelError } = await supabase
      .from('Levels')
      .select('minXP')
      .eq('level', finalElo)
      .single();

    if (levelError || !levelData) {
      console.error('Failed to fetch level data:', levelError);
      return res.status(500).json({ error: 'Failed to fetch level data' });
    }

    const baseXP = levelData.minXP;
    console.log(`Level ${finalElo} corresponds to ${baseXP} XP`);

    // Step 2: Enhanced ELO calculation with adaptive multipliers

    // Base reduction: 55%
    let baselineMultiplier = 0.55;

    // Adaptive multiplier based on achievement level
    const adaptiveBonus =
      finalElo <= 3
        ? -0.1 // 45% for low achievement
        : finalElo <= 6
          ? 0.0 // 55% for medium achievement
          : finalElo <= 8
            ? 0.1
            : 0.2; // 65-75% for high achievement

    // Performance multiplier (if test performance data is available)
    let performanceMultiplier = 1.0;
    if (testPerformance) {
      const accuracy =
        testPerformance.correctAnswers / testPerformance.totalQuestions;
      performanceMultiplier = 0.9 + accuracy * 0.2; // Range: 0.9 to 1.1

      // Additional multipliers based on termination reason
      let terminationBonus = 0;
      switch (testPerformance.endReason) {
        case 'level_10_mastery':
          terminationBonus = 0.1; // 10% bonus for achieving mastery
          break;
        case 'level_1_failure':
          terminationBonus = -0.05; // 5% penalty for struggling at basic level
          break;
        case 'bounce_detection':
          terminationBonus = 0; // No bonus/penalty for consistent performance
          break;
        case 'completed_all_questions':
          terminationBonus = 0.05; // 5% bonus for completing full test
          break;
      }

      performanceMultiplier += terminationBonus;
      performanceMultiplier = Math.max(
        0.8,
        Math.min(1.2, performanceMultiplier),
      ); // Cap between 0.8 and 1.2

      console.log(`📊 Test Performance Analysis:
      🎯 Correct Answers: ${testPerformance.correctAnswers}/${
        testPerformance.totalQuestions
      }
      📈 Accuracy: ${(accuracy * 100).toFixed(1)}%
      🔧 Performance Multiplier: ${performanceMultiplier.toFixed(2)} (base: ${(
        0.9 +
        accuracy * 0.2
      ).toFixed(2)}, bonus: ${terminationBonus.toFixed(2)})
      🏁 End Reason: ${testPerformance.endReason || 'completed_all_questions'}
      📊 Level History: ${
        testPerformance.levelHistory
          ? testPerformance.levelHistory.join(' → ')
          : 'N/A'
      }
      🎯 Edge Cases: L1 Wrong=${
        testPerformance.edgeCaseData?.consecutiveAtLevel1Wrong || 0
      }, L10 Right=${
        testPerformance.edgeCaseData?.consecutiveAtLevel10Right || 0
      }`);
    }

    const finalMultiplier = baselineMultiplier + adaptiveBonus;
    const calculatedElo = Math.max(
      100,
      Math.round(baseXP * finalMultiplier * performanceMultiplier),
    );

    console.log(
      `⚡ Enhanced ELO calculation:
      📈 Base XP: ${baseXP}
      🎯 Base multiplier: ${baselineMultiplier} (55%)
      🔧 Adaptive bonus: ${adaptiveBonus} (level ${finalElo})
      📊 Performance multiplier: ${performanceMultiplier.toFixed(2)}
      🏆 Final ELO: ${calculatedElo}`,
    );

    // Step 3: Determine rank based on calculated ELO
    const { data: rankData, error: rankError } = await supabase
      .from('Ranks')
      .select('rank')
      .lte('min_elo', calculatedElo)
      .order('min_elo', { ascending: false })
      .limit(1)
      .single();

    if (rankError || !rankData) {
      console.error('Failed to determine rank:', rankError);
      return res.status(500).json({ error: 'Failed to determine rank' });
    }

    const assignedRank = rankData.rank;
    console.log(`Assigned rank: ${assignedRank} (ELO: ${calculatedElo})`);

    // Step 4: Update user with new ELO, rank, level, and baseline completion
    const { data, error } = await supabase
      .from('Users')
      .update({
        currentLevel: finalElo,
        elo_rating: calculatedElo,
        rank: assignedRank,
        base_line_test: true,
      })
      .eq('id', user_id)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to update user data:', error);
      return res.status(500).json({ error: 'Failed to update user data' });
    }

    console.log(
      ` Successfully updated user ${user_id}: Level ${finalElo}, ELO ${calculatedElo}, Rank ${assignedRank}`,
    );

    // Return the updated user data with proper field name conversion
    const updatedUser = {
      id: data.id,
      name: data.name,
      surname: data.surname,
      username: data.username,
      email: data.email,
      currentLevel: data.currentLevel,
      joinDate: data.joinDate,
      xp: data.xp,
      avatar: data.avatar,
      elo_rating: data.elo_rating,
      rank: data.rank,
      baseLineTest: data.base_line_test, // Convert snake_case to camelCase
    };

    res.json({
      success: true,
      elo_rating: calculatedElo,
      rank: assignedRank,
      level: finalElo,
      user: updatedUser,
    });
  } catch (err) {
    console.error('Server error in baseline/complete:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
