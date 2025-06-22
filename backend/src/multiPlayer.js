let alpha = 400;
/*
scaling constant
(controls how much rating difference influences expected outcome)
Still needs to be adjusted accordingly
*/

let xpTotal = 80; //total XP available for the match (e.g. 80)
let p1_rating = 650; //level 4
let p2_rating = 1400; //level 7

export function calculateExpected(p1, p2) {
  const p1_expected = 1 / (1 + Math.pow(10, (p2 - p1) / alpha));
  const p2_expected = 1 - p1_expected;

  return [p1_expected, p2_expected];
}

// const [expected1, expected2] = calculateExpected(p1_rating, p2_rating);

//console.log("P1 Expected:", expected1.toFixed(2));
//console.log("P2 Expected:", expected2.toFixed(2));

export function distributeXP(xpTotal, expected1, expected2, score1) {
  /*
    score 1: actual match result for player 1
    1 -> P1 wins
    0 -> P2 loses
    0.5 -> draw
    */
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
