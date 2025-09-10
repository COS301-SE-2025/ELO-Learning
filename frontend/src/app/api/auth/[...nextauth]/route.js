import { authOptions } from '@/lib/auth';
import NextAuth from 'next-auth';

// Create the handler with error handling
const handler = NextAuth(authOptions);

// Wrap the handler to catch errors
const wrappedHandler = async (req, ...args) => {
  try {
    return await handler(req, ...args);
  } catch (error) {
    console.error('NextAuth API Error:', error);
    
    // Return a proper error response
    return new Response(
      JSON.stringify({ 
        error: 'Authentication service error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

export { wrappedHandler as GET, wrappedHandler as POST };

