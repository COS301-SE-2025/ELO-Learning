'use client';

import { useRouter } from 'next/navigation';
import { AvatarPreview } from '../avatar/avatar-preview';

export default function ClickableAvatar({ avatar, className = '' }) {
  const router = useRouter();

  const handleAvatarClick = () => {
    router.push('/create-avatar');
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div
        onClick={handleAvatarClick}
        className={`cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
        title="Click to edit avatar"
      >
        <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white">
          <AvatarPreview avatar={avatar} />
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2 text-center">Tap to edit</p>
    </div>
  );
}
