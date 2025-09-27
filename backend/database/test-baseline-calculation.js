import 'dotenv/config';
import { supabase } from './supabaseClient.js';

async function testBaselineCalculation() {
  console.log('🧪 Testing baseline calculation logic...\n');

  // Test with different levels
  const testLevels = [1, 3, 5, 7, 10];

  for (const level of testLevels) {
    try {
      console.log(`\n📊 Testing Level ${level}:`);

      // Get minXP for the level
      const { data: levelData, error: levelError } = await supabase
        .from('Levels')
        .select('minXP')
        .eq('level', level)
        .single();

      if (levelError || !levelData) {
        console.log(`Level ${level} not found in database`);
        continue;
      }

      const baseXP = levelData.minXP;
      console.log(`   Base XP: ${baseXP}`);

      // Calculate ELO (75% of minXP, minimum 100)
      const calculatedElo = Math.max(100, Math.round(baseXP * 0.75));
      console.log(`   Calculated ELO (75%, min 100): ${calculatedElo}`);

      // Find corresponding rank
      const { data: rankData, error: rankError } = await supabase
        .from('Ranks')
        .select('rank, min_elo')
        .lte('min_elo', calculatedElo)
        .order('min_elo', { ascending: false })
        .limit(1)
        .single();

      if (rankError || !rankData) {
        console.log(`No rank found for ELO ${calculatedElo}`);
        continue;
      }

      console.log(
        `   Assigned Rank: ${rankData.rank} (min ELO: ${rankData.min_elo})`,
      );
      console.log(
        `   Level ${level} → ${baseXP} XP → ${calculatedElo} ELO → ${rankData.rank}`,
      );
    } catch (error) {
      console.log(`   Error testing level ${level}:`, error.message);
    }
  }

  console.log('\n Testing complete!');
}

// Also check if our tables have the expected data
async function checkTableData() {
  console.log('\n Checking Levels table:');
  const { data: levels } = await supabase
    .from('Levels')
    .select('*')
    .order('level');

  if (levels) {
    levels.forEach((level) => {
      console.log(`   Level ${level.level}: ${level.minXP} XP`);
    });
  }

  console.log('\n🏆 Checking Ranks table:');
  const { data: ranks } = await supabase
    .from('Ranks')
    .select('*')
    .order('min_elo');

  if (ranks) {
    ranks.forEach((rank) => {
      console.log(`   ${rank.rank}: ${rank.min_elo} ELO minimum`);
    });
  }
}

// Run the tests
await checkTableData();
await testBaselineCalculation();
