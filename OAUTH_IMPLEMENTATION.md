# OAuth Google Login Implementation

## Problem Fixed

When users login with Google OAuth, the application was not retrieving/storing user information from the database, causing profile pages and other features to show empty or default values.

## Solution Implemented

### 1. Backend Changes

#### New OAuth Routes (`/backend/src/oauthRoutes.js`)

- **POST /oauth/user**: Handles OAuth user creation and retrieval
- Checks if user exists in database by email
- If user exists: returns existing user data
- If user doesn't exist: creates new user with OAuth data and default values
- Generates unique username if needed
- Sets default XP (1000) and level (5) for new OAuth users

#### Server Integration (`/backend/src/server.js`)

- Added OAuth routes to the server configuration

### 2. Frontend Changes

#### API Service (`/frontend/src/services/api.js`)

- **handleOAuthUser()**: New function to communicate with OAuth backend endpoint

#### NextAuth Configuration (`/frontend/src/lib/auth.js`)

- **signIn callback**: Intercepts Google OAuth login to call backend
- Retrieves user data from database and attaches to user object
- **jwt callback**: Enhanced to handle additional user fields (surname, joinDate, pfpURL)
- **session callback**: Enhanced to pass all user data to the session

## How It Works

1. User clicks "Sign in with Google"
2. Google OAuth flow completes successfully
3. NextAuth `signIn` callback is triggered
4. Frontend calls `handleOAuthUser()` API function
5. Backend checks if user exists in database
6. If new user: creates database record with OAuth data + defaults
7. If existing user: retrieves existing database record
8. User data is attached to NextAuth user object
9. JWT and session callbacks process the complete user data
10. Profile page and other components now have access to all user information

## Database Fields Handled

- `id`: Database user ID
- `name`: First name from Google
- `surname`: Last name from Google
- `username`: Generated from name or email
- `email`: Google email
- `xp`: Experience points (default: 1000)
- `currentLevel`: User level (default: 5)
- `joinDate`: Account creation date
- `pfpURL`: Profile picture URL from Google

## Testing

To test the OAuth implementation:

1. Ensure both backend (port 3000) and frontend (port 8080) are running
2. Navigate to login page
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. Check browser console for debug logs
6. Navigate to profile page to verify user data is displayed

## Environment Variables Required

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:8080
NEXTAUTH_SECRET=your_nextauth_secret
```
