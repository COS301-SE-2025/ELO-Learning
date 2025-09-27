export function generateMotivationTips({ accuracyData, topicStats }) {
  let motivation = '';
  let tips = [];

  if (!accuracyData || accuracyData.length === 0) {
    motivation = 'Start answering questions to see your progress!';
    tips.push('Try completing at least 5 questions today.');
    return { motivation, tips };
  }

  // Simple accuracy trend
  const firstAcc = accuracyData[0].isCorrect ? 100 : 0;
  const lastAcc = accuracyData[accuracyData.length - 1].isCorrect ? 100 : 0;
  const avgAcc =
    accuracyData.reduce((sum, item) => sum + (item.isCorrect ? 1 : 0), 0) /
    accuracyData.length;

  if (lastAcc > firstAcc && avgAcc >= 0.8) {
    motivation = `Great job! Your accuracy improved to ${Math.round(
      avgAcc * 100,
    )}%!`;
  } else if (lastAcc < firstAcc) {
    motivation = 'Your accuracy dropped recently. Keep practicing!';
  } else {
    motivation = `Your average accuracy is ${Math.round(
      avgAcc * 100,
    )}%. Keep going!`;
  }

  // Simple topic tips
  if (topicStats && topicStats.length > 0) {
    const topicMap = {};
    topicStats.forEach(({ q_topic, isCorrect }) => {
      if (!topicMap[q_topic]) topicMap[q_topic] = { correct: 0, total: 0 };
      topicMap[q_topic].total++;
      topicMap[q_topic].correct += isCorrect ? 1 : 0;
    });

    const weakTopics = Object.entries(topicMap)
      .map(([topic, { correct, total }]) => ({
        topic,
        accuracy: total > 0 ? correct / total : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    weakTopics.forEach((t) =>
      tips.push(
        `Focus more on "${t.topic}" (accuracy ${Math.round(
          t.accuracy * 100,
        )}%).`,
      ),
    );
  }

  // General practice tip
  tips.push('Practice regularly and review mistakes to improve retention.');

  return { motivation, tips };
}
