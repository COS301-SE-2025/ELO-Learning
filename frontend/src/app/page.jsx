'use client';
import LandingHeader from '@/app/ui/landing-header';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LandingFooter from './ui/landing-footer';
export default function Home() {
  const scrollToNextSection = () => {
    const nextSection = document.querySelector('[data-section="features"]');
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <main className="flex flex-col items-center">
      <LandingHeader />
      <div className="mt-25 flex items-center justify-center min-h-screen flex-col gap-4 md:px-10">
        <div className="flex items-center justify-center min-h-screen flex-col">
          <div className="flex items-center justify-center flex-col gap-0">
            <Image
              src="/ELO-Learning-Mascot.png"
              width={300}
              height={300}
              className="hidden md:block"
              alt="ELO Learning Mascot"
              priority
            />
            <Image
              src="/ELO-Learning-Mascot.png"
              width={200}
              height={200}
              className="block md:hidden"
              alt="ELO Learning Mascot"
              priority
            />
            <h1 className="logo-text text-[#BD86F8]">ELO Learning</h1>
          </div>
          <p className="text-center max-w-md p-5">
            Transform the way you engage with math practice through gamified,
            adaptive learning experiences.
          </p>
          <div className="break"></div>
          <Link className="btn-link" href="/login-landing/signup">
            <button className="main-button w-full">GET STARTED</button>
          </Link>
          <Link className="btn-link" href="/login-landing/login">
            <button className="secondary-button w-full">
              I ALREADY HAVE AN ACCOUNT
            </button>
          </Link>
          <div
            className="mt-20 animate-bounce cursor-pointer"
            onClick={scrollToNextSection}
          >
            <ChevronDown size={50} stroke="#FF6E99" />
          </div>
        </div>
        <div
          className="flex items-center justify-center min-h-screen flex-col mx-3"
          data-section="features"
        >
          <div>
            <h2 className="text-3xl font-bold text-center">
              Smarter. Sharper. Way More Fun.
            </h2>
            <div className="text-center my-5 md:w-150">
              <p>
                ELO Learning isn't your average math app. We use the same
                algorithm that ranks chess grandmasters to help you master math:
                at your level, in your style.
              </p>
              <p className="mt-5">
                Whether you’re brushing up, powering ahead, or just in it for
                the flex, we’ve got you.
              </p>
            </div>
          </div>
          <div className="my-10">
            <Image
              src="/chess-animation.gif"
              width={280}
              height={280}
              className="block"
              alt="Chess Animation"
              priority
            />
          </div>
        </div>
        <div className="flex items-center justify-center min-h-screen flex-col mx-3">
          <div>
            <h2 className="text-3xl font-bold text-center">Choose Your Mode</h2>
            <div className="md:flex md:flex-row md:justify-center md:gap-5 md:w-[70vw] md:my-10">
              <div className="bg-[#BD86F8] p-5 my-7 rounded-xl">
                <h3 className="text-xl text-center font-bold text-black mb-5">
                  Matches
                </h3>
                <p className=" text-black">
                  Go 1v1 with someone at your level. Win, rank up, repeat. Math
                  has never been so savage.
                </p>
              </div>
              <div className="bg-[#FF6E99] p-5 my-7 rounded-xl">
                <h3 className="text-xl text-center font-bold text-black mb-5">
                  Single Player
                </h3>
                <p className=" text-black">
                  Test yourself by answering as many questions as you can in a
                  round and improve your score!
                </p>
              </div>
              <div className="bg-[#309F04] p-5 my-7 rounded-xl">
                <h3 className="text-xl text-center font-bold text-black mb-5">
                  Practice Mode
                </h3>
                <p className=" text-black">
                  No timers. No pressure. Just you, your focus, and infinite
                  problem-solving goodness.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-screen flex-col mx-3">
          <div>
            <h2 className="text-3xl font-bold text-center">ELO Knows You</h2>
            <div className="text-center my-5 md:w-150">
              <p>
                Our adaptive ELO system learns how you learn. Win a match? You
                level up. Struggle a bit? We adjust.
              </p>
              <p className="mt-5">
                It’s not about being the best; it’s about getting better, every
                session.
              </p>
            </div>
          </div>
          <div className="my-10">
            <Image
              src="/elo-aninmation.gif"
              width={280}
              height={280}
              className="block"
              alt="ELO Rating Animation"
              priority
            />
          </div>
        </div>
        <div className="flex items-center justify-center min-h-screen flex-col mx-3">
          <div>
            <h2 className="text-3xl font-bold text-center">
              No Classrooms. No Labels. Just Progress.
            </h2>
            <div className="text-center my-5 md:w-150">
              <p>
                We don’t care what grade you’re in. We care about where you’re
                going — and helping you get there, one equation at a time.
              </p>
            </div>
          </div>
          <div className="my-10">
            <Image
              src="/progress.gif"
              width={280}
              height={280}
              className="block"
              alt="Growing with ELO Learning"
              priority
            />
          </div>
        </div>
        <div className="flex items-center justify-center min-h-screen flex-col mx-3">
          <div>
            <h2 className="text-3xl font-bold text-center">
              Made by real humans. Powered by real math.
            </h2>
            <div className="text-center my-5 md:w-150">
              <p>
                Because learning should feel like levelling up; not zoning out!
              </p>
            </div>
          </div>
          <div className="my-10">
            <Image
              src="/winner.gif"
              width={280}
              height={280}
              className="block"
              alt="Leveling Up Animation"
              priority
            />
          </div>
        </div>
        <div className="flex items-center justify-center min-h-screen flex-col mx-3">
          <div>
            <h2 className="text-3xl font-bold text-center">
              Start Solving Today
            </h2>
            <div className="text-center my-5 md:w-150">
              <p>
                No textbooks. No gatekeeping. Just brilliant, beautiful maths.
              </p>
              <div className="break"></div>
              <div className="flex flex-col gap-3">
                <Link className="btn-link" href="/login-landing/signup">
                  <button className="main-button w-full">GET STARTED</button>
                </Link>
                <Link className="btn-link" href="/login-landing/login">
                  <button className="secondary-button w-full">
                    I ALREADY HAVE AN ACCOUNT
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LandingFooter />
    </main>
  );
}
