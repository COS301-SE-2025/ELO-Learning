import ProgressBar from '@/app/ui/progress-bar';
import Link from 'next/link';
import { LuX } from 'react-icons/lu';

const currentStep = 4;
const totalSteps = 6;

export default function Page() {
  return (
    <div className="full-screen w-full min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex flex-row items-center justify-between w-full px-4 py-2">
          <Link href="/login-landing">
            <LuX size={24} />
          </Link>
          <div className="flex-1 ml-4">
            <ProgressBar progress={currentStep / totalSteps} />
          </div>
        </div>
        {/* A form to input a name and email */}
        <div>
          <p>
            What grade are you in? If you are a university student, indicate the
            year.
          </p>
          <form className="m-10 mb-0">
            <div className="flex flex-col items-center w-full gap-4">
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
      <div className="mb-8 px-4 text-center">
        <p className="disclaimer">
          Your data isn't shared with any third parties. View our terms and
          privacy policy here.
        </p>
      </div>
    </div>
  );
}
