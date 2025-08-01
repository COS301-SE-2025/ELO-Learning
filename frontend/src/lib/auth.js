import { loginUser } from '@/services/api'
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    // Add your authentication logic here
                    // This is where you would validate the user's credentials
                    // For example, check against your database or API

                    // Replace this with your actual authentication logic
                    const response = await loginUser(credentials.email, credentials.password)

                    if (response.user) {
                        // Return user object if authentication successful
                        console.log('User authenticated:', response.user)
                        return {
                            id: response.user.id,
                            email: response.user.email,
                            name: response.user.name || response.user.username,
                            username: response.user.username,
                            xp: response.user.xp,
                            currentLevel: response.user.currentLevel,
                            // Add any other fields your backend returns
                        }
                    } else {
                        // Return null if authentication failed
                        return null
                    }
                } catch (error) {
                    console.error("Authentication error:", error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, account, user }) {
            console.log('🔧 JWT Callback:', {
                hasAccount: !!account,
                hasUser: !!user,
                userKeys: user ? Object.keys(user) : [],
                accountProvider: account?.provider
            })

            // Persist the OAuth access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token
            }

            // Persist user data in the token right after signin
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.username = user.username || user.name || user.email?.split('@')[0] // Fallback for Google users
                token.xp = user.xp || 0 // Default XP for new users
                token.currentLevel = user.currentLevel || 1 // Default level

                console.log('🔧 JWT - Stored user data:', {
                    id: token.id,
                    username: token.username,
                    xp: token.xp
                })
            }

            return token
        },
        async session({ session, token }) {
            console.log('🔧 Session Callback:', {
                hasToken: !!token,
                tokenKeys: token ? Object.keys(token) : []
            })

            // Send properties to the client, getting data from the token
            session.accessToken = token.accessToken

            // Pass user data from token to session
            if (token) {
                session.user.id = token.id
                session.user.email = token.email
                session.user.name = token.name
                session.user.username = token.username
                session.user.xp = token.xp
                session.user.currentLevel = token.currentLevel

                console.log('🔧 Session - Final user data:', {
                    id: session.user.id,
                    username: session.user.username,
                    xp: session.user.xp
                })
            }

            return session
        },
    },
}
