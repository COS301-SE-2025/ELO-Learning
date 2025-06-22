'use client';
import { useState } from 'react';
import ProgressBar from '@/app/ui/progress-bar';
import Link from 'next/link';
import { X } from 'lucide-react';
import { setRegistration, getRegistration } from '../registrationUtils';

const currentStep = 3;
const totalSteps = 6;

export default function Page() {
  const [age, setAge] = useState(getRegistration().age || '');
  const [error, setError] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      setError('Please enter a valid age.');
      return;
    }
    setRegistration({ age: ageNum });
    window.location.href = '/login-landing/signup/grade';
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
          <p className="text-lg text-center font-bold">How old are you?</p>
          <form onSubmit={handleContinue}>
            <div className="flex flex-col items-center w-full">
              <input
                type="number"
                placeholder="Age"
                className="input-field md:w-1/2 single_form_input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={5}
                max={120}
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <div className="break_small"></div>
              <button className="main-button px-2 py-8" type="submit">
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
