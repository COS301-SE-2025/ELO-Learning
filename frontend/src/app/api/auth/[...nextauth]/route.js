import { loginUser } from '@/services/api'
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
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
            // Persist the OAuth access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token
            }

            // Persist user data in the token right after signin
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.username = user.username
                token.xp = user.xp
                token.currentLevel = user.currentLevel
                // Add any other user properties you want to persist
            }

            return token
        },
        async session({ session, token }) {
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
            }

            return session
        },
    },
})

export { handler as GET, handler as POST }
