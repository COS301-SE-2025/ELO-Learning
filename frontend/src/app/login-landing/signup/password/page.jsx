'use client';
import ProgressBar from '@/app/ui/progress-bar';
import { registerUser } from '@/services/api';
import { Eye, EyeOff, X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // ← ADD THIS
import { useState } from 'react';
import {
  clearRegistration,
  getRegistration,
  setRegistration,
} from '../registrationUtils';

const currentStep = 6;
const totalSteps = 6;

function validatePassword(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password,
  );
}

export default function Page() {
  const [password, setPasswordInput] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter(); // ← ADD THIS

  const handleContinue = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) {
      return;
    }

    if (!password || !confirm) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password !== confirm) {
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

    const reg = getRegistration();
    console.log('🚀 Starting registration...', reg);
    setRegistration({ password });

    try {
      // Step 1: Register user via your API
      const response = await registerUser(
        reg.name,
        reg.surname,
        reg.username,
        reg.email,
        password,
        reg.currentLevel,
        reg.joinDate,
        reg.baseLineTest,
      );

      console.log('✅ Registration API successful:', response);

      // Step 2: Immediately sign in with NextAuth to create proper session
      console.log('🔐 Creating NextAuth session...');

      const signInResult = await signIn('credentials', {
        email: reg.email,
        password: password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error('❌ NextAuth signin failed:', signInResult.error);
        setError(
          'Registration successful but login failed. Please try logging in.',
        );
        return;
      }

      console.log('🎉 NextAuth session created successfully!');

      // Step 3: Clean up and redirect

      // Automatically sign in the new user using NextAuth signIn
      // const signInResult = await signIn('credentials', {
      //   redirect: false,
      //   email: reg.email,
      //   password: password,
      // });

      if (signInResult?.error) {
        setError('Registration succeeded but automatic login failed.');
        setLoading(false);
        return;
      }

      clearRegistration();

      // Clear any old localStorage auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_provider');

      console.log('🔄 Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Registration failed:', err);
      setError(err?.response?.data?.error || 'Registration failed. Try again.');
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

  // Loading screen for registration
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-row items-center justify-center gap-5">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
              style={{ animationDelay: `${delay}ms` }}
            ></div>
          ))}
        </div>
        <div className="text-lg font-bold text-center">
          Registering your account, hang tight!
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-between p-3">
      <div>
        <div className="flex flex-row items-center justify-between w-full px-4 py-2">
          <Link href="/login-landing">
            <X size={24} />
          </Link>
          <div className="flex-1 ml-4">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>
        </div>
        <div>
          <p className="text-lg text-center font-bold">Choose a password</p>
          <form onSubmit={handleContinue}>
            <div className="flex flex-col items-center w-full px-4 md:px-12">
              <div className="relative w-[90vw] md:w-[500px]">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter a password"
                  className="input-field input-with-icon top_form_input w-full"
                  value={password}
                  onChange={(e) => setPasswordInput(e.target.value)}
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
                  placeholder="Confirm password"
                  className="input-field input-with-icon bottom_form_input w-full"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                className="signup-button  px-2 py-8"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="px-4 text-center">
        <p className="disclaimer pt-5">
          Your data isn't shared with any third parties.{' '}
          <Link
            href="/terms-of-service"
            className="text-[#BD86F8] hover:underline"
          >
            View our terms
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy-policy"
            className="text-[#BD86F8] hover:underline"
          >
            privacy policy
          </Link>{' '}
          here.
        </p>
      </div>
    </div>
  );
}
