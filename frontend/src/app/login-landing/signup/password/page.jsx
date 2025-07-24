'use client';
import { setCookie } from '@/app/lib/authCookie';
import ProgressBar from '@/app/ui/progress-bar';
import { registerUser } from '@/services/api';
import { Eye, EyeOff, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  clearRegistration,
  getRegistration,
  setRegistration,
} from '../registrationUtils';

const currentStep = 6;
const totalSteps = 6;

function validatePassword(password) {
  // At least 1 uppercase, 1 number, 1 special char, min 8 chars
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

  const handleContinue = async (e) => {
    e.preventDefault();
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

    // Get registration data
    const reg = getRegistration();
    console.log('Registration object:', reg);
    setRegistration({ password });

    try {
      const response = await registerUser(
        reg.name,
        reg.surname,
        reg.username,
        reg.email,
        password,
        reg.currentLevel,
        reg.joinDate,
      );
      // Save token and user to localStorage
      if (response.token && response.user) {
        await setCookie(response);
      }
      clearRegistration();
      window.location.href = '/dashboard';
    } catch (err) {
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
            <div className="flex flex-col items-center w-full px-4 md:px-0">
              {' '}
              {/* Added px-4 for mobile padding */}
              <div className="relative w-[90vw] md:w-[500px]">
                {' '}
                {/* Changed to match button width */}
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
                {' '}
                {/* Changed to match button width */}
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
                className="main-button px-2 py-8"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Continue'}
              </button>
            </div>
          </form>
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
