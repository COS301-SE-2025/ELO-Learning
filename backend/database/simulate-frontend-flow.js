// Complete Achievement System Test - Simulating Frontend Flow
import { supabase } from './supabaseClient.js';

const API_BASE_URL = 'http://localhost:3000';

async function simulateFrontendAchievementFlow() {
  console.log('🎮 Simulating Frontend Achievement Flow...\n');

  // Get a test user and question
  const { data: testUser } = await supabase.from('Users').select('id').limit(1);

  const { data: testQuestion } = await supabase
    .from('Questions')
    .select('Q_id, type, topic')
    .limit(1);

  if (
    !testUser ||
    !testQuestion ||
    testUser.length === 0 ||
    testQuestion.length === 0
  ) {
    console.log('❌ No test user or question found');
    return;
  }

  const userId = testUser[0].id;
  const questionId = testQuestion[0].Q_id;

  console.log('🎭 Test Setup:', {
    userId,
    questionId,
    questionType: testQuestion[0].type,
  });

  // Test 1: Submit a question answer (this should trigger achievements)
  console.log('\n📝 Test 1: Question Submission with Achievement Triggers');
  try {
    const response = await fetch(
      `${API_BASE_URL}/question/${questionId}/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswer: '42', // Dummy answer
          userId: userId,
          questionType: testQuestion[0].type,
          timeSpent: 5,
          gameMode: 'practice',
        }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Question submission successful');
      console.log('🎯 Is Correct:', data.data.isCorrect);
      console.log(
        '🏆 Unlocked Achievements:',
        data.data.unlockedAchievements?.length || 0,
      );

      if (
        data.data.unlockedAchievements &&
        data.data.unlockedAchievements.length > 0
      ) {
        console.log('🎉 Achievement Details:');
        data.data.unlockedAchievements.forEach((ach, index) => {
          console.log(
            `  ${index + 1}. ${ach.name || ach.achievement_name} - ${
              ach.description
            }`,
          );
        });
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Question submission failed:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ Question submission network error:', error.message);
  }

  // Test 2: Perfect Session Achievement
  console.log('\n🎯 Test 2: Perfect Session Achievement');
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/achievements/perfect-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consecutiveCorrect: 10,
          totalQuestions: 15,
          mode: 'practice',
        }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Perfect Session endpoint works');
      console.log('📄 Message:', data.message);
      console.log(
        '🏆 Unlocked:',
        data.unlockedAchievements?.length || 0,
        'achievements',
      );
    } else {
      const errorData = await response.json();
      console.log('❌ Perfect Session failed:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ Perfect Session network error:', error.message);
  }

  // Test 3: Speed Solver Achievement
  console.log('\n⚡ Test 3: Speed Solver Achievement');
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/achievements/speed-solver`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          averageTime: 8,
          correctCount: 5,
          sessionData: {
            totalQuestions: 10,
            mode: 'practice',
          },
        }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Speed Solver endpoint works');
      console.log('📄 Message:', data.message);
      console.log(
        '🏆 Unlocked:',
        data.unlockedAchievements?.length || 0,
        'achievements',
      );
    } else {
      const errorData = await response.json();
      console.log('❌ Speed Solver failed:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ Speed Solver network error:', error.message);
  }

  // Test 4: Never Give Up Achievement
  console.log('\n💪 Test 4: Never Give Up Achievement');
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/achievements/never-give-up`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: questionId,
          isCorrect: true,
          attemptNumber: 5,
        }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Never Give Up endpoint works');
      console.log('📄 Message:', data.message);
      console.log(
        '🏆 Unlocked:',
        data.unlockedAchievements?.length || 0,
        'achievements',
      );
    } else {
      const errorData = await response.json();
      console.log('❌ Never Give Up failed:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ Never Give Up network error:', error.message);
  }

  // Test 5: Frontend API Route (simulating what your Next.js frontend calls)
  console.log('\n🌐 Test 5: Frontend API Route');
  try {
    // This simulates your frontend calling /api/achievements/trigger
    const frontendAPIResponse = await fetch(
      'http://localhost:3001/api/achievements/trigger',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          achievementType: 'Perfect Session',
          context: {
            consecutiveCorrect: 10,
            totalQuestions: 15,
            mode: 'practice',
          },
        }),
      },
    );

    if (frontendAPIResponse.ok) {
      const data = await frontendAPIResponse.json();
      console.log('✅ Frontend API route works');
      console.log('📄 Message:', data.message);
      console.log(
        '🏆 Unlocked:',
        data.unlockedAchievements?.length || 0,
        'achievements',
      );
    } else {
      console.log(
        '❌ Frontend API route failed (expected if frontend not running):',
        frontendAPIResponse.status,
      );
    }
  } catch (error) {
    console.log(
      '❌ Frontend API route not accessible (expected if frontend not running)',
    );
  }

  // Test 6: Check what achievements the user actually has
  console.log('\n📊 Test 6: User Achievement Status');
  try {
    const { data: userAchievements, error } = await supabase
      .from('UserAchievements')
      .select(
        `
        unlocked_at,
        Achievements (
          id, name, description, condition_type, condition_value
        )
      `,
      )
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
      .limit(10);

    if (!error) {
      console.log(
        '✅ User has',
        userAchievements?.length || 0,
        'total achievements',
      );
      if (userAchievements && userAchievements.length > 0) {
        console.log('🏆 Recent achievements:');
        userAchievements.slice(0, 3).forEach((ua, index) => {
          console.log(
            `  ${index + 1}. ${ua.Achievements.name} - unlocked at ${
              ua.unlocked_at
            }`,
          );
        });
      }
    } else {
      console.log('❌ Failed to check user achievements:', error.message);
    }
  } catch (error) {
    console.log('❌ Database achievement check failed:', error.message);
  }

  console.log('\n🎯 Frontend Flow Simulation Complete!');
  console.log('\n📋 Summary:');
  console.log('1. Question submission should trigger basic achievements');
  console.log(
    '2. Perfect Session, Speed Solver, Never Give Up endpoints available',
  );
  console.log('3. Frontend API routes proxy to backend');
  console.log('4. Check browser console and network tab for frontend issues');
}

simulateFrontendAchievementFlow().catch(console.error);
