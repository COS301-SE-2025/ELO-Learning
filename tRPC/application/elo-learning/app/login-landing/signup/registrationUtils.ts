export const REG_KEY = 'registration';

interface RegistrationData {
  name?: string;
  surname?: string;
  username?: string;
  age?: number;
  grade?: string;
  email?: string;
  password?: string;
  currentLevel?: number;
  joinDate?: string;
}

export function getRegistration(): RegistrationData {
  if (typeof window === 'undefined') return {};
  return JSON.parse(localStorage.getItem(REG_KEY) || '{}');
}

export function setRegistration(data: Partial<RegistrationData>): void {
  if (typeof window === 'undefined') return;
  const current = getRegistration();
  localStorage.setItem(REG_KEY, JSON.stringify({ ...current, ...data }));
}

export function clearRegistration(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REG_KEY);
}
