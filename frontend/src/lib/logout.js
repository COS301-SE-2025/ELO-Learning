import { signOut } from 'next-auth/react'
import { deleteCookie } from '../app/lib/authCookie'

/**
 * Simplified logout function that clears authentication data efficiently
 * Works for both OAuth users and credential users
 */
export async function performLogout() {
    try {
        // Clear custom auth cookie (for credential users) - non-blocking
        deleteCookie().catch(console.error)

        // Clear localStorage (if used) - immediate and lightweight
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('questionsObj') // Clean up any game data
            sessionStorage.removeItem('submittedOnce') // Clean up session data
        }

        // Sign out from NextAuth (for OAuth users and credentials)
        // NextAuth should handle clearing its own cookies properly
        await signOut({
            callbackUrl: '/', // Redirect to home page after logout
            redirect: true
        })
    } catch (error) {
        console.error('Logout error:', error)
        // Fallback: redirect to home page even if there's an error
        if (typeof window !== 'undefined') {
            window.location.href = '/'
        }
    }
}
