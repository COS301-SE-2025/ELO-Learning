# Service Migration to TypeScript

This document outlines the migration of JavaScript service files to TypeScript in the tRPC structure.

## Migrated Services

### 1. mathValidator.ts

- **Location**: `tRPC/application/elo-learning/services/mathValidator.ts`
- **Original**: `backend/src/mathValidator.js`
- **Features**:
  - Enhanced math expression validation
  - Support for advanced mathematical operations
  - Type-safe implementation with proper TypeScript types

### 2. multiPlayer.ts

- **Location**: `tRPC/application/elo-learning/services/multiPlayer.ts`
- **Original**: `backend/src/multiPlayer.js`
- **Features**:
  - ELO rating calculations for multiplayer games
  - XP distribution based on expected vs actual performance
  - Type-safe function signatures

### 3. multiPlayerArray.ts

- **Location**: `tRPC/application/elo-learning/services/multiPlayerArray.ts`
- **Original**: `backend/src/multiPlayerArray.js`
- **Features**:
  - Array-based result processing for multiplayer games
  - Performance calculation from question results
  - Extended functionality for complex game scenarios

### 4. singlePlayer.ts

- **Location**: `tRPC/application/elo-learning/services/singlePlayer.ts`
- **Original**: `backend/src/singlePlayer.js`
- **Features**:
  - Single player XP calculation
  - Time-based rewards
  - Level progression mechanics

## Updated Route Files

### Routes using the new services

- `routes/games.ts` - Uses multiPlayer and singlePlayer services
- `routes/mathValidation.ts` - Uses mathValidator service

## Import Structure

All services are exported through `services/index.ts` with proper namespace handling:

```typescript
// For unique exports
export * from './mathValidator';
export * from './singlePlayer';

// For conflicting exports (renamed)
export { calculateExpected, distributeXP } from './multiPlayer';
export {
  calculateExpected as calculateExpectedArray,
  distributeXP as distributeXPArray,
  distributeXPFromResults,
} from './multiPlayerArray';
```

## Usage Examples

### Using Math Validator

```typescript
import { backendMathValidator } from '../services/mathValidator';

const isCorrect = backendMathValidator.validateAnswer(
  studentAnswer,
  correctAnswer,
);
```

### Using Single Player Service

```typescript
import { calculateSinglePlayerXP } from '../services/singlePlayer';

const xpEarned = await calculateSinglePlayerXP({
  CA: isCorrect ? 1 : 0,
  XPGain: questionData.xpGain,
  actualTimeSeconds: timeSpent,
  currentLevel,
  currentXP,
  nextLevelXP,
});
```

### Using Multi Player Service

```typescript
import { calculateExpected, distributeXP } from '../services/multiPlayer';

const [expected1, expected2] = calculateExpected(player1.xp, player2.xp);
const [xp1, xp2] = distributeXP(xpTotal, expected1, expected2, score1);
```

## Type Safety Benefits

1. **Compile-time error checking**: TypeScript catches type mismatches before runtime
2. **Enhanced IDE support**: Better autocomplete and refactoring capabilities
3. **Interface definitions**: Clear contracts for function parameters and return types
4. **Null safety**: Proper handling of undefined/null values

## Migration Notes

- All original JavaScript functionality has been preserved
- Type annotations have been added for better development experience
- Error handling has been improved with proper type guards
- The services maintain backward compatibility with existing API endpoints
