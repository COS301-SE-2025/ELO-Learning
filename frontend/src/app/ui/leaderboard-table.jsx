// Utility to pick a color based on the user's name
const colors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-gray-500',
];
function getColor(name) {
  // Simple hash to pick a color
  const code = name.charCodeAt(0) + name.length;
  return colors[code % colors.length];
}

const leaderboardData = [
  { pos: 1, user: 'Alice', streak: 12, xp: 11500 },
  { pos: 2, user: 'Bob', streak: 10, xp: 1400 },
  { pos: 3, user: 'Charlie', streak: 9, xp: 1350 },
  { pos: 4, user: 'Diana', streak: 8, xp: 1300 },
  { pos: 5, user: 'Eve', streak: 7, xp: 1250 },
  { pos: 6, user: 'Frank', streak: 6, xp: 1200 },
  { pos: 7, user: 'Grace', streak: 5, xp: 1150 },
  { pos: 8, user: 'Heidi', streak: 4, xp: 1100 },
  { pos: 9, user: 'Ivan', streak: 3, xp: 1050 },
  { pos: 10, user: 'Judy', streak: 2, xp: 10 },
];

export default function LeaderboardTable() {
  return (
    <div className="border rounded-lg p-4 mx-4 md:mx-0">
      <table className="table-auto w-full text-center">
        <thead>
          <tr>
            <th className=" w-0.5/5">#</th>
            <th className="w-1.5/5"></th>
            <th className="text-left px-3 w-1/5">Username</th>
            <th className="text-right px-3 w-2/5">Total XP</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((entry) => (
            <tr key={entry.pos}>
              <td className=" p-2">{entry.pos}</td>
              <td className="p-2">
                <span
                  className={`inline-flex items-center justify-center rounded-full w-8 h-8font-bold text-lg ${getColor(
                    entry.user,
                  )}`}
                >
                  {entry.user.charAt(0)}
                </span>
              </td>
              <td className="text-left p-2">{entry.user}</td>
              <td className="text-right p-2">{entry.xp} XP</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
