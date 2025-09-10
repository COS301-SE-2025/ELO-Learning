'use client';
import { useEffect, useState } from 'react';

export default function EndELOChange({ eloChange }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Whenever eloChange updates, switch off loading
    if (eloChange !== null && eloChange !== undefined) {
      setIsLoading(false);
    }
  }, [eloChange]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-5">
          <div
            className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    );
  }

  const delta =
    eloChange != null
      ? `${eloChange >= 0 ? '+' : ''}${eloChange.toFixed(0)}`
      : '—';

  const textColor =
    eloChange > 0
      ? 'text-green-500'
      : eloChange < 0
        ? 'text-red-500'
        : 'text-gray-500';

  return (
    <div className="border-1 border-[#FF6E99] rounded-[10px] w-[120px]">
      <div className="uppercase bg-[#FF6E99] p-2 rounded-t-[9px] text-[14px] font-bold text-center tracking-wide">
        Score
      </div>
      <div
        className={`text-center text-[18px] font-bold py-3 px-5 ${textColor}`}
      >
        {delta}
      </div>
    </div>
  );
}
