// services/firebaseConfig.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    try {
      // Option 1: Using service account key file (recommended for production)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccount = JSON.parse(
          Buffer.from(
            process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
            'base64',
          ).toString('utf-8'),
        );

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      }
      // Option 2: Using individual environment variables
      else if (
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL
      ) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        console.warn(
          'Firebase credentials not found. Push notifications will not work.',
        );
        return null;
      }

      console.log('✅ Firebase Admin SDK initialized successfully');
      return admin;
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin SDK:', error.message);
      return null;
    }
  }
  return admin;
};

export { initializeFirebase };
export default admin;
