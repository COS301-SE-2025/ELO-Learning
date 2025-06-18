import ProgressBar from '@/app/ui/progress-bar';
import { X } from 'lucide-react';
import Link from 'next/link';

const currentStep = 4;
const totalSteps = 6;

export default function Page() {
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
        {/* A form to input a name and email */}
        <div>
          <p className="text-lg text-center font-bold">
            What grade are you in? If you are a university student, indicate the
            year.
          </p>
          <form className="">
            <div className="flex flex-col items-center w-full">
              <input
                type="text"
                placeholder="Grade"
                className="input-field md:w-1/2 single_form_input"
              />
              <div className="break_small"></div>
              <Link href="/login-landing/signup/email">
                <button className="main-button px-2 py-8">Continue</button>
              </Link>
            </div>
          </form>
        </div>
      </div>
      {/* Disclaimer is now spaced above the bottom */}
      <div className="px-4 text-center">
        <p className="disclaimer pt-5">
          Your data isn't shared with any third parties. View our terms and
          privacy policy here.
        </p>
      </div>
    </div>
  );
}
