import 'dotenv/config';
import { supabase } from './supabaseClient.js';

async function listTables() {
  console.log('🔍 Inspecting Supabase database structure...\n');

  // Get table information from Supabase
  const { data: tables, error } = await supabase.rpc('get_table_info');

  if (error) {
    console.log('❌ RPC function not available, trying alternative method...');

    // Alternative: Try to query known tables based on your code
    const knownTables = [
      'Users',
      'Achievements',
      'AchievementCategories',
      'UserAchievements',
      'Questions',
      'Answers',
      'PasswordResets',
      'GameSessions',
      'MatchQuestions',
    ];

    console.log('📋 Checking known tables from your codebase:\n');

    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(
            `✅ ${tableName}: Exists (${
              data ? data.length : 0
            } sample records)`,
          );

          // Try to get column info
          if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            console.log(`   Columns: ${columns.join(', ')}`);
          }
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
      console.log('');
    }
  } else {
    console.log('📋 Available tables:', tables);
  }
}

listTables().catch(console.error);
