import express from 'express';
import { supabase } from '../database/supabaseClient.js';

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

    const topicStats = Object.entries(topicMap).map(
      ([topic, { correct, total }]) => ({
        topic,
        accuracy: total > 0 ? (correct / total) * 100 : 0,
      }),
    );

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

export default router;
