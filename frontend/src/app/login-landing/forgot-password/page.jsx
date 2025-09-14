'use client';
import { sendPasswordResetEmail } from '@/services/api';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function validateEmail(email) {
  // Simple email regex validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Page() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) {
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setSubmitted(true);
    } catch (err) {
      setError(
        err?.response?.data?.error || 'Failed to send reset email. Try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between p-3">
      <div>
        <div className="flex flex-row items-center justify-between w-full px-4 py-2">
          <Link href="/login-landing/login">
            <X size={24} />
          </Link>
        </div>
        <div>
          <p className="text-lg text-center font-bold">Forgot Password</p>
          {submitted ? (
            <div className="flex flex-col items-center w-full">
              <p className="text-center text-green-600 mt-4 w-[90vw] md:w-[500px]">
                If an account with that email exists, a password reset link has
                been sent.
              </p>
              <div className="break_small"></div>
              <Link
                href="/login-landing/login"
                className="signup-button px-2 py-8 text-center"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col items-center w-full px-4 md:px-0">
                <div className="relative w-[90vw] md:w-[500px]">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input-field w-full single_form_input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-500 mt-2 w-[90vw] md:w-[500px] text-center">
                    {error}
                  </p>
                )}
                <div className="break_small"></div>
                <button
                  className="signup-button px-2 py-8"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="px-4 text-center">
        <p className="disclaimer pt-5">
          Your data isn't shared with any third parties. View our terms and
          privacy policy here.
        </p>
      </div>
    </div>
  );
}
