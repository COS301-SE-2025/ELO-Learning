import { supabase } from '../database/supabaseClient.js';

class BaselineTest {
  constructor(userId) {
    this.userId = userId;
    this.currentLevel = 5;
    this.previousTopic = null;
    this.history = []; // [{ level, correct, topic }]
    this.bounceTracker = new Map(); // "4-5" => count
    this.askedQuestionIds = new Set();
  }

  updateLevel(correct) {
    if (correct === true) {
      this.currentLevel = Math.min(this.currentLevel + 1, 10);
    } else if (correct === false) {
      this.currentLevel = Math.max(this.currentLevel - 1, 1);
    }
  }

  trackBounce() {
    if (this.history.length < 2) return null;

    const last = this.history[this.history.length - 1];
    const secondLast = this.history[this.history.length - 2];

    const key = [last.level, secondLast.level].sort().join('-');

    if (last.level !== secondLast.level) {
        // Reset all other bounce counts
        this.bounceTracker = new Map([[key, (this.bounceTracker.get(key) || 0) + 1]]);
    } else {
        // Same level twice – not a bounce
        return null;
    }

    if (this.bounceTracker.get(key) >= 3) {
        return Math.min(last.level, secondLast.level); // Final placement
    }

    return null;
    }

  async getNextQuestion(lastAnswerCorrect = null) {
    if (lastAnswerCorrect !== null) {
      this.updateLevel(lastAnswerCorrect);
    }

    const finalLevel = this.trackBounce();
    if (finalLevel !== null) {
      return { done: true, rating: finalLevel };
    }

    // Fetch questions from the Q tablee
    const { data: questions, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('level', this.currentLevel);

    if (error || !questions || questions.length === 0) {
      throw new Error(`No questions found at level ${this.currentLevel}`);
    }

    // Filter out same topic and duplicates
    const filtered = questions.filter(
      (q) =>
        q.topic !== this.previousTopic &&
        !this.askedQuestionIds.has(q.Q_id)
    );

    const pool = filtered.length > 0 ? filtered : questions.filter(q => !this.askedQuestionIds.has(q.Q_id));

    if (pool.length === 0) {
    return {
        done: true,
        rating: this.currentLevel,
        reason: 'No more unique questions at this level.',
    };
    }

    const selected = pool[Math.floor(Math.random() * pool.length)];

    this.previousTopic = selected.topic;
    this.history.push({
      level: this.currentLevel,
      correct: lastAnswerCorrect,
      topic: selected.topic,
    });

    this.askedQuestionIds.add(selected.Q_id);

    return {
      done: false,
      question: selected,
      currentLevel: this.currentLevel,
      historyLength: this.history.length,
    };
  }

  isComplete() {
    return this.trackBounce() !== null;
    }

  getHistory() {
    return this.history;
    }
}

export default BaselineTest;
