'use client';

import Link from 'next/link';

export default function MatchStats() {
  return (
    <div className="m-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl uppercase font-bold">Match Statistics</h3>
        <Link
          href="/analysis-feedback"
          className="text-sm font-bold uppercase"
          style={{ color: '#FF6E99' }}
          aria-label="View match stats"
        >
          VIEW STATS
        </Link>
      </div>
    </div>
  );
}
