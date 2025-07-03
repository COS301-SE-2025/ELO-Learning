'use client';
import { fetchAllUsers } from '@/services/api';
import { useEffect, useState } from 'react';
import LeaderboardTable from '../ui/leaderboard-table';

export default function Page() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      const data = await fetchAllUsers();
      // Sort by xp descending, then username ascending
      data.sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        return a.username.localeCompare(b.username);
      });
      setUsers(data);
    }
    loadUsers();
  }, []);

  return (
    <div>
      <h1 className="text-3xl text-center py-10 md:py-5 mt-10 md:mt-0">
        Leaderboard
      </h1>
      <LeaderboardTable users={users} />
    </div>
  );
}
