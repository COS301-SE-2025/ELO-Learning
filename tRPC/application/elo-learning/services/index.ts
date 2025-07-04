// services/index.ts
export * from './mathValidator';
export { calculateExpected, distributeXP } from './multiPlayer';
export {
  calculateExpected as calculateExpectedArray,
  distributeXP as distributeXPArray,
  distributeXPFromResults,
} from './multiPlayerArray';
export * from './singlePlayer';
