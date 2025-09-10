import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

// Create server-safe OAuth handler (no caching)
async function handleOAuthUserServer(email, name, image, provider) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }

    const response = await fetch(
      `${apiUrl}/oauth/user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          image,
          provider,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('OAuth user creation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Server-side OAuth handling failed:', error);
    throw error;
  }
}

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
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (!apiUrl) {
            console.error('NEXT_PUBLIC_API_URL is not configured');
            return null;
          }

          const response = await fetch(
            `${apiUrl}/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            },
          );

          const data = await response.json();

          if (response.ok && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || data.user.username,
              surname: data.user.surname,
              username: data.user.username,
              xp: data.user.xp || 0,
              currentLevel: data.user.currentLevel || 1,
              joinDate: data.user.joinDate,
              avatar: data.user.avatar,
              // Store the JWT token from backend
              backendToken: data.token,
              elo_rating: data.user.elo_rating,
              rank: data.user.rank,
              baseLineTest: data.user.baseLineTest,
            };
          } else {
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
      if (account?.provider === 'google') {
        try {
          // Use server-safe OAuth handler (no caching)
          const response = await handleOAuthUserServer(
            user.email,
            user.name,
            user.image,
            account.provider,
          );

          //  Store the backend JWT token for Google users
          user.id = response.user.id;
          user.username = response.user.username;
          user.surname = response.user.surname;
          user.xp = response.user.xp;
          user.currentLevel = response.user.currentLevel;
          user.joinDate = response.user.joinDate;
          user.avatar = response.user.avatar;
          user.backendToken = response.token; // This was missing!
          user.elo_rating = response.user.elo_rating;
          user.rank = response.user.rank;
          user.baseLineTest = response.user.baseLineTest;

          return true;
        } catch (error) {
          console.error('🚫 Error handling OAuth user:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, account, user, trigger, session }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }

      if (trigger === 'update' && session?.user) {
        // Update token with user data from session
        token.id = session.user.id;
        token.email = session.user.email;
        token.name = session.user.name;
        token.surname = session.user.surname;
        token.username = session.user.username;
        token.xp = session.user.xp || 0;
        token.currentLevel = session.user.currentLevel || 1;
        token.joinDate = session.user.joinDate;
        token.avatar = session.user.avatar;
        token.elo_rating = session.user.elo_rating;
        token.rank = session.user.rank;
        token.baseLineTest = session.user.baseLineTest;
      }

      // Persist user data in the token right after signin
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.surname = user.surname;
        token.username =
          user.username || user.name || user.email?.split('@')[0];
        token.xp = user.xp || 0;
        token.currentLevel = user.currentLevel || 1;
        token.joinDate = user.joinDate;
        token.avatar = user.avatar;
        //  Store the backend JWT token for ALL users (credentials + OAuth)
        token.backendToken = user.backendToken;
        token.elo_rating = user.elo_rating;
        token.rank = user.rank;
        token.baseLineTest = user.baseLineTest;
      }

      return token;
    },
    async session({ session, token, trigger, newSession }) {
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
        session.user.avatar = token.avatar;
        //  Pass backend JWT token to session for ALL users
        session.backendToken = token.backendToken;
        session.user.elo_rating = token.elo_rating;
        session.user.rank = token.rank;
        session.user.baseLineTest = token.baseLineTest;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login-landing',
    error: '/auth/error',
  },
  events: {
    async signOut(message) {
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
