'use client';
import ProgressBar from '@/app/ui/progress-bar';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getRegistration, setRegistration } from '../registrationUtils';

const currentStep = 5;
const totalSteps = 6;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Page() {
  const [email, setEmail] = useState(getRegistration().email || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading) {
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      setRegistration({ email });
      window.location.href = '/login-landing/signup/password';
    } catch (error) {
      setError('An error occurred. Please try again.');
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
          <div className="flex-1 ml-4">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>
        </div>
        <div>
          <p className="text-lg text-center font-bold">What is your email?</p>
          <form onSubmit={handleContinue}>
            <div className="flex flex-col items-center w-full">
              <input
                type="email"
                placeholder="Email"
                className="input-field md:w-1/2 single_form_input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <div className="break_small"></div>
              <button
                className="main-button px-2 py-8"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Validating Email...' : 'Continue'}
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
