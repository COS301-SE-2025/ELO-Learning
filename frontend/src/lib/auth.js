import { handleOAuthUser } from '@/services/api'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

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
          )

          // Call your backend login endpoint directly
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/login`,
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
          )

          const data = await response.json()
          console.log('🔐 Backend response:', {
            success: response.ok,
            status: response.status,
          })

          if (response.ok && data.user) {
            console.log('✅ Login successful for user:', data.user.username)
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
              avatar: data.user.avatar,
            }
          } else {
            console.log('❌ Login failed:', data.error || 'Unknown error')
            return null
          }
        } catch (error) {
          console.error('🚫 Authentication error:', error)
          return null
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
          )

          // Attach database user data to the user object
          // This will be available in the JWT callback
          user.id = response.user.id
          user.username = response.user.username
          user.surname = response.user.surname
          user.xp = response.user.xp
          user.currentLevel = response.user.currentLevel
          user.joinDate = response.user.joinDate
          user.avatar = response.user.avatar

          return true
        } catch (error) {
          console.error('🚫 Error handling OAuth user:', error)
          return false // This will prevent sign in
        }
      }

      // For credentials provider, no additional processing needed
      return true
    },
    async jwt({ token, account, user, trigger, session }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }

      console.log('JWT callback:', {
        user,
        account,
        token,
        trigger,
        session,
      })

      if (trigger === 'update' && session?.user) {
        // Update token with user data from session
        token.id = session.user.id
        token.email = session.user.email
        token.name = session.user.name
        token.surname = session.user.surname
        token.username = session.user.username
        token.xp = session.user.xp || 0
        token.currentLevel = session.user.currentLevel || 1
        token.joinDate = session.user.joinDate
        token.avatar = session.user.avatar

      }

      // Persist user data in the token right after signin
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.surname = user.surname // Add surname for OAuth users
        token.username =
          user.username || user.name || user.email?.split('@')[0] // Fallback for Google users
        token.xp = user.xp || 0 // Default XP for new users
        token.currentLevel = user.currentLevel || 1 // Default level
        token.joinDate = user.joinDate // Add join date
        token.avatar = user.avatar
      }

      return token
    },
    async session({ session, token, trigger, newSession }) {
      // Send properties to the client, getting data from the token
      session.accessToken = token.accessToken
      console.log('Session callback:', {
        user: session.user,
        token,
        trigger,
        newSession,
      })

      // Pass user data from token to session
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.surname = token.surname
        session.user.username = token.username
        session.user.xp = token.xp
        session.user.currentLevel = token.currentLevel
        session.user.joinDate = token.joinDate
        session.user.avatar = token.avatar
      }

      return session
    },
  },
  pages: {
    signIn: '/login-landing',
    error: '/auth/error', // Error code passed in query string as ?error=
  },
  events: {
    async signOut(message) {
      // This runs when user signs out
      console.log('User signed out:', message)
    },
  },
}
