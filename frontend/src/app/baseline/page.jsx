'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Page() {
  const { data: session } = useSession();

  const userName = session?.user?.name ?? 'Player';

  return (
    <div className="flex flex-col items-center gap-10 min-h-screen justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Ready to take your Baseline</h2>
        <h2 className="mt-2 text-2xl font-bold text-gray-700 dark:text-gray-300">
          {userName}?
        </h2>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Link href="/baseline-game">
          <button className="main-button-landing uppercase">
            Start Test
          </button>
        </Link>

        <Link href="/dashboard">
          <button className="secondary-button uppercase">
            Cancel
          </button>
        </Link>
      </div>
    </div>
  );
}
