const alpha = 0.1;
const beta = 0.05;
const maxTimeSeconds = 30;
const maxLevel = 10;
const scalingFactor = 0.3;

function isValidNumber(n) {
  return typeof n === 'number' && !isNaN(n);
}

export function calculateTimeReward(actualTimeSeconds) {
  if (!isValidNumber(actualTimeSeconds) || actualTimeSeconds < 0) return 0;
  const RT = Math.max(0, maxTimeSeconds - actualTimeSeconds);
  return RT / maxTimeSeconds;
}

export function calculateLevelReward(currentLevel) {
  if (
    !isValidNumber(currentLevel) ||
    currentLevel < 0 ||
    currentLevel > maxLevel
  )
    return 0;
  const scaling = 1 + alpha * currentLevel;
  return 1 / scaling;
}

export function calculateGateKeepingComponent(currentXP, nextLevelXP) {
  if (
    !isValidNumber(currentXP) ||
    !isValidNumber(nextLevelXP) ||
    nextLevelXP <= 0
  )
    return 0;
  const remainingXP = nextLevelXP - currentXP;
  return beta * (remainingXP / nextLevelXP);
}

export async function calculateSinglePlayerXP({
  CA,
  XPGain,
  actualTimeSeconds,
  currentLevel,
  currentXP,
  nextLevelXP,
}) {
  if (!isValidNumber(CA) || CA < 0 || CA > 1) CA = 0;
  if (!isValidNumber(XPGain) || XPGain < 0) XPGain = 0;

  const timeReward = calculateTimeReward(actualTimeSeconds);
  const levelReward = calculateLevelReward(currentLevel);
  const gatekeeper = calculateGateKeepingComponent(currentXP, nextLevelXP);

  let XP =
    CA *
    (XPGain * CA +
      XPGain * timeReward +
      XPGain * levelReward +
      XPGain * gatekeeper);

  XP = XP < 0 ? 0 : XP;
  XP = XP * scalingFactor; // Scale down XP

  return Number(XP.toFixed(0)); // Round to integer
}
