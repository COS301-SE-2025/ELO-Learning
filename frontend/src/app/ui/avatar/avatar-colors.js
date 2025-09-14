// avatar-colors.js
// Centralized color and gradient palette for avatar builder and profile

// Main avatar color palette - used for avatar body shapes
export const avatarColors = [
  // Purples
  '#421e68',
  '#7d32ce',
  '#c794ff',
  '#4d5ded',
  // Pinks
  '#ff6e99',
  '#ff7f7f',
  '#ffb6c1',
  '#ffb899',
  // Reds
  '#ff6b6b',
  '#ff4d4d',
  '#ff3b30',
  '#ff6347',
  // Oranges
  '#ffb347',
  '#ffa500',
  '#ff8c00',
  '#ffad60',
  // Yellows
  '#ffd93d',
  '#fff700',
  '#ffe066',
  '#fffacd',
  // Greens
  '#6bcf7f',
  '#98fb98',
  '#4ecdc4',
  '#20b2aa',
];

// Gradient definitions for backgrounds
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

// Default colors for various avatar components
export const defaultColors = {
  avatar: avatarColors[4], // '#ff6e99'
  background: '#421e68',
};
