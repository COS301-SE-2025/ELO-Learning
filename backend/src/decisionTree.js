import { supabase } from '../database/supabaseClient.js';

class BaselineTest {
  constructor(userId) {
    this.userId = userId;
    this.currentLevel = 5;
    this.history = [];
    this.levelBounces = new Map(); // track level -> count
  }

  async getNextQuestion(prevCorrect, prevTopic = null) {
    // Adjust level
    if (prevCorrect === true) {
      this.currentLevel = Math.min(this.currentLevel + 1, 10);
    } else if (prevCorrect === false) {
      this.currentLevel = Math.max(this.currentLevel - 1, 1);
    }

    // Track bouncing
    const lastTwoLevels = this.history.slice(-2).map(e => e.level);
    if (lastTwoLevels.length === 2 && lastTwoLevels[0] !== lastTwoLevels[1]) {
      const bounceKey = [lastTwoLevels[0], lastTwoLevels[1]].sort().join('-');
      this.levelBounces.set(bounceKey, (this.levelBounces.get(bounceKey) || 0) + 1);

      if (this.levelBounces.get(bounceKey) >= 3) {
        return { done: true, rating: Math.min(...bounceKey.split('-').map(Number)) };
      }
    }

    // Choose a random topic
    const { data: questionData, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('level', this.currentLevel);

    if (error || !questionData || questionData.length === 0) {
      throw new Error('No questions found for level: ' + this.currentLevel);
    }

    // Filter to a new topic (optional)
    const filtered = prevTopic
      ? questionData.filter(q => q.topic !== prevTopic)
      : questionData;

    const selected = filtered[Math.floor(Math.random() * filtered.length)];
    this.history.push({ level: this.currentLevel, topic: selected.topic });

    return { done: false, question: selected };
  }
}

export default BaselineTest;
