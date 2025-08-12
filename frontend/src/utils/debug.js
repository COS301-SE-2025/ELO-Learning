// Simple debug utility to test connections
export async function testBackendConnection() {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running:', data);
      return true;
    } else {
      console.error('❌ Backend returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot connect to backend:', error.message);
    return false;
  }
}

export async function testNextAuthAPI() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/providers');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ NextAuth API is working:', Object.keys(data));
      return true;
    } else {
      console.error('❌ NextAuth API returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot connect to NextAuth API:', error.message);
    return false;
  }
}

// Call this in your browser console to debug
if (typeof window !== 'undefined') {
  window.debugELO = {
    testBackend: testBackendConnection,
    testNextAuth: testNextAuthAPI,
    testAll: async () => {
      console.log('🔍 Testing connections...');
      await testBackendConnection();
      await testNextAuthAPI();
    },
  };
}
