// avatar-colors.js
// Centralized color and gradient palette for avatar builder and profile

export const solidColors = [
  '#421e68',
  '#7d32ce',
  '#c794ff',
  '#4d5ded',
  '#ff6e99',
  '#6e3a99',
  '#a16be0',
  '#bfa0ff',
  '#7a8aff',
  '#ff8ab8',
  '#d94d8f',
  '#a8327d',
];

export const gradients = [
  { colors: ['#421e68', '#7d32ce'] },
  { colors: ['#7d32ce', '#c794ff'] },
  { colors: ['#c794ff', '#4d5ded'] },
  { colors: ['#4d5ded', '#ff6e99'] },
  { colors: ['#ff6e99', '#421e68'] },
  { colors: ['#421e68', '#7d32ce', '#c794ff'] },
  { colors: ['#7d32ce', '#c794ff', '#4d5ded'] },
  { colors: ['#c794ff', '#4d5ded', '#ff6e99'] },
  { colors: ['#4d5ded', '#ff6e99', '#421e68'] },
  { colors: ['#ff6e99', '#421e68', '#7d32ce'] },
  { colors: ['#421e68', '#7d32ce', '#c794ff', '#4d5ded', '#ff6e99'] },
  { colors: ['#ff6e99', '#4d5ded', '#c794ff', '#7d32ce', '#421e68'] },
];

export const avatarColors = [
  // Use the same solid colors for body color selection
  ...solidColors,
];
