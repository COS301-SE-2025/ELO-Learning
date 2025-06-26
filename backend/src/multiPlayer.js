const alpha = 400;

function isValidNumber(n) {
  return typeof n === 'number' && !isNaN(n);
}

export function calculateExpected(p1, p2) {
  if (!isValidNumber(p1) || !isValidNumber(p2)) {
    throw new TypeError('Both player ratings must be valid numbers');
  }

  const p1_expected = 1 / (1 + Math.pow(10, (p2 - p1) / alpha));
  const p2_expected = 1 - p1_expected;

  return [p1_expected, p2_expected];
}

export function distributeXP(xpTotal, expected1, expected2, score1) {
  /*
    score 1: actual match result for player 1
    1 -> P1 wins
    0 -> P2 loses
    0.5 -> draw
  */

  if (!isValidNumber(xpTotal) || xpTotal < 0) {
    throw new TypeError('xpTotal must be a non-negative number');
  }
  if (!isValidNumber(expected1) || expected1 < 0 || expected1 > 1) {
    throw new TypeError('expected1 must be a number between 0 and 1');
  }
  if (!isValidNumber(expected2) || expected2 < 0 || expected2 > 1) {
    throw new TypeError('expected2 must be a number between 0 and 1');
  }
  if (![0, 0.5, 1].includes(score1)) {
    throw new TypeError('score1 must be 0, 0.5, or 1');
  }

  const score2 = 1 - score1;

  const magnifier1 = 1 + (score1 - expected1);
  const magnifier2 = 1 + (score2 - expected2);

  const xp1 = xpTotal * magnifier1;
  const xp2 = xpTotal * magnifier2;

  /*
        Why added 1 on magnifier? (ensures no negative XP and keeps scale positive)
        If you perform better than expected, you get more than the actual XP (magnifier > 1)
        If you perform as expected, you get the exact XP (magnifier = 1)
        If you underperform, you still get XP, but less than the actual (magnifier < 1)
    */

  return [Math.round(xp1), Math.round(xp2)];
}

//Test
/*
let score1 = 1; //P1 wins

const [xp1, xp2] = distributeXP(xpTotal, expected1, expected2, score1);

console.log('P1 Expected:', expected1.toFixed(2));
console.log('P2 Expected:', expected2.toFixed(2));
console.log('XP earned - P1:', xp1);
console.log('XP earned - P2:', xp2);
*/
