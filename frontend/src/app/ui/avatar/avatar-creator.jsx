'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAvatar } from '../../context/avatar-context';
import Back from '../back';
import { AvatarPreview } from './avatar-preview';
import { BackgroundSelector } from './background';
import { BodyShapeSelector } from './body-shape';
import { ColorSelector } from './color';
import { EyeSelector } from './eyes';
import { MouthSelector } from './mouth';
import { useSession } from 'next-auth/react';

const TABS = [
  { id: 'body', name: 'Body', icon: '/avatar-icons/Body.svg' },
  { id: 'color', name: 'Color', icon: '/avatar-icons/Colour.svg' },
  { id: 'eyes', name: 'Eyes', icon: '/avatar-icons/Eyes.svg' },
  { id: 'mouth', name: 'Mouth', icon: '/avatar-icons/Mouth.svg' },
  {
    id: 'background',
    name: 'Background',
    icon: '/avatar-icons/Background.svg',
  },
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

  const handleSave = () => {
    updateAvatar(session.user.id, currentAvatar);

    // Navigate back to profile
    router.push('/profile');
  };

  const renderTabContent = () => {
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
    <div className="">
      {/* Header */}
      <div>
        <Back pagename="Create Avatar" />
      </div>

      <div className="h-[90vh] flex flex-col lg:flex-row">
        {/* Avatar Preview - Left side on desktop, top on mobile */}
        <div className="lg:w-1/2 p-6 flex">
          <div className="w-full mx-auto rounded-2xl overflow-hidden flex items-center justify-center">
            <AvatarPreview avatar={currentAvatar} />
          </div>
        </div>

        {/* Customization Panel + Save Button in one bordered container */}
        <div className="lg:w-1/2 m-6 border rounded-lg border-[#696969] flex flex-col justify-between">
          <div>
            {/* Tab Navigation */}
            <div className="flex justify-center p-6 border-b border-[#696969]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#4d5ded] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 mb-1">
                    <Image
                      src={tab.icon}
                      alt={tab.name}
                      width={45}
                      height={45}
                      className="w-full h-full object-contain filter brightness-0 invert opacity-50"
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 min-h-[420px] max-h-[420px] overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
          {/* Save Button at the bottom of the builder section */}
          <div className="w-full flex justify-center p-6">
            <button onClick={handleSave} className="main-button">
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
