'use client';
import { resetPassword, verifyResetToken } from '@/services/api';
import { Eye, EyeOff, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function validatePassword(password) {
  // At least 1 uppercase, 1 number, 1 special char, min 8 chars
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password,
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token.');
        setTokenValid(false);
        return;
      }

      try {
        await verifyResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setError('Invalid or expired reset token.');
        setTokenValid(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'Password must be at least 8 characters, include an uppercase letter, a number, and a special character.',
      );
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.error || 'Failed to reset password. Try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Show loading while verifying token
  if (tokenValid === null) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center p-3">
        <p>Verifying reset token...</p>
      </div>
    );
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-between p-3">
        <div>
          <div className="flex flex-row items-center justify-between w-full px-4 py-2">
            <Link href="/login-landing/login">
              <X size={24} />
            </Link>
          </div>
          <div>
            <p className="text-lg text-center font-bold">Reset Password</p>
            <div className="flex flex-col items-center w-full">
              <p className="text-center text-red-500 mt-4">
                {error || 'Invalid or expired reset link.'}
              </p>
              <div className="break_small"></div>
              <Link
                href="/login-landing/forgot-password"
                className="main-button px-2 py-8 text-center"
              >
                Request New Reset Link
              </Link>
            </div>
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

  return (
    <div className="w-full min-h-screen flex flex-col justify-between p-3">
      <div>
        <div className="flex flex-row items-center justify-between w-full px-4 py-2">
          <Link href="/login-landing/login">
            <X size={24} />
          </Link>
        </div>
        <div>
          <p className="text-lg text-center font-bold">Reset Password</p>
          {success ? (
            <div className="flex flex-col items-center w-full">
              <p className="text-center text-green-600 mt-4 w-[90vw] md:w-[500px]">
                Your password has been successfully reset!
              </p>
              <div className="break_small"></div>
              <Link
                href="/login-landing/login"
                className="main-button px-2 py-8 text-center"
              >
                Login with New Password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col items-center w-full px-4 md:px-0">
                <div className="relative w-[90vw] md:w-[500px]">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="input-field w-full top_form_input pr-14"
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
                <div className="relative w-[90vw] md:w-[500px]">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className="input-field w-full bottom_form_input pr-14"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 mt-2 w-[90vw] md:w-[500px] text-center">
                    {error}
                  </p>
                )}
                <div className="break_small"></div>
                <button
                  className="main-button px-2 py-8"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
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

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
