export const REG_KEY = 'registration';

export function getRegistration() {
  if (typeof window === 'undefined') return {};
  return JSON.parse(localStorage.getItem(REG_KEY) || '{}');
}

export function setRegistration(data) {
  if (typeof window === 'undefined') return;
  const current = getRegistration();
  localStorage.setItem(REG_KEY, JSON.stringify({ ...current, ...data }));
}

export function clearRegistration() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REG_KEY);
}
