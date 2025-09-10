'use client';
import { SafeButton } from '@/components/SafeButton';
import { Eye, EyeOff, X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');

    // More robust callback URL construction for test environment
    let baseUrl;

    if (typeof window !== 'undefined') {
      // In browser environment (including Cypress)
      baseUrl = window.location.origin;
    } else {
      // Fallback for server-side
      baseUrl =
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        process.env.NEXTAUTH_URL ||
        'http://localhost:8080';
    }

    const callbackUrl = `${baseUrl}/dashboard`;

    try {
      const result = await signIn('credentials', {
        callbackUrl,
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Username or password incorrect, please try again');
        return; // Don't throw error, just return
      } else {
        // Clear any existing cache before redirecting
        const { cache } = await import('../../../utils/cache');
        cache.clear();

        // Redirect to dashboard
        router.push('/dashboard');
        console.log('Login successful:', result);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between p-3">
      <div>
        <div className="flex flex-row items-center justify-between w-full px-4 py-2">
          <Link href="/login-landing">
            <X size={24} />
          </Link>
          <p className="form_heading mx-auto absolute left-1/2 transform -translate-x-1/2 text-center">
            Enter your information
          </p>
        </div>
        {/* A form to input a name and email */}
        <form>
          <div className="flex flex-col items-center w-full px-4 md:px-0">
            <div className="relative w-[90vw] md:w-[500px]">
              <input
                type="text"
                placeholder="Username or email"
                className="input-field w-full top_form_input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative w-[90vw] md:w-[500px]">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="input-field w-full bottom_form_input pr-14"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="break_small"></div>
            {error && (
              <p className="text-[#FF6666] text-center mb-4 w-[90vw] md:w-[500px]">
                {error}
              </p>
            )}
            <SafeButton
              onClick={handleSubmit}
              className="main-button px-2 py-8"
              loadingText="Signing In..."
            >
              Continue
            </SafeButton>
          </div>
        </form>
        <div>
          <Link href="/login-landing/forgot-password">
            <p className="text-center font-bold py-3 text-[#ff6e99] hover:text-[#ffffff] hover:font-bold hover:scale-1.1% w-[90vw] md:w-[500px] mx-auto">
              Forgot your password?
            </p>
          </Link>
        </div>
      </div>
      {/* Disclaimer is now spaced above the bottom */}
      <div className="px-4 text-center">
        <div
          className="google-button flex items-center justify-around gap-10 m-2"
          onClick={async () => {
            // Clear cache before OAuth sign in
            const { cache } = await import('../../../utils/cache');
            cache.clear();

            // Safe callback URL construction
            const baseUrl =
              process.env.NEXT_PUBLIC_FRONTEND_URL ||
              process.env.NEXTAUTH_URL ||
              'http://localhost:8080';
            const callbackUrl = `${baseUrl}/dashboard`;

            signIn('google', {
              callbackUrl,
            });
          }}
        >
          {/* <FaGoogle size={24} /> */}
          <p className="p-3">Sign in with Google</p>
        </div>
        <p className="disclaimer pt-5">
          Your data isn't shared with any third parties. View our terms and
          privacy policy here.
        </p>
      </div>
    </div>
  );
}
