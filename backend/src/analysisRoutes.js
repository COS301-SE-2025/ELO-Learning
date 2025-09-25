import express from 'express';
import { supabase } from '../database/supabaseClient.js';
import { generateMotivationTips } from './utils/motivationTips.js';

const router = express.Router();

router.get('/accuracy/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase.rpc('get_user_accuracy_over_time', {
      uid: parseInt(userId),
    });

    if (error) throw error;

    // Only keep entries that belong to the current year
    const currentYear = new Date().getFullYear();
    const filtered = (Array.isArray(data) ? data : []).filter((item) => {
      // accept possible date-like fields
      const rawDate =
        item.day || item.date || item.attemptDate || item.timestamp;
      if (!rawDate) return false;
      const parsed = new Date(rawDate);
      if (isNaN(parsed.getTime())) return false;
      return parsed.getFullYear() === currentYear;
    });

    console.log(
      `Accuracy: returned ${filtered.length} / ${data.length} entries for user ${userId} for year ${currentYear}`,
    );

    res.json({ success: true, accuracy: filtered });
  } catch (error) {
    console.error('Error fetching accuracy data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/elo-summary/:userId', async (req, res) => {
  const { userId } = req.params;
  const { start, end } = req.query;

  try {
    const { data, error } = await supabase.rpc(
      'get_user_elo_summary_over_time',
      {
        uid: parseInt(userId),
        start_date: new Date(start),
        end_date: new Date(end),
      },
    );
    if (error) throw error;
    res.json({ success: true, eloSummary: data });
  } catch (err) {
    console.error('Error fetching ELO summary over time:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /topic-stats/:userId
// GET /topic-stats/:userId
router.get('/topic-stats/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch attempts for this user
    const { data, error } = await supabase
      .from('QuestionAttempts')
      .select('q_topic,isCorrect')
      .eq('user_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.json({ success: true, bestTopics: [], worstTopics: [] });
    }

    // Group by topic and compute accuracy
    const topicMap = {};
    data.forEach(({ q_topic, isCorrect }) => {
      if (!q_topic) return;
      if (!topicMap[q_topic]) topicMap[q_topic] = { correct: 0, total: 0 };
      topicMap[q_topic].total += 1;
      topicMap[q_topic].correct += isCorrect ? 1 : 0;
    });

    const topicStats = Object.entries(topicMap)
      .filter(([_, { total }]) => total > 0) // only keep topics with attempts
      .map(([topic, { correct, total }]) => ({
        topic,
        accuracy: (correct / total) * 100,
      }));

    // Sort for best/worst
    const sorted = topicStats.sort((a, b) => b.accuracy - a.accuracy);

    const bestTopics = sorted.slice(0, 3);
    const worstTopics = sorted.slice(-3).reverse();

    res.json({ success: true, bestTopics, worstTopics });
  } catch (err) {
    console.error('Error fetching topic stats:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /topic-depth/:userId
router.get('/topic-depth/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (!Number.isFinite(userId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid userId' });
    }

    // fetch only the columns we need (no attemptDate)
    const { data, error } = await supabase
      .from('QuestionAttempts')
      .select('q_topic, question_id, q_type, isCorrect, timeSpent')
      .eq('user_id', userId)
      .eq('attemptType', 'single');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.json({
        success: true,
        topicDepth: [],
        coverage: null,
        depthFeedback: null,
      });
    }

    // aggregate by topic
    const map = new Map(); // topic -> aggregation object
    data.forEach((row) => {
      const topic = row.q_topic ? String(row.q_topic) : 'Unknown';
      let entry = map.get(topic);
      if (!entry) {
        entry = {
          topic,
          attempts: 0,
          questionIds: new Set(),
          types: new Set(),
          correct: 0,
          totalTime: 0,
        };
        map.set(topic, entry);
      }

      entry.attempts += 1;
      if (row.question_id !== null && row.question_id !== undefined) {
        // keep question_id as-is
        entry.questionIds.add(String(row.question_id));
      }
      if (row.q_type) entry.types.add(String(row.q_type));
      if (row.isCorrect) entry.correct += 1;
      if (row.timeSpent !== null && row.timeSpent !== undefined) {
        const t = Number(row.timeSpent);
        if (Number.isFinite(t)) entry.totalTime += t;
      }
    });

    // build response array
    const topicDepth = Array.from(map.values()).map((e) => ({
      topic: e.topic,
      attempts: e.attempts,
      uniqueQuestions: e.questionIds.size,
      uniqueTypes: e.types.size,
      avgAccuracy: e.attempts > 0 ? (e.correct / e.attempts) * 100 : 0,
      avgTimeSpent: e.attempts > 0 ? e.totalTime / e.attempts : null,
    }));

    // sort by uniqueQuestions desc (breadth) then attempts
    topicDepth.sort((a, b) => {
      if (b.uniqueQuestions !== a.uniqueQuestions)
        return b.uniqueQuestions - a.uniqueQuestions;
      return b.attempts - a.attempts;
    });

    // basic coverage summary (most / least covered by uniqueQuestions)
    let most = topicDepth[0] || null;
    let least = topicDepth[topicDepth.length - 1] || null;
    const gap =
      most && least ? most.uniqueQuestions - least.uniqueQuestions : 0;

    let depthFeedback = null;
    if (topicDepth.length <= 1) {
      depthFeedback = 'Not enough topic variety to analyze depth yet.';
    } else if (gap < 3) {
      depthFeedback =
        'You have fairly even coverage across your topics — good breadth.';
    } else if (gap < 10) {
      depthFeedback = `You have decent coverage but focused more on ${most.topic} (${most.uniqueQuestions} q's) than ${least.topic} (${least.uniqueQuestions} q's). Consider practicing ${least.topic}.`;
    } else {
      depthFeedback = `You focused heavily on ${most.topic} (${most.uniqueQuestions} unique questions) and barely on ${least.topic} (${least.uniqueQuestions}). Try adding practice for ${least.topic} to balance your skills.`;
    }

    return res.json({
      success: true,
      topicDepth,
      coverage: { most, least, gap },
      depthFeedback,
    });
  } catch (err) {
    console.error('Error in /topic-depth/:userId', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

router.get('/motivation-tips/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (!Number.isFinite(userId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid userId' });
    }

    // Fetch relevant data from existing routes / tables
    const { data: accuracyData } = await supabase
      .from('QuestionAttempts')
      .select('q_topic, isCorrect, timeSpent')
      .eq('user_id', userId);

    const { data: topicStats } = await supabase
      .from('QuestionAttempts')
      .select('q_topic, isCorrect')
      .eq('user_id', userId);

    // Generate personalized messages
    const { motivation, tips } = generateMotivationTips({
      accuracyData,
      topicStats,
    });

    res.json({ success: true, motivation, tips });
  } catch (err) {
    console.error('Error generating motivation & tips:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
