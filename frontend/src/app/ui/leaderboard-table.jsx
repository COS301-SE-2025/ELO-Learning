import { useSession } from 'next-auth/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

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

const getColor = (name) => {
  // Simple hash to pick a color
  const code = name.charCodeAt(0) + name.length;
  return colors[code % colors.length];
};

// Memoized row component to prevent unnecessary re-renders
const UserRow = memo(function UserRow({ user, index, isCurrent, userRowRef }) {
  const colorClass = useMemo(() => getColor(user.username), [user.username]);
  const initial = useMemo(() => user.username.charAt(0), [user.username]);
  const formattedXp = useMemo(() => user.xp.toFixed(0), [user.xp]);

  return (
    <tr
      key={user.id}
      ref={isCurrent ? userRowRef : null}
      className={isCurrent ? 'bg-[#343232] font-bold' : ''}
    >
      <td className="p-2">{index + 1}</td>
      <td className="p-2">
        <span
          className={`inline-flex items-center justify-center rounded-full w-8 h-8 font-bold text-lg ${colorClass}`}
        >
          {initial}
        </span>
      </td>
      <td className="text-left p-2">{user.username}</td>
      <td className="text-right p-2">{formattedXp} XP</td>
    </tr>
  );
});

const LeaderboardTable = memo(function LeaderboardTable({ users = [] }) {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState(null);
  const currentUserRowRef = useRef(null);

  // Memoize current user to avoid unnecessary updates
  const memoizedCurrentUser = useMemo(() => {
    return session?.user || null;
  }, [session?.user?.id]); // Only re-run if user ID changes

  useEffect(() => {
    setCurrentUser(memoizedCurrentUser);
  }, [memoizedCurrentUser]);

  // Scroll to current user with debouncing
  useEffect(() => {
    if (currentUserRowRef.current && currentUser && users.length > 0) {
      const timeoutId = setTimeout(() => {
        currentUserRowRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, users.length]);

  // Memoize rendered rows to prevent unnecessary re-renders
  const renderedRows = useMemo(() => {
    return users.map((user, idx) => {
      const isCurrent = currentUser && user.id === currentUser.id;
      return (
        <UserRow
          key={user.id}
          user={user}
          index={idx}
          isCurrent={isCurrent}
          userRowRef={isCurrent ? currentUserRowRef : null}
        />
      );
    });
  }, [users, currentUser]);

  return (
    <div
      className="border rounded-lg p-4 mx-4 md:mx-0"
      style={{ maxHeight: '100%', overflowY: 'auto' }}
    >
      <table className="table-auto w-full text-center">
        <thead>
          <tr>
            <th className=" w-0.5/5">#</th>
            <th className="w-1.5/5"></th>
            <th className="text-left px-3 w-1/5">Username</th>
            <th className="text-right px-3 w-2/5">Total XP</th>
          </tr>
        </thead>
        <tbody>{renderedRows}</tbody>
      </table>
    </div>
  );
});

export default LeaderboardTable;
