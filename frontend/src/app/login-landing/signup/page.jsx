'use client';
import ProgressBar from '@/app/ui/progress-bar';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getRegistration, setRegistration } from './registrationUtils';

const currentStep = 1;
const totalSteps = 6;

export default function Page() {
  const [name, setName] = useState(getRegistration().name || '');
  const [surname, setSurname] = useState(getRegistration().surname || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading) {
      return;
    }

    if (!name.trim() || !surname.trim()) {
      setError('Please enter both name and surname.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      setRegistration({
        name,
        surname,
        currentLevel: 5,
        joinDate: new Date().toISOString(),
        baseLineTest: false,
      });
      window.location.href = '/login-landing/signup/username';
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
          <p className="text-lg text-center font-bold">What is your name?</p>
          <form onSubmit={handleContinue}>
            <div className="flex flex-col items-center w-full">
              <input
                type="text"
                placeholder="Name"
                className="input-field md:w-1/2 top_form_input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Surname"
                className="input-field md:w-1/2 bottom_form_input"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <div className="break_small"></div>
              <button
                className="main-button px-2 py-8"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Continue'}
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
