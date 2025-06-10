import ProgressBar from '@/app/ui/progress-bar';
import Link from 'next/link';
// import { FaGoogle } from 'react-icons/fa';
import { X } from 'lucide-react';

const currentStep = 1;
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
          <p className="text-lg text-center font-bold">What is your name?</p>
          <form className="">
            <div className="flex flex-col items-center w-full">
              <input
                type="text"
                placeholder="Name"
                className="input-field md:w-1/2 top_form_input"
              />
              <input
                type="text"
                placeholder="Surname"
                className="input-field md:w-1/2 bottom_form_input"
              />
              <div className="break_small"></div>
              <Link href="/login-landing/signup/username">
                <button className="main-button px-2 py-8">Continue</button>
              </Link>
            </div>
          </form>
        </div>
      </div>
      {/* Disclaimer is now spaced above the bottom */}
      <div className="px-4 text-center">
        <div className="google-button flex items-center justify-around gap-10 m-2">
          {/* <FaGoogle size={24} /> */}
          <p className="p-3">Sign in with Google</p>
        </div>
        <p className="disclaimer pt-5">
          Your data isn't shared with any third parties. View our terms and
          privacy policy here.
        </p>
      </div>
    </div>
  );
}
