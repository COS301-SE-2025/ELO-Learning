# Push Notifications Setup Guide for ELO Learning

This guide will help you set up Firebase Cloud Messaging (FCM) push notifications for your ELO Learning application.

## Prerequisites

1. Firebase project
2. Service account key from Firebase
3. Frontend and backend properly configured

## Backend Setup (Already Done)

✅ **Installed Dependencies:**

- `firebase-admin` package

✅ **Created Files:**

- `src/services/firebaseConfig.js` - Firebase Admin SDK configuration
- `src/services/pushNotificationService.js` - Push notification service
- `src/pushNotificationRoutes.js` - API routes for notifications
- `database/add_fcm_support.sql` - Database schema updates

✅ **Updated Files:**

- `src/server.js` - Added push notification routes
- `src/singlePlayerRoutes.js` - Added level-up notifications

## Frontend Setup (Already Done)

✅ **Created Files:**

- `src/services/firebase.js` - Firebase client configuration
- `src/hooks/usePushNotifications.jsx` - React hook for push notifications
- `src/components/NotificationSettings.jsx` - Settings component
- `public/firebase-messaging-sw.js` - Service worker for background notifications
- `.env.local` - Environment variables template

## Required Configuration

### 1. Firebase Project Setup

1. **Create a Firebase Project:**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Cloud Messaging

2. **Generate Service Account Key:**

   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

3. **Get Web App Configuration:**

   - Go to Project Settings > General
   - Add a web app if you haven't
   - Copy the config object

4. **Generate VAPID Key:**
   - Go to Project Settings > Cloud Messaging
   - Generate a new key pair
   - Copy the key

### 2. Backend Environment Variables

Update your `backend/.env` file:

```env
# Firebase Configuration for Push Notifications
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"

# Alternative: Use service account file (base64 encoded)
# FIREBASE_SERVICE_ACCOUNT_PATH=base64-encoded-service-account-json
```

### 3. Frontend Environment Variables

Update your `frontend/.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

### 4. Database Setup

Run the SQL script to add FCM support to your database:

```sql
-- Run this in your Supabase SQL editor
-- File: backend/database/add_fcm_support.sql
```

### 5. Update Service Worker Configuration

Update `frontend/public/firebase-messaging-sw.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: 'your-actual-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
};
```

## Usage

### 1. In Your React Components

```javascript
import { usePushNotifications } from '../hooks/usePushNotifications';
import NotificationSettings from '../components/NotificationSettings';

function UserProfile({ userId }) {
  const { notificationPermission, requestPermission } =
    usePushNotifications(userId);

  return (
    <div>
      {/* Your profile content */}
      <NotificationSettings userId={userId} />
    </div>
  );
}
```

### 2. API Endpoints

The following endpoints are available:

- `POST /notifications/register-token` - Register FCM token
- `POST /notifications/send-test` - Send test notification
- `POST /notifications/send-game-invitation` - Send game invitation
- `POST /notifications/send-level-up` - Send level up notification
- `POST /notifications/send-achievement` - Send achievement notification
- `POST /notifications/send-to-level` - Send bulk notification to specific level
- `POST /notifications/remove-token` - Remove FCM token

### 3. Automatic Notifications

Notifications are automatically sent for:

- ✅ Level ups (already integrated in singlePlayerRoutes.js)
- ✅ Rank ups (already integrated in singlePlayerRoutes.js)
- 🔄 Game invitations (you can integrate in multiplayer logic)
- 🔄 Achievements (you can integrate when achievements are earned)

## Testing

1. **Enable notifications** in your app settings
2. **Send a test notification** using the NotificationSettings component
3. **Check browser console** for any errors
4. **Test background notifications** by minimizing the browser

## Troubleshooting

### Common Issues

1. **"Firebase messaging not available"**

   - Check that all environment variables are set
   - Ensure service worker is properly registered

2. **"Permission denied"**

   - User needs to enable notifications in browser settings
   - Clear site data and try again

3. **Tokens not registering**

   - Check network requests in browser dev tools
   - Verify backend API is working

4. **Background notifications not working**
   - Ensure service worker is registered
   - Check service worker console for errors

### Debug Commands

```javascript
// Check notification permission
console.log('Permission:', Notification.permission);

// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(console.log);

// Check FCM token
// (Available in usePushNotifications hook)
```

## Security Notes

1. **Never expose private keys** in frontend code
2. **Use environment variables** for all sensitive data
3. **Validate user permissions** before sending notifications
4. **Rate limit** notification endpoints to prevent spam

## Next Steps

1. Configure your Firebase project with the actual values
2. Test the notification system
3. Integrate with your existing user authentication
4. Add custom notification types for your specific use cases
5. Set up monitoring and analytics for notification delivery

---

**Need Help?**

- Check Firebase Console for error logs
- Review browser console for client-side errors
- Test with different browsers and devices
