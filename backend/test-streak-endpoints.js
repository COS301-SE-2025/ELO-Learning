// Test script to verify streak endpoints are working
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testStreakImport() {
  try {
    console.log('🧪 Testing streak calculator import...');

    // Test the import path from achievementRoutes.js perspective (src/ directory)
    const { getUserStreakInfo, updateUserStreak } = await import(
      './src/utils/streakCalculator.js'
    );

    console.log('✅ Import successful!');
    console.log('Functions available:', {
      getUserStreakInfo: typeof getUserStreakInfo,
      updateUserStreak: typeof updateUserStreak,
    });

    return true;
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Test the import
testStreakImport().then((success) => {
  if (success) {
    console.log('🎉 Streak calculator import test passed!');
  } else {
    console.log('💥 Streak calculator import test failed!');
  }
  process.exit(success ? 0 : 1);
});
