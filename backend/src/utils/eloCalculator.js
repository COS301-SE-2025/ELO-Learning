const DEFAULT_ALPHA = 10;
const DEFAULT_K = 1.0;
const scalingFactor = 0.16;

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
  return rating + change * scalingFactor;
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
  return parseFloat(updatedRating.toFixed(2));
}

//Test

const newElo2 = updateSinglePlayerElo({
  playerRating: 4.2,
  questionRating: 5.0,
  isCorrect: true,
  alpha: 10, // tighter scale for 0–10 range
  kFactor: 0.5,
});

console.log('New ELO:', newElo2);

// Test 2: Incorrect on easier question → ELO should decrease
const test2 = updateSinglePlayerElo({
  playerRating: 5.0,
  questionRating: 3.0,
  isCorrect: false,
});
console.log('Test 2 - Incorrect on easier question:', test2); // expect decrease
