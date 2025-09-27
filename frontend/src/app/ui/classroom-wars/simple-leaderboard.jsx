import { memo } from 'react';

const SimpleLeaderboardRow = memo(function SimpleLeaderboardRow({
  user,
  index,
}) {
  return (
    <tr key={user.id}>
      <td className="p-2 text-center">{index + 1}</td>
      <td className="p-2 text-left">
        <span
          className="truncate block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold"
          title={user.username}
        >
          {user.username}
        </span>
      </td>
      <td className="p-2 text-right font-bold">
        {typeof user.xp === 'number' ? user.xp.toFixed(0) : '-'} XP
      </td>
    </tr>
  );
});

const SimpleLeaderboard = memo(function SimpleLeaderboard({ users = [] }) {
  return (
    <div className="border rounded-lg p-4 mx-4 mb-15 md:mx-0 overflow-x-auto">
      <table className="table-auto w-full text-center min-w-0">
        <thead>
          <tr>
            <th className="w-1/5">#</th>
            <th className="text-left px-3 w-2/5">Username</th>
            <th className="text-right px-3 w-2/5">XP</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <SimpleLeaderboardRow key={user.id} user={user} index={idx} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default SimpleLeaderboard;
