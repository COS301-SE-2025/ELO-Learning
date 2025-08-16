// baselineEngine.js
//This is logic only — no Express routes, no HTTP handling. Contains baseline algorithm.
import { supabase } from '../database/supabaseClient.js';

class BaselineEngine {
  constructor(userId) {
    this.userId = userId;
    this.currentLevel = 5;
    this.questionCount = 0;
    this.correctCount = 0;
    this.history = [];
    this.bounceTracker = new Map();
    this.seenTopics = new Set();
    this.askedQuestionIds = new Set();
  }

  updateLevel(correct) {
    if (correct) {
      this.correctCount++;
      this.currentLevel = Math.min(this.currentLevel + 1, 10);
    } else {
      this.currentLevel = Math.max(this.currentLevel - 1, 1); 
    }
  }

  trackBounce() {
    if (this.history.length < 2) return null;

    const [a, b] = [this.history[this.history.length - 1], this.history[this.history.length - 2]];
    if (a.level !== b.level) {
      const key = [a.level, b.level].sort().join('-');
      const count = (this.bounceTracker.get(key) || 0) + 1;
      this.bounceTracker.set(key, count);

      if (count >= 3) {
        return Math.min(a.level, b.level);
      }
    }
    return null;
  }

async fetchQuestion() {
  const { data: questions, error } = await supabase
    .from('Questions')
    .select(`
      Q_id,
      topic,
      difficulty,
      level,
      questionText,
      xpGain,
      elo_rating,
      imageUrl,
      Answers (
        answer_id,
        answer_text,
        isCorrect
      )
    `)
    .eq('level', this.currentLevel);

    if (error || !questions || questions.length === 0) {
      throw new Error('No questions found');
    }

    const filtered = questions.filter(
      (q) => !this.seenTopics.has(q.topic) && !this.askedQuestionIds.has(q.Q_id)
    );

    const pool = filtered.length > 0 ? filtered : questions;
    const selected = pool[Math.floor(Math.random() * pool.length)];

    this.seenTopics.add(selected.topic);
    this.askedQuestionIds.add(selected.Q_id);

    return selected;
    //find optimised way to find the questions per level so it doesnt take long - DEMO 4
  }

  async nextQuestion(lastAnswerCorrect = null) {
    if (lastAnswerCorrect !== null) {
      this.updateLevel(lastAnswerCorrect);
    }

    const bounceEnd = this.trackBounce();
    if (bounceEnd !== null) {
      return { done: true, rating: bounceEnd };
    }

    if (this.questionCount >= 10) { //max is 10 for now
      return { done: true, rating: this.currentLevel };
    }

    const question = await this.fetchQuestion();
    this.questionCount++;
    this.history.push({ level: this.currentLevel, correct: lastAnswerCorrect });

    return { done: false, question, currentLevel: this.currentLevel, progress: this.questionCount };
  }
}

export default BaselineEngine;

//random num generator for the array with questions to ask.
