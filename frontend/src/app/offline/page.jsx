'use client';
import Image from 'next/image';
import Link from 'next/link';

export default function Offline() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <Image
          src="/ELO-Learning-Mascot.png"
          width={200}
          height={200}
          alt="ELO Learning Mascot"
          className="mx-auto mb-8"
          priority
        />
        <h1 className="text-4xl font-bold text-[#BD86F8] mb-4">
          You're Offline
        </h1>
        <p className="text-xl mb-8 max-w-md mx-auto">
          It looks like you've lost your internet connection. Don't worry, some
          features might still work!
        </p>
        <div className="space-y-4">
          <Link href="/" className="block">
            <button className="bg-[#BD86F8] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#a674e6] transition-colors">
              Try Again
            </button>
          </Link>
          <p className="text-sm text-gray-600">
            Check your internet connection and try again
          </p>
        </div>
      </div>
    </main>
  );
}
