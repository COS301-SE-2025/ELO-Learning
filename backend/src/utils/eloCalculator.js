const DEFAULT_ALPHA = 10;
const DEFAULT_K = 1.0;
const scalingFactor = 0.03;

export function calculateExpectedRating(
  ratingA,
  ratingB,
  alpha = DEFAULT_ALPHA,
) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / alpha));
}

/**
 * @param {number} rating - current player rating
 * @param {number} expected - expected outcome (0.0 to 1.0)
 * @param {number} actual - actual outcome (1 for win, 0 for loss)
 * @param {number} kFactor - scaling constant
 */

export function updateEloRating({
  rating,
  expected,
  actual,
  kFactor = DEFAULT_K,
}) {
  const change = kFactor * (actual - expected);
  //console.log(`ELO Change: ${change}`);
  return Math.max(0, rating + change * scalingFactor);
}

/**
 * Single-player ELO update — treats a question/challenge as an opponent
 * @param {number} playerRating - Current ELO of player
 * @param {number} questionRating - Difficulty ELO of the question
 * @param {boolean} isCorrect - Whether player got it right
 * @param {number} alpha - Sensitivity parameter (default 400)
 * @param {number} kFactor - How fast rating changes (default 1.0)
 * @returns {number} New player rating
 */

export function updateSinglePlayerElo({
  playerRating,
  questionRating,
  isCorrect,
  alpha = DEFAULT_ALPHA,
  kFactor = DEFAULT_K,
}) {
  const expected = calculateExpectedRating(playerRating, questionRating, alpha);
  const actual = isCorrect ? 1 : 0;
  const updatedRating = updateEloRating({
    rating: playerRating,
    expected,
    actual,
    kFactor,
  });
  return Math.max(0, parseFloat(updatedRating.toFixed(2)));
}
