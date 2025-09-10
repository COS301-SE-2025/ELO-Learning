// Comprehensive Achievement Test
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';

async function testAchievements() {
  console.log('🧪 Comprehensive Achievement Test\n');

  try {
    // Test 1: Manual trigger via test endpoint
    console.log('🔧 Test 1: Manual Achievement Trigger');
    const testUserId = 153; // Using your user ID from the logs

    const response = await fetch(
      `${API_BASE_URL}/test-achievement/${testUserId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conditionType: 'Questions Answered',
          increment: 1,
        }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Manual trigger successful:', data);
    } else {
      const error = await response.text();
      console.log('❌ Manual trigger failed:', response.status, error);
    }

    // Test 2: Simulate real question submission
    console.log('\n🎯 Test 2: Real Question Submission');

    // You'll need to replace these with actual values from your database
    const testQuestionId = 1; // Replace with a real question ID
    const submitResponse = await fetch(
      `${API_BASE_URL}/question/${testQuestionId}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token', // You may need a real token
        },
        body: JSON.stringify({
          studentAnswer: 'test answer',
          userId: testUserId,
          questionType: 'Multiple Choice',
          gameMode: 'practice',
        }),
      },
    );

    if (submitResponse.ok) {
      const submitData = await submitResponse.json();
      console.log('✅ Question submission successful:', {
        success: submitData.success,
        isCorrect: submitData.data?.isCorrect,
        unlockedAchievements:
          submitData.data?.unlockedAchievements?.length || 0,
      });

      if (submitData.data?.unlockedAchievements?.length > 0) {
        console.log(
          '🏆 Unlocked achievements:',
          submitData.data.unlockedAchievements.map((a) => a.name),
        );
      }
    } else {
      const submitError = await submitResponse.text();
      console.log(
        '❌ Question submission failed:',
        submitResponse.status,
        submitError,
      );
    }

    // Test 3: Check user achievements
    console.log('\n📊 Test 3: Check User Achievements');
    const achievementsResponse = await fetch(
      `${API_BASE_URL}/users/${testUserId}/achievements`,
    );

    if (achievementsResponse.ok) {
      const achievementsData = await achievementsResponse.json();
      console.log('✅ User achievements fetched:', {
        count: achievementsData.achievements?.length || 0,
        achievements: achievementsData.achievements?.map((a) => a.name) || [],
      });
    } else {
      const achievementsError = await achievementsResponse.text();
      console.log(
        '❌ User achievements failed:',
        achievementsResponse.status,
        achievementsError,
      );
    }

    console.log('\n✅ Comprehensive test complete!');
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testAchievements();
