// Simple Achievement Test
const API_BASE_URL = 'http://localhost:3000';

async function simpleTest() {
  console.log('🧪 Simple Achievement Test\n');

  try {
    console.log('1. Testing server connectivity...');
    const response = await fetch(`${API_BASE_URL}/achievement-categories`);
    if (response.ok) {
      console.log('✅ Server is running and reachable');
      const data = await response.json();
      console.log(
        '📊 Found',
        data.categories?.length || 0,
        'achievement categories',
      );
    } else {
      console.log('❌ Server responded with status:', response.status);
    }

    console.log('\n2. Testing Perfect Session endpoint...');
    const perfectResponse = await fetch(
      `${API_BASE_URL}/users/96/achievements/perfect-session`,
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

    if (perfectResponse.ok) {
      const data = await perfectResponse.json();
      console.log('✅ Perfect Session endpoint works');
      console.log('🎉 Response:', data);
    } else {
      const errorData = await perfectResponse.json();
      console.log(
        '❌ Perfect Session failed:',
        perfectResponse.status,
        errorData,
      );
    }

    console.log('\n3. Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  process.exit(0);
}

simpleTest();
