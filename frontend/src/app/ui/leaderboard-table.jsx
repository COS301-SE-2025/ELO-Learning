import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

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

export default function LeaderboardTable({ users = [] }) {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState(null);
  const currentUserRowRef = useRef(null);

  useEffect(() => {
    if (session?.user) {
      setCurrentUser(session.user);
    }
  }, [session]);

  useEffect(() => {
    if (currentUserRowRef.current) {
      currentUserRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentUser, users]);

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
        <tbody>
          {users.map((user, idx) => {
            const isCurrent = currentUser && user.id === currentUser.id;
            return (
              <tr
                key={user.id}
                ref={isCurrent ? currentUserRowRef : null}
                className={isCurrent ? 'bg-[#343232] font-bold' : ''}
              >
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">
                  <span
                    className={`inline-flex items-center justify-center rounded-full w-8 h-8 font-bold text-lg ${getColor(
                      user.username
                    )}`}
                  >
                    {user.username.charAt(0)}
                  </span>
                </td>
                <td className="text-left p-2">{user.username}</td>
                <td className="text-right p-2">{user.xp.toFixed(0)} XP</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
