import { Heart } from 'lucide-react';
export default function Lives({ numberOfLives }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <Heart size={24} fill="#FF6E99" stroke="#FF6E99" />
      <p>{numberOfLives}</p>
    </div>
  );
}
