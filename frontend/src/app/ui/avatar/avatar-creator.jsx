'use client';

import { SafeButton } from '@/components/SafeButton';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAvatar } from '../../context/avatar-context';
import Back from '../back';
import {
  BackgroundIcon,
  BodyIcon,
  ColorIcon,
  EyesIcon,
  HatIcon,
  MouthIcon,
} from './avatar-icons';
import { AvatarPreview } from './avatar-preview';
import { BackgroundSelector } from './background';
import { BodyShapeSelector } from './body-shape';
import { ColorSelector } from './color';
import { EyeSelector } from './eyes';
import { HatSelector } from './hats';
import { MouthSelector } from './mouth';

const TABS = [
  { id: 'body', name: 'Body', IconComponent: BodyIcon },
  { id: 'color', name: 'Color', IconComponent: ColorIcon },
  { id: 'eyes', name: 'Eyes', IconComponent: EyesIcon },
  { id: 'mouth', name: 'Mouth', IconComponent: MouthIcon },
  { id: 'hats', name: 'Hats', IconComponent: HatIcon },
  { id: 'background', name: 'Background', IconComponent: BackgroundIcon },
];

export function AvatarCreator() {
  const { avatar: savedAvatar, updateAvatar } = useAvatar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('body');
  const [currentAvatar, setCurrentAvatar] = useState(savedAvatar);
  const { data: session, status, update } = useSession();

  // Update local state when saved avatar changes
  useEffect(() => {
    setCurrentAvatar(savedAvatar);
  }, [savedAvatar]);

  const handleAvatarUpdate = (updates) => {
    const newAvatar = { ...currentAvatar, ...updates };
    setCurrentAvatar(newAvatar);
  };

  const handleSave = async () => {
    // Keep the original simple logic, just make it async for SafeButton
    await updateAvatar(session.user.id, currentAvatar);

    // Navigate back to profile
    router.push('/profile');
  };

  const renderTabContent = () => {
    // Add safety check only if currentAvatar is null/undefined
    if (!currentAvatar) {
      return <div>Loading avatar options...</div>;
    }

    switch (activeTab) {
      case 'body':
        return (
          <BodyShapeSelector
            selectedShape={currentAvatar.bodyShape}
            onShapeChange={(bodyShape) => handleAvatarUpdate({ bodyShape })}
          />
        );
      case 'color':
        return (
          <ColorSelector
            selectedColor={currentAvatar.color}
            onColorChange={(color) => handleAvatarUpdate({ color })}
          />
        );
      case 'eyes':
        return (
          <EyeSelector
            selectedEyes={currentAvatar.eyes}
            onEyesChange={(eyes) => handleAvatarUpdate({ eyes })}
          />
        );
      case 'mouth':
        return (
          <MouthSelector
            selectedMouth={currentAvatar.mouth}
            onMouthChange={(mouth) => handleAvatarUpdate({ mouth })}
          />
        );
      case 'hats':
        return (
          <HatSelector
            selectedHat={currentAvatar.hat}
            onHatChange={(hat) => handleAvatarUpdate({ hat })}
          />
        );
      case 'background':
        return (
          <BackgroundSelector
            selectedBackground={currentAvatar.background}
            onBackgroundChange={(background) =>
              handleAvatarUpdate({ background })
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="pb-20">
      {' '}
      {/* Add bottom padding to prevent overlap with floating button */}
      {/* Header */}
      <div>
        <Back pagename="Create Avatar" />
      </div>
      <div className="md:h-[80vh] flex flex-col lg:flex-row mb-10 md:mb-10">
        {/* Avatar Preview - Left side on desktop, top on mobile */}
        <div className="lg:w-1/2 p-6 flex">
          <div className="w-full mx-auto rounded-2xl overflow-hidden flex items-center justify-center">
            <AvatarPreview avatar={currentAvatar} />
          </div>
        </div>

        {/* Customization Panel - removed save button from here */}
        <div className="lg:w-1/2 m-6 border rounded-lg border-[#696969]">
          {/* Tab Navigation */}
          <div className="p-6 border-b border-[#696969]">
            <div
              className="overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div
                className="flex min-w-max space-x-2 px-2"
                style={{ WebkitScrollbar: { display: 'none' } }}
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all min-w-[70px] flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-[#4d5ded] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-8 h-8 mb-1">
                      <tab.IconComponent className="w-full h-full object-contain" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-[420px] max-h-[420px] overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
      {/* Floating Save Button Footer */}
      <div className="flex fixed bottom-0 left-0 w-full z-10 px-4 py-4 bg-[var(--color-background)]">
        <div className="flex flex-col justify-center md:m-auto max-w-2xl mx-auto">
          <SafeButton
            onClick={handleSave}
            className="w-full md:m-auto main-button"
            loadingText="Saving Avatar..."
          >
            Save Avatar
          </SafeButton>
        </div>
      </div>
    </div>
  );
}
