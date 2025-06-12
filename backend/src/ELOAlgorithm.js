let alpha = 0.05; // Tuning constant, controls how much XP gain slows down as player levels up
let beta = 0.3; //Adds more XP when you're further from levelling up, and less XP when you're near the next level
//defines how much the "gatekeeper" slows down the XP gain as you approach leveling up

//for mocking
let XPGain = 20;
let currentXP = 600;
let currentLevel = 5;
let nextLevelXP = 800;
let actualTimeSeconds = 20;
let maxTimeSeconds = 30;
let CA = 1; //Correct answer, range from (0-1)

function calculateTimeReward() {
  let RT = Math.max(0, maxTimeSeconds - actualTimeSeconds);
  return RT / maxTimeSeconds;
}

function calculateLevelReward() {
  let scaling = 1 + alpha * currentLevel;
  return 1 / scaling;
}

function calculateGateKeepingComponent() {
  let remainingXP = nextLevelXP - currentXP;
  return beta * (remainingXP / nextLevelXP);
}

async function calculateSinglePlayerXP() {
  const timeReward = calculateTimeReward();
  const levelReward = calculateLevelReward();
  const gatekeeper = calculateGateKeepingComponent();

  const XP =
    XPGain * CA +
    XPGain * timeReward +
    XPGain * levelReward +
    XPGain * gatekeeper;

  return XP;
}

calculateSinglePlayerXP().then((xp) => console.log('XP Earned:', xp));
