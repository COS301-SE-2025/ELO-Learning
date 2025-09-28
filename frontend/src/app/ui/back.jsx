'use client';

import { MoveLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Back({ pagename }) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-row items-center justify-between m-5 bg-[var(--background)]">
      <button
        onClick={handleBack}
        className="cursor-pointer hover:opacity-70 transition-opacity"
        aria-label="Go back"
      >
        <MoveLeft size={24} />
      </button>
      <p className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
        {pagename}
      </p>
      <div className="w-6"></div>
    </div>
  );
}
