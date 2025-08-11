'use client';

import { useRouter } from 'next/navigation';
import { AvatarPreview } from '../avatar/avatar-preview';

export default function ClickableAvatar({ avatar, className = '' }) {
  const router = useRouter();

  const handleAvatarClick = () => {
    router.push('/create-avatar');
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        onClick={handleAvatarClick}
        className={`cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
        title="Click to edit avatar"
      >
        <div className="w-70 h-70">
          <AvatarPreview avatar={avatar} />
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2 text-center">Tap to edit</p>
    </div>
  );
}
