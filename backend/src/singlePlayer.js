const alpha = 0.05; // Tuning constant, controls XP scaling of a level
const beta = 0.3; //Adds more XP when you're further from next level
const maxTimeSeconds = 30;
const maxLevel = 10;

function isValidNumber(n) {
  return typeof n === 'number' && !isNaN(n);
}

export function calculateTimeReward(actualTimeSeconds) {
  if (!isValidNumber(actualTimeSeconds) || actualTimeSeconds < 0) {
    return 0;
  }
  let RT = Math.max(0, maxTimeSeconds - actualTimeSeconds);
  return RT / maxTimeSeconds;
}

export function calculateLevelReward(currentLevel) {
  if (
    !isValidNumber(currentLevel) ||
    currentLevel < 0 ||
    currentLevel > maxLevel
  ) {
    return 0; //invalid level -> no reward
  }
  let scaling = 1 + alpha * currentLevel;
  return 1 / scaling;
}

export function calculateGateKeepingComponent(currentXP, nextLevelXP) {
  //input validation
  if (
    !isValidNumber(currentXP) ||
    !isValidNumber(nextLevelXP) ||
    nextLevelXP <= 0
  ) {
    return 0;
  }
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
  if (!isValidNumber(CA) || CA < 0 || CA > 1) {
    CA = 0; // treat invalid CA as incorrect
  }
  if (!isValidNumber(XPGain) || XPGain < 0) {
    XPGain = 0; // no XP gain if invalid
  }

  const timeReward = calculateTimeReward(actualTimeSeconds);
  const levelReward = calculateLevelReward(currentLevel);
  const gatekeeper = calculateGateKeepingComponent(currentXP, nextLevelXP);

  let XP =
    CA *
    (XPGain * CA +
      XPGain * timeReward +
      XPGain * levelReward +
      XPGain * gatekeeper);

  //Clamping so it never goes below
  if (XP < 0) {
    XP = 0;
  }

  return Number(XP.toFixed(0));
}

/*
module.exports = {
  calculateTimeReward,
  calculateLevelReward,
  calculateGateKeepingComponent,
  calculateSinglePlayerXP,
};
*/
