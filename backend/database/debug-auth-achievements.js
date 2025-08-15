// Achievement System Debug Test - With Authentication

const API_BASE_URL = 'http://localhost:3000';

// You need to replace this with an actual token from your frontend
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk2LCJpYXQiOjE3MzQ0MjU4MzUsImV4cCI6MTczNDQyOTQzNX0.test'; // Replace with real token

async function testWithAuth() {
  console.log('🧪 Testing Achievement System with Authentication...\n');

  const testUserId = 96; // Using the user ID from previous test

  // Test authenticated endpoints
  console.log('🔐 Test: Authenticated Achievement Endpoints');
  
  try {
    // Test get user achievements with auth
    const response = await fetch(`${API_BASE_URL}/users/${testUserId}/achievements`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Get user achievements with auth works');
      console.log('🏆 User has', data.achievements?.length || 0, 'achievements');
      if (data.achievements && data.achievements.length > 0) {
        console.log('📝 Sample achievement:', data.achievements[0].name);
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Get user achievements with auth failed:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ Authenticated endpoint network error:', error.message);
  }

  // Test trigger endpoint with auth
  try {
    const response = await fetch(`${API_BASE_URL}/achievements/trigger`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        userId: testUserId,
        achievementType: 'Questions Answered',
        increment: 1,
        gameMode: 'practice'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Trigger endpoint with auth works');
      console.log('🚀 Triggered achievements:', data.unlockedAchievements?.length || 0);
      console.log('📄 Message:', data.message);
    } else {
      const errorData = await response.json();
      console.log('❌ Trigger endpoint with auth failed:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ Trigger endpoint network error:', error.message);
  }

  console.log('\n🎯 Authenticated Test Complete!');
}

// Simple test without authentication to check basic connectivity
async function testBasicConnectivity() {
  console.log('🔌 Basic Connectivity Test\n');
  
  try {
    // Test question submission endpoint (this is what your frontend actually calls)
    const response = await fetch(`${API_BASE_URL}/question/1/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentAnswer: '42',
        userId: 96,
        questionType: 'Math Input',
        timeSpent: 5,
        gameMode: 'practice'
      })
    });

    console.log('📡 Question submit status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Question submit endpoint works');
      console.log('🎯 Response data keys:', Object.keys(data));
    } else {
      const errorData = await response.json();
      console.log('❌ Question submit failed:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ Question submit network error:', error.message);
  }
}

console.log('🚀 Starting comprehensive achievement system test...\n');

testBasicConnectivity()
  .then(() => testWithAuth())
  .catch(console.error);
