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

export default router;
