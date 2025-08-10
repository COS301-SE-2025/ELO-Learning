'use client';

import { AvatarBackground } from './background';
import { AvatarBodyShape } from './body-shape';
import { AvatarEyes } from './eyes';
import { AvatarMouth } from './mouth';

export function AvatarPreview({ avatar, className = '' }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Background */}
      <AvatarBackground
        backgroundType={avatar.background}
        className="absolute inset-0 rounded-2xl"
      />

      {/* Avatar Container */}
      <div className="relative flex items-center justify-center h-full p-8">
        <div className="relative">
          {/* Body Shape */}
          <AvatarBodyShape
            shape={avatar.bodyShape}
            color={avatar.color}
            className="w-32 h-32 relative"
          />

          {/* Eyes */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <AvatarEyes eyeType={avatar.eyes} className="w-24 h-12" />
          </div>

          {/* Mouth */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <AvatarMouth mouthType={avatar.mouth} className="w-12 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
