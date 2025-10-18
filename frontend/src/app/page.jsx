'use client';
import LandingHeader from '@/app/ui/landing-header';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LandingFooter from './ui/landing-footer';

export default function Home() {
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('Home page useEffect running');

    const checkIfRunningAsPWA = () => {
      console.log('Checking if running as PWA from home page...');

      if (
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches
      ) {
        console.log(
          'Detected standalone mode - should redirect to login-landing',
        );
        return true;
      }

      if (navigator.standalone === true) {
        console.log(
          'Detected iOS standalone mode - should redirect to login-landing',
        );
        return true;
      }

      console.log('Not running as PWA - staying on landing page');
      return false;
    };

    const runningAsPWA = checkIfRunningAsPWA();
    console.log('PWA detection result:', runningAsPWA);
    setIsAppInstalled(runningAsPWA);

    if (runningAsPWA) {
      console.log('Redirecting to /login-landing...');
      window.location.replace('/login-landing');
      return;
    }

    console.log('Not redirecting, setting isChecking to false');
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <Image
            src="/ELO-Learning-Mascot.png"
            width={100}
            height={100}
            alt="ELO Learning Mascot"
            priority
            className="mx-auto mb-4"
          />
          <div className="animate-pulse text-[#BD86F8]">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAppInstalled) {
    return null;
  }

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
    <div className="h-screen flex flex-col">
      <LandingHeader className="sticky top-0 z-50" />
      <main className="flex-1 overflow-hidden">
        <div className="h-full snap-container">
          {/* Hero Section */}
          <section className="snap-section">
            <div className="section-fade-in flex flex-col items-center justify-center gap-8 max-w-7xl mx-auto px-4">
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
              <p className="text-center max-w-md">
                Transform the way you engage with math practice through
                gamified, adaptive learning experiences.
              </p>
              <div className="flex flex-col gap-4 w-full max-w-md">
                <Link href="/login-landing/signup">
                  <button className="main-button-landing w-full">
                    GET STARTED
                  </button>
                </Link>
                <Link href="/login-landing/login">
                  <button className="secondary-button w-full">
                    I ALREADY HAVE AN ACCOUNT
                  </button>
                </Link>
              </div>
              <div
                className="mt-8 animate-bounce cursor-pointer"
                onClick={scrollToNextSection}
              >
                <ChevronDown size={50} stroke="#FF6E99" />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="snap-section" data-section="features">
            <div className="flex flex-col items-center justify-center gap-8 max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center">
                Smarter. Sharper. Way More Fun.
              </h2>
              <div className="text-center max-w-2xl">
                <p>
                  ELO Learning isn't your average math app. We use the same
                  algorithm that ranks chess grandmasters to help you master
                  math: at your level, in your style.
                </p>
                <p className="mt-4">
                  Whether you're brushing up, powering ahead, or just in it for
                  the flex, we've got you.
                </p>
              </div>
              <div className="mt-8">
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
          </section>

          {/* Game Modes Section */}
          <section className="snap-section">
            <div className="flex flex-col items-center justify-center gap-8 max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center">
                Choose Your Mode
              </h2>
              <div className="grid md:grid-cols-3 gap-6 w-full">
                <div className="feature-card backdrop-blur-md bg-[var(--vector-violet-light)] bg-opacity-90">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--vector-violet)] flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl text-center font-bold mb-4">
                    Matches
                  </h3>
                  <p className="text-center">
                    Go 1v1 with someone at your level. Win, rank up, repeat.
                    Math has never been so savage.
                  </p>
                </div>
                <div className="feature-card backdrop-blur-md bg-[var(--radical-rose)] bg-opacity-90">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--blueprint-blue)] flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 8v8m-4-5v5M8 8v8m8-16l-8 4m8 0l-8 4m8-4v12"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl text-center font-bold mb-4">
                    Single Player
                  </h3>
                  <p className="text-center">
                    Test yourself by answering as many questions as you can in a
                    round and improve your score!
                  </p>
                </div>
                <div className="feature-card backdrop-blur-md bg-[var(--practice-green)] bg-opacity-90">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--success-green)] flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl text-center font-bold mb-4">
                    Practice Mode
                  </h3>
                  <p className="text-center">
                    No timers. No pressure. Just you, your focus, and infinite
                    problem-solving goodness.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ELO Section */}
          <section className="snap-section">
            <div className="flex flex-col items-center justify-center gap-8 max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center">ELO Knows You</h2>
              <div className="text-center max-w-2xl">
                <p>
                  Our adaptive ELO system learns how you learn. Win a match? You
                  level up. Struggle a bit? We adjust.
                </p>
                <p className="mt-4">
                  It's not about being the best; it's about getting better,
                  every session.
                </p>
              </div>
              <div className="mt-8">
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
          </section>

          {/* Progress Section */}
          <section className="snap-section">
            <div className="flex flex-col items-center justify-center gap-8 max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center">
                No Classrooms. No Labels. Just Progress.
              </h2>
              <div className="text-center max-w-2xl">
                <p>
                  We don't care what grade you're in. We care about where you're
                  going — and helping you get there, one equation at a time.
                </p>
              </div>
              <div className="mt-8">
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
          </section>

          {/* Human Touch Section */}
          <section className="snap-section">
            <div className="flex flex-col items-center justify-center gap-8 max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center">
                Made by real humans. Powered by real math.
              </h2>
              <div className="text-center max-w-2xl">
                <p>
                  Because learning should feel like levelling up; not zoning
                  out!
                </p>
              </div>
              <div className="mt-8">
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
          </section>

          {/* Call to Action Section */}
          <section className="snap-section">
            <div className="flex flex-col items-center justify-center gap-8 max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center">
                Start Solving Today
              </h2>
              <div className="text-center max-w-2xl">
                <p>
                  No textbooks. No gatekeeping. Just brilliant, beautiful maths.
                </p>
              </div>
              <div className="flex flex-col gap-4 w-full max-w-md">
                <Link href="/login-landing/signup">
                  <button className="main-button-landing w-full">
                    GET STARTED
                  </button>
                </Link>
                <Link href="/login-landing/login">
                  <button className="secondary-button w-full">
                    I ALREADY HAVE AN ACCOUNT
                  </button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer>
        <LandingFooter />
      </footer>
    </div>
  );
}
