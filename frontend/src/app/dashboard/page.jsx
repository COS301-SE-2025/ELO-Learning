import LeaderboardTable from '../ui/leaderboard-table';
export default function Page() {
  return (
    <div>
      <h1 className="text-3xl text-center py-10 md:py-5 mt-10 md:mt-0">
        Leaderboard
      </h1>
      <LeaderboardTable />
    </div>
  );
}
