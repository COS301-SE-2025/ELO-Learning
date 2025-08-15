'use client';

import { AvatarBackground } from './background';
import { AvatarBodyShape } from './body-shape';
import { AvatarEyes } from './eyes';
import { AvatarMouth } from './mouth';

export function AvatarPreview({ avatar, className = '' }) {
  const showBackground = avatar.background !== 'transparent';
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Background */}
      {showBackground && (
        <AvatarBackground
          backgroundType={avatar.background}
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* Avatar Container */}
      <div className="relative flex items-center justify-center h-full p-8">
        <div className="relative w-64 h-64">
          {/* All elements are exactly the same size and perfectly layered */}

          {/* Body Shape - Bottom layer */}
          <div className="absolute inset-0">
            <AvatarBodyShape
              shape={avatar.bodyShape}
              color={avatar.color}
              className="w-full h-full"
            />
          </div>

          {/* Eyes - Middle layer */}
          <div className="absolute inset-0">
            <AvatarEyes eyeType={avatar.eyes} className="w-full h-full" />
          </div>

          {/* Mouth - Top layer */}
          <div className="absolute inset-0">
            <AvatarMouth mouthType={avatar.mouth} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
