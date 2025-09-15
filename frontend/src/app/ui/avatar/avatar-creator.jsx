'use client';

import { SafeButton } from '@/components/SafeButton';
import { Shuffle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAvatar } from '../../context/avatar-context';
import Back from '../back';
import { avatarColors } from './avatar-colors';
import {
  BackgroundIcon,
  BodyIcon,
  ColorIcon,
  EyesIcon,
  GlassesIcon,
  HatIcon,
  MoustacheIcon,
  MouthIcon,
} from './avatar-icons';
import { AvatarPreview } from './avatar-preview';
import { BackgroundSelector } from './background';
import { BodyShapeSelector, BodyShapes } from './body-shape';
import { ColorSelector } from './color';
import { EyeSelector, EyeTypes } from './eyes';
import { GlassesSelector, GlassesTypes } from './glasses';
import { HatSelector, HatTypes } from './hats';
import { MoustacheSelector, MoustacheTypes } from './moustache';
import { MouthSelector, MouthTypes } from './mouth';

const TABS = [
  { id: 'body', name: 'Body', IconComponent: BodyIcon },
  { id: 'color', name: 'Color', IconComponent: ColorIcon },
  { id: 'eyes', name: 'Eyes', IconComponent: EyesIcon },
  { id: 'mouth', name: 'Mouth', IconComponent: MouthIcon },
  { id: 'moustache', name: 'Moustache', IconComponent: MoustacheIcon },
  { id: 'glasses', name: 'Glasses', IconComponent: GlassesIcon },
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

  const handleRandomize = () => {
    // Get random selections from each category
    const bodyShapes = Object.values(BodyShapes);
    const eyeTypes = Object.values(EyeTypes);
    const mouthTypes = Object.values(MouthTypes);
    const moustacheTypes = Object.values(MoustacheTypes);
    const glassesTypes = Object.values(GlassesTypes);
    const hatTypes = Object.values(HatTypes);
    const colors = avatarColors; // Use the full avatarColors array instead of defaultColors

    // Background options (solid colors)
    const backgroundOptions = [];
    for (let i = 0; i < 8; i++) {
      backgroundOptions.push(`solid-${i}`);
    }
    for (let i = 0; i < 4; i++) {
      backgroundOptions.push(`gradient-${i}`);
    }

    const randomAvatar = {
      bodyShape: bodyShapes[Math.floor(Math.random() * bodyShapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      eyes: eyeTypes[Math.floor(Math.random() * eyeTypes.length)],
      mouth: mouthTypes[Math.floor(Math.random() * mouthTypes.length)],
      moustache:
        moustacheTypes[Math.floor(Math.random() * moustacheTypes.length)],
      glasses: glassesTypes[Math.floor(Math.random() * glassesTypes.length)],
      hat: hatTypes[Math.floor(Math.random() * hatTypes.length)],
      background:
        backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)],
    };

    setCurrentAvatar(randomAvatar);
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
      case 'moustache':
        return (
          <MoustacheSelector
            selectedMoustache={currentAvatar.moustache}
            onMoustacheChange={(moustache) => handleAvatarUpdate({ moustache })}
          />
        );
      case 'glasses':
        return (
          <GlassesSelector
            selectedGlasses={currentAvatar.glasses}
            onGlassesChange={(glasses) => handleAvatarUpdate({ glasses })}
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
          <div className="w-full mx-auto rounded-2xl overflow-hidden flex flex-col items-center justify-center relative">
            {/* Randomize Button - positioned at top */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleRandomize}
                className="px-4 py-2 mix-blend-color-dodge hover:mix-blend-normal transition-all"
              >
                <Shuffle
                  size={40}
                  className="text-white drop-shadow-lg hover:text-gray-200 transition-colors"
                />
              </button>
            </div>
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
      {/* Floating Save Button */}
      <div className="flex fixed bottom-0 left-0 w-full z-10 px-4 py-4 bg-[var(--color-background)]">
        <div className="flex justify-center items-center mx-auto">
          <SafeButton
            onClick={handleSave}
            className="main-button px-8"
            loadingText="Saving Avatar..."
          >
            Save Avatar
          </SafeButton>
        </div>
      </div>
    </div>
  );
}
