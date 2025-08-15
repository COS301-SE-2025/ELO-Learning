// Achievement System Debug Test
import { supabase } from './supabaseClient.js';

const API_BASE_URL = 'http://localhost:3000';

async function testAchievementSystem() {
  console.log('🧪 Testing Achievement System...\n');

  // Test 1: Check if backend is running and routes are accessible
  console.log('📡 Test 1: Backend Routes');
  try {
    const response = await fetch(`${API_BASE_URL}/achievement-categories`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend achievement routes accessible');
      console.log('📋 Categories found:', data.categories?.length || 0);
    } else {
      console.log('❌ Backend achievement routes not accessible:', response.status);
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
  }

  // Test 2: Check database tables
  console.log('\n📊 Test 2: Database Tables');
  try {
    // Check Achievements table
    const { data: achievements, error: achError } = await supabase
      .from('Achievements')
      .select('id, name, condition_type, condition_value')
      .limit(5);
    
    if (!achError) {
      console.log('✅ Achievements table accessible');
      console.log('📝 Sample achievements:', achievements.map(a => a.name));
    } else {
      console.log('❌ Achievements table error:', achError.message);
    }

    // Check UserAchievements table
    const { data: userAch, error: userError } = await supabase
      .from('UserAchievements')
      .select('user_id, achievement_id')
      .limit(3);
    
    if (!userError) {
      console.log('✅ UserAchievements table accessible');
      console.log('📊 Records found:', userAch?.length || 0);
    } else {
      console.log('❌ UserAchievements table error:', userError.message);
    }

    // Check AchievementProgress table
    const { data: progress, error: progressError } = await supabase
      .from('AchievementProgress')
      .select('user_id, achievement_id, current_value')
      .limit(3);
    
    if (!progressError) {
      console.log('✅ AchievementProgress table accessible');
      console.log('📈 Progress records found:', progress?.length || 0);
    } else {
      console.log('❌ AchievementProgress table error:', progressError.message);
    }

  } catch (error) {
    console.log('❌ Database test failed:', error.message);
  }

  // Test 3: Test specific achievement endpoints
  console.log('\n🎯 Test 3: Achievement Endpoints');
  
  // Get a sample user ID for testing
  const { data: sampleUser } = await supabase
    .from('Users')
    .select('id')
    .limit(1);
  
  if (sampleUser && sampleUser.length > 0) {
    const testUserId = sampleUser[0].id;
    console.log('🎭 Testing with user ID:', testUserId);

    // Test getUserAchievements endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/users/${testUserId}/achievements`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Get user achievements works');
        console.log('🏆 User has', data.achievements?.length || 0, 'achievements');
      } else {
        const errorData = await response.json();
        console.log('❌ Get user achievements failed:', response.status, errorData);
      }
    } catch (error) {
      console.log('❌ Get user achievements network error:', error.message);
    }

    // Test perfect session endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/users/${testUserId}/achievements/perfect-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consecutiveCorrect: 10,
          totalQuestions: 15,
          mode: 'practice'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Perfect Session endpoint works');
        console.log('🎉 Result:', data.message);
      } else {
        const errorData = await response.json();
        console.log('❌ Perfect Session endpoint failed:', response.status, errorData);
      }
    } catch (error) {
      console.log('❌ Perfect Session endpoint network error:', error.message);
    }

    // Test generic trigger endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/achievements/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          achievementType: 'Questions Answered',
          increment: 1,
          gameMode: 'practice'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Generic trigger endpoint works');
        console.log('🚀 Triggered achievements:', data.unlockedAchievements?.length || 0);
      } else {
        const errorData = await response.json();
        console.log('❌ Generic trigger endpoint failed:', response.status, errorData);
      }
    } catch (error) {
      console.log('❌ Generic trigger endpoint network error:', error.message);
    }

  } else {
    console.log('❌ No users found for testing');
  }

  console.log('\n🎯 Achievement System Debug Complete!');
}

testAchievementSystem().catch(console.error);
