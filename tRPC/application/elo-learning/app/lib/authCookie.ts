'use server';
import { cookies } from 'next/headers';

interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  currentLevel: number;
  joinDate: string;
  xp: number;
  pfpURL?: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

interface CookieReturn {
  token: string | undefined;
  user: User | null;
}

export async function setCookie(response: AuthResponse): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set('token', response.token, { secure: true });
  cookieStore.set('user', JSON.stringify(response.user), { secure: true });
}

export async function deleteCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('user');
}

export async function getCookie(): Promise<CookieReturn> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  const user = cookieStore.get('user');
  return {
    token: token?.value,
    user: user?.value ? JSON.parse(user.value) : null,
  };
}
