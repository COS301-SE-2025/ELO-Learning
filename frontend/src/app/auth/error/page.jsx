'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Username or password incorrect, please try again';
      case 'OAuthSignin':
        return 'Error with OAuth provider. Please try again.';
      case 'OAuthCallback':
        return 'Error in OAuth callback. Please try again.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account. Please try again.';
      case 'EmailCreateAccount':
        return 'Could not create account with email. Please try again.';
      case 'Callback':
        return 'Error in callback. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'OAuth account not linked. Please sign in with the same account you used originally.';
      case 'EmailSignin':
        return 'Check your email address.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to access this resource.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 text-center">
            <p className="text-red-600 text-sm">{getErrorMessage(error)}</p>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href="/login-landing"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
