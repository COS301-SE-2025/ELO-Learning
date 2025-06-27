import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-15">
      <div>
        <h2 className="text-2xl font-bold">Ready to challenge yourself?</h2>
      </div>
      <div className="flex flex-col items-center gap-10">
        <Link href="/single-player-game">
          <button className="main-button uppercase">Start playing</button>
        </Link>
        <Link href="/dashboard">
          <button className="secondary-button uppercase">Cancel</button>
        </Link>
      </div>
    </div>
  );
}
