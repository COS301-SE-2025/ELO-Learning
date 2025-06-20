let alpha = 0.05; // Tuning constant, controls how much XP gain slows down as player levels up
let beta = 0.3; //Adds more XP when you're further from levelling up, and less XP when you're near the next level
//defines how much the "gatekeeper" slows down the XP gain as you approach leveling up
let maxTimeSeconds = 30;
//for mocking
/*let XPGain = 20;
let currentXP = 600;
let currentLevel = 4;
let nextLevelXP = 800;
let actualTimeSeconds = 20;

let CA = 1; //Correct answer, range from (0-1)
*/

function calculateTimeReward(actualTimeSeconds) {
  let RT = Math.max(0, maxTimeSeconds - actualTimeSeconds);
  return RT / maxTimeSeconds;
}

function calculateLevelReward(currentLevel) {
  let scaling = 1 + alpha * currentLevel;
  return 1 / scaling;
}

function calculateGateKeepingComponent(currentXP, nextLevelXP) {
  let remainingXP = nextLevelXP - currentXP;
  return beta * (remainingXP / nextLevelXP);
}

export async function calculateSinglePlayerXP({
  CA, // Correct answer (0-1)
  XPGain, // Base XP gain from question
  actualTimeSeconds,
  currentLevel,
  currentXP,
  nextLevelXP,
}) {
  const timeReward = calculateTimeReward(actualTimeSeconds);
  const levelReward = calculateLevelReward(currentLevel);
  const gatekeeper = calculateGateKeepingComponent(currentXP, nextLevelXP);

  const XP =
    CA *
    (XPGain * CA +
      XPGain * timeReward +
      XPGain * levelReward +
      XPGain * gatekeeper);

  return Number(XP.toFixed(2));
}
