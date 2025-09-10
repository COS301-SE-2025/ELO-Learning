const DEFAULT_ALPHA = 400;
const DEFAULT_K = 40;
const QUESTION_K = 24;
const MAX_RATING = Infinity;
const scalingFactor = 1.0;
const totalNumberOfQuestions = 2;

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
  return Math.max(0, Math.round(rating + change * scalingFactor));
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

/**
 * Set a player's baseline ELO rating after the baseline test.
 * @param {number} finalLevel - The level reached in baseline test
 * @returns {number} baseline ELO rating
 */
export function getBaselineElo(finalLevel) {
  // Example: ELO scales with level (tweak formula if needed)
  // You can adjust multiplier if you want ratings to be more/less spread out
  return parseFloat((finalLevel * 100).toFixed(2));
}

export function updateSinglePlayerEloPair({
  playerRating,
  questionRating,
  isCorrect,
  alpha = DEFAULT_ALPHA,
  playerK = DEFAULT_K,
  questionK = QUESTION_K,
  minRating = 0,
  maxRating = MAX_RATING,
}) {
  const scoreP = isCorrect ? 1 : 0;
  const scoreQ = 1 - scoreP;

  const expectedP = calculateExpectedRating(
    playerRating,
    questionRating,
    alpha,
  );
  const expectedQ = 1 - expectedP;

  const deltaP = Math.round(playerK * (scoreP - expectedP));
  const deltaQ = Math.round(questionK * (scoreQ - expectedQ));

  const newPlayerElo = Math.round(
    Math.min(
      maxRating,
      Math.max(minRating, playerRating + deltaP / totalNumberOfQuestions),
    ),
  );
  const newQuestionElo = Math.round(
    Math.min(
      maxRating,
      Math.max(minRating, questionRating + deltaQ / totalNumberOfQuestions),
    ),
  );

  return {
    newPlayerElo,
    newQuestionElo,
    playerEloChange: newPlayerElo - playerRating,
    questionEloChange: newQuestionElo - questionRating,
  };
}
