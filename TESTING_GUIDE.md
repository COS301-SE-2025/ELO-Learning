# 🧪 Caching System Testing Guide

## Quick Start Testing

### 1. **Add the Test Component to a Page**

First, let's add the CachingExample component to a page so you can test it:

**Option A: Add to Dashboard**

```jsx
// In src/app/dashboard/page.jsx
import CachingExample from '../components/CachingExample';

export default function Dashboard() {
  return (
    <div>
      {/* Your existing dashboard content */}

      {/* Add this for testing */}
      <CachingExample />
    </div>
  );
}
```

**Option B: Create a Test Page**

```jsx
// Create src/app/test-cache/page.jsx
import CachingExample from '../components/CachingExample';

export default function TestCachePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Cache Testing</h1>
      <CachingExample />
    </div>
  );
}
```

### 2. **Basic Functionality Test**

1. **Start your app:**

   ```bash
   npm run dev
   ```

2. **Login** with either method:

   - Email/password: Use your existing credentials
   - Google OAuth: Click "Sign in with Google"

3. **Navigate to test page:**

   - If added to dashboard: `http://localhost:8080/dashboard`
   - If created test page: `http://localhost:8080/test-cache`

4. **Check if the component loads** and shows your user data

## 🔍 Detailed Testing Scenarios

### Test 1: Cache Storage

1. Login and go to the test page
2. Open Browser Dev Tools (F12)
3. Go to **Application → Local Storage → <http://localhost:8080>**
4. You should see entries like:
   - `nextauth_session`
   - `user`
   - `cached_leaderboard` (if you visited dashboard)

### Test 2: Session Caching

1. Login and verify user data shows in the test component
2. **Refresh the page** (F5)
3. **Check:** User data should load instantly (from cache)
4. **Check:** No delay or "loading" state

### Test 3: Cache Updates

1. Click "Award 100 XP" button in the test component
2. **Check:** XP value updates immediately in the component
3. **Check:** Header XP also updates (if using cached session)
4. Refresh page - new XP should persist

### Test 4: Cache Clearing

1. Click "Clear Cache" button
2. Check Dev Tools - Local Storage should be cleared
3. **Check:** Component still works (falls back to NextAuth session)

### Test 5: Logout Cache Clearing

1. Click "Sign Out" button
2. **Check:** All cache data is cleared
3. **Check:** Redirected to login page
4. **Check:** No user data persists

## 🐛 Debugging Common Issues

### Issue 1: "Cannot read properties of undefined"

```bash
# Check if the hook files exist and are imported correctly
Error: useSessionWithCache is not a function
```

**Solution:** Make sure the hook file exists and export is correct

### Issue 2: Cache not updating

```bash
# Check browser console for errors
```

**Solution:** Verify the cache keys match and no localStorage errors

### Issue 3: Session not loading

```bash
# Check NextAuth configuration
```

**Solution:** Ensure NextAuth is properly configured and session provider wraps the app

## 🔬 Advanced Testing

### Test API Caching

1. Go to dashboard (triggers leaderboard API call)
2. Check Network tab - should see API call
3. Refresh page - should **not** see API call (using cache)
4. Wait 5+ minutes, refresh - should see new API call (cache expired)

### Test Cross-Component Updates

1. Open test page in one tab
2. Open dashboard in another tab
3. Update XP in test page
4. Check if dashboard header updates immediately

### Test Different Auth Providers

1. Login with email/password - test caching
2. Logout
3. Login with Google OAuth - test caching
4. Verify cache works for both auth methods

## 📊 Performance Testing

### Before/After Network Comparison

1. **Clear cache and logout**
2. **Login and navigate around** - count network requests in Dev Tools
3. **Refresh and navigate again** - should see fewer requests

### Cache Size Monitoring

```javascript
// Run in browser console to check cache size
function getCacheSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length;
    }
  }
  console.log(`Cache size: ${(total / 1024).toFixed(2)} KB`);
}
getCacheSize();
```

## 🚨 Troubleshooting

### If CachingExample component doesn't show

1. Check file path in import
2. Verify the component file exists
3. Check for any build errors

### If session data is undefined

1. Ensure you're logged in
2. Check NextAuth configuration
3. Verify the session provider wraps your app

### If cache isn't working

1. Check browser support for localStorage
2. Verify no browser privacy settings blocking storage
3. Check console for JavaScript errors

## ✅ Success Criteria

Your caching system is working correctly if:

- ✅ User data loads instantly after page refresh
- ✅ XP updates reflect immediately across components
- ✅ Cache persists across browser tabs
- ✅ Cache clears properly on logout
- ✅ Both auth methods work with caching
- ✅ Network requests are reduced for cached data

## 🎯 Next Steps After Testing

Once testing is successful:

1. **Replace `useSession` with `useSessionWithCache`** in other components
2. **Add caching to more API calls** using the patterns we've established
3. **Monitor cache performance** in production
4. **Consider adding cache warming** for critical data

Let me know what you find during testing, and I'll help troubleshoot any issues!
