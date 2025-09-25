'use client';
import ProgressBar from '@/app/ui/progress-bar';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { getRegistration, setRegistration } from '../registrationUtils';

const currentStep = 2;
const totalSteps = 6;
const MAX_USERNAME_LENGTH = 15; // Character limit for usernames

export default function Page() {
  const [username, setUsername] = useState(getRegistration().username || '');
  const [error, setError] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (username.length > MAX_USERNAME_LENGTH) {
      setError(`Username must be ${MAX_USERNAME_LENGTH} characters or less.`);
      return;
    }
    setRegistration({ username });
    window.location.href = '/login-landing/signup/age';
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_USERNAME_LENGTH) {
      setUsername(value);
      setError(''); // Clear error when user fixes it
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
          <p className="text-lg text-center font-bold">Choose a username</p>
          <form onSubmit={handleContinue}>
            <div className="flex flex-col items-center w-full md:px-20 px-3">
              <input
                type="text"
                placeholder="Username"
                className="input-field md:w-1/2 single_form_input"
                value={username}
                onChange={handleUsernameChange}
                maxLength={MAX_USERNAME_LENGTH}
                required
              />
              <div className="text-sm text-gray-500 mt-1">
                {username.length}/{MAX_USERNAME_LENGTH} characters
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="break_small"></div>
              <button className="signup-button  px-2 py-8" type="submit">
                Continue
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
