'use client';
import { setCookie } from '@/app/lib/authCookie';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginUser } from '../../../services/api';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser(email, password);
      await setCookie(response);

      // Store the token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Username or password incorrect, please try again');
    } finally {
      setIsLoading(false);
    }
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
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center w-full">
            <input
              type="text"
              placeholder="Username or email"
              className="input-field md:w-1/2 top_form_input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="input-field md:w-1/2 bottom_form_input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="break_small"></div>
            {error && (
              <p className="text-[#FF6666] text-center mb-4">{error}</p>
            )}
            <button
              type="submit"
              className="main-button px-2 py-8"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </button>
          </div>
        </form>
        <div>
          <p className="text-center py-3">Forgot your password?</p>
        </div>
      </div>
      {/* Disclaimer is now spaced above the bottom */}
      <div className="px-4 text-center">
        <div className="google-button flex items-center justify-around gap-10 m-2">
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
