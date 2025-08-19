// Cache Testing Utilities
// Copy and paste these functions into your browser console for testing

// 1. Check current cache status
function checkCache() {
  console.log('🔍 Current Cache Status:');
  console.log('========================');

  const keys = [
    'nextauth_session',
    'user',
    'cached_leaderboard',
    'cached_questions',
    'user_achievements',
    'user_progress',
  ];

  keys.forEach((key) => {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        const parsed = JSON.parse(item);
        console.log(`✅ ${key}:`, {
          size: `${(item.length / 1024).toFixed(2)} KB`,
          timestamp: new Date(parsed.timestamp),
          expiresIn: `${Math.round(
            (parsed.expiryTime - (Date.now() - parsed.timestamp)) / 1000 / 60,
          )} minutes`,
          data: parsed.data,
        });
      } catch (e) {
        console.log(`❌ ${key}: Invalid JSON`);
      }
    } else {
      console.log(`⚪ ${key}: Not cached`);
    }
  });

  // Total cache size
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length;
    }
  }
  console.log(`\n📊 Total cache size: ${(totalSize / 1024).toFixed(2)} KB`);
}

// 2. Clear specific cache items
function clearCache(key = null) {
  if (key) {
    localStorage.removeItem(key);
    console.log(`🗑️ Cleared cache for: ${key}`);
  } else {
    localStorage.clear();
    console.log('🗑️ Cleared all cache');
  }
}

// 3. Test cache expiry
function testCacheExpiry(key) {
  const item = localStorage.getItem(key);
  if (item) {
    try {
      const parsed = JSON.parse(item);
      const now = Date.now();
      const timeLeft = parsed.expiryTime - (now - parsed.timestamp);

      console.log(`⏰ Cache expiry for ${key}:`);
      console.log(`   Expires in: ${Math.round(timeLeft / 1000 / 60)} minutes`);
      console.log(`   Created: ${new Date(parsed.timestamp).toLocaleString()}`);
      console.log(
        `   Expires: ${new Date(
          parsed.timestamp + parsed.expiryTime,
        ).toLocaleString()}`,
      );

      if (timeLeft <= 0) {
        console.log('   ⚠️ Cache has expired!');
      } else {
        console.log('   ✅ Cache is still valid');
      }
    } catch (e) {
      console.log(`❌ Invalid cache format for ${key}`);
    }
  } else {
    console.log(`❌ No cache found for ${key}`);
  }
}

// 4. Simulate cache operations
function simulateXPUpdate() {
  console.log('🎮 Simulating XP update...');

  // Get current user from cache
  const userCache = localStorage.getItem('user');
  if (userCache) {
    try {
      const parsed = JSON.parse(userCache);
      const currentXP = parsed.data?.xp || 0;
      const newXP = currentXP + 100;

      // Update cache
      parsed.data.xp = newXP;
      parsed.timestamp = Date.now(); // Update timestamp
      localStorage.setItem('user', JSON.stringify(parsed));

      console.log(`✅ XP updated: ${currentXP} → ${newXP}`);
      console.log('🔄 Cache updated with new XP value');
    } catch (e) {
      console.log('❌ Failed to update XP in cache');
    }
  } else {
    console.log('❌ No user cache found');
  }
}

// 5. Monitor cache changes
function monitorCache() {
  console.log('👀 Starting cache monitor...');
  console.log('Any localStorage changes will be logged below:');

  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;

  localStorage.setItem = function (key, value) {
    console.log(
      `📝 Cache SET: ${key} (${(value.length / 1024).toFixed(2)} KB)`,
    );
    originalSetItem.apply(this, arguments);
  };

  localStorage.removeItem = function (key) {
    console.log(`🗑️ Cache REMOVE: ${key}`);
    originalRemoveItem.apply(this, arguments);
  };

  console.log('✅ Cache monitor active');
}

// Quick commands
console.log('🚀 Cache Testing Utilities Loaded!');
console.log('📚 Available commands:');
console.log('   checkCache() - View current cache status');
console.log('   clearCache() - Clear all cache');
console.log('   clearCache("key") - Clear specific cache');
console.log('   testCacheExpiry("key") - Check expiry time');
console.log('   simulateXPUpdate() - Test XP cache update');
console.log('   monitorCache() - Monitor cache changes');
console.log('');
console.log('💡 Start with: checkCache()');

// Auto-run cache check
checkCache();
