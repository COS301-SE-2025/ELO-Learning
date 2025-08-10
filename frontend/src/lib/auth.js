import { handleOAuthUser } from '@/services/api';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log(
            '🔐 Attempting credentials login for:',
            credentials.email,
          );

          // Call your backend login endpoint directly
          const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();
          console.log('🔐 Backend response:', {
            success: response.ok,
            status: response.status,
          });

          if (response.ok && data.user) {
            console.log('✅ Login successful for user:', data.user.username);
            // Return user object if authentication successful
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || data.user.username,
              surname: data.user.surname,
              username: data.user.username,
              xp: data.user.xp || 0,
              currentLevel: data.user.currentLevel || 1,
              joinDate: data.user.joinDate,
              pfpURL: data.user.pfpURL,
              // Store the JWT token from backend
              backendToken: data.token,
            };
          } else {
            console.log('❌ Login failed:', data.error || 'Unknown error');
            return null;
          }
        } catch (error) {
          console.error('🚫 Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth providers (Google, etc.)
      if (account?.provider === 'google') {
        try {
          // Call our backend to handle OAuth user creation/retrieval
          const response = await handleOAuthUser(
            user.email,
            user.name,
            user.image,
            account.provider,
          );

          // Attach database user data to the user object
          // This will be available in the JWT callback
          user.id = response.user.id;
          user.username = response.user.username;
          user.surname = response.user.surname;
          user.xp = response.user.xp;
          user.currentLevel = response.user.currentLevel;
          user.joinDate = response.user.joinDate;
          user.pfpURL = response.user.pfpURL;
          
          // 🔑 IMPORTANT: Pass the JWT token for OAuth users too
          user.accessToken = response.token;

          return true;
        } catch (error) {
          console.error('🚫 Error handling OAuth user:', error);
          return false; // This will prevent sign in
        }
      }

      // For credentials provider, no additional processing needed
      return true;
    },
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }

      // Persist user data in the token right after signin
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.surname = user.surname; // Add surname for OAuth users
        token.username =
          user.username || user.name || user.email?.split('@')[0]; // Fallback for Google users
        token.xp = user.xp || 0; // Default XP for new users
        token.currentLevel = user.currentLevel || 1; // Default level
        token.joinDate = user.joinDate; // Add join date
        token.pfpURL = user.pfpURL || user.image; // Use database pfpURL or OAuth image
        // Store the backend JWT token for API calls
        token.backendToken = user.backendToken;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, getting data from the token
      session.accessToken = token.accessToken;

      // Pass user data from token to session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.surname = token.surname;
        session.user.username = token.username;
        session.user.xp = token.xp;
        session.user.currentLevel = token.currentLevel;
        session.user.joinDate = token.joinDate;
        session.user.pfpURL = token.pfpURL;
        // Pass backend JWT token to session
        session.backendToken = token.backendToken;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login-landing',
    error: '/auth/error', // Error code passed in query string as ?error=
  },
  events: {
    async signOut(message) {
      // This runs when user signs out
      console.log('User signed out:', message);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata);
      }
    },
  },
};
