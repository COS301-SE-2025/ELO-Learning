'use client';
import { fetchAllUsers } from '@/services/api';
import { useEffect, useState } from 'react';
import LeaderboardTable from '../ui/leaderboard-table';

interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  currentLevel: number;
  joinDate: string;
  xp: number;
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const data: User[] = await fetchAllUsers();
      // Sort by xp descending, then username ascending
      data.sort((a: User, b: User) => {
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
