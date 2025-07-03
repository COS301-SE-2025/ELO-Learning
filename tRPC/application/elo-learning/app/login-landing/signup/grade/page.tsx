'use client';
import { FormEvent, useState } from 'react';
import ProgressBar from '@/app/ui/progress-bar';
import Link from 'next/link';
import { X } from 'lucide-react';
import { setRegistration, getRegistration } from '../registrationUtils';

const currentStep: number = 4;
const totalSteps: number = 6;

export default function Page() {
  const [grade, setGrade] = useState<string>(getRegistration().grade || '');
  const [error, setError] = useState<string>('');

  const handleContinue = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!grade.trim()) {
      setError('Please enter your grade or year.');
      return;
    }
    setRegistration({ grade });
    window.location.href = '/login-landing/signup/email';
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
          <p className="text-lg text-center font-bold">
            What grade are you in? If you are a university student, indicate the
            year.
          </p>
          <form onSubmit={handleContinue}>
            <div className="flex flex-col items-center w-full">
              <input
                type="text"
                placeholder="Grade"
                className="input-field md:w-1/2 single_form_input"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
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
          Your data isn&apos;t shared with any third parties. View our terms and
          privacy policy here.
        </p>
      </div>
    </div>
  );
}
