// services/singlePlayer.ts
let alpha = 0.05; // Tuning constant, controls XP scaling of a level
let beta = 0.3; // Adds more XP when you're further from next level
let maxTimeSeconds = 30;
let maxLevel = 10;

function isValidNumber(n: any): n is number {
  return typeof n === 'number' && !isNaN(n);
}

export function calculateTimeReward(actualTimeSeconds: number): number {
  if (!isValidNumber(actualTimeSeconds) || actualTimeSeconds < 0) {
    return 0;
  }
  let RT = Math.max(0, maxTimeSeconds - actualTimeSeconds);
  return RT / maxTimeSeconds;
}

export function calculateLevelReward(currentLevel: number): number {
  if (
    !isValidNumber(currentLevel) ||
    currentLevel < 0 ||
    currentLevel > maxLevel
  ) {
    return 0; // invalid level -> no reward
  }
  let scaling = 1 + alpha * currentLevel;
  return 1 / scaling;
}

export function calculateGateKeepingComponent(
  currentXP: number,
  nextLevelXP: number,
): number {
  // input validation
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

interface SinglePlayerXPParams {
  CA: number; // Correct answer (0-1)
  XPGain: number; // Base XP gain from question
  actualTimeSeconds: number;
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
}

export async function calculateSinglePlayerXP({
  CA, // Correct answer (0-1)
  XPGain, // Base XP gain from question
  actualTimeSeconds,
  currentLevel,
  currentXP,
  nextLevelXP,
}: SinglePlayerXPParams): Promise<number> {
  let validCA = CA;
  let validXPGain = XPGain;

  if (!isValidNumber(CA) || CA < 0 || CA > 1) {
    validCA = 0; // treat invalid CA as incorrect
  }
  if (!isValidNumber(XPGain) || XPGain < 0) {
    validXPGain = 0; // no XP gain if invalid
  }

  const timeReward = calculateTimeReward(actualTimeSeconds);
  const levelReward = calculateLevelReward(currentLevel);
  const gatekeeper = calculateGateKeepingComponent(currentXP, nextLevelXP);

  let XP =
    validCA *
    (validXPGain * validCA +
      validXPGain * timeReward +
      validXPGain * levelReward +
      validXPGain * gatekeeper);

  // Clamping so it never goes below
  if (XP < 0) {
    XP = 0;
  }

  return Number(XP.toFixed(2));
}
