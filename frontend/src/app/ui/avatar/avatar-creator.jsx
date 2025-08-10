'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAvatar } from '../../context/avatar-context';
import { AvatarPreview } from './avatar-preview';
import { BackgroundSelector } from './background';
import { BodyShapeSelector } from './body-shape';
import { ColorSelector } from './color';
import { EyeSelector } from './eyes';
import { MouthSelector } from './mouth';

const TABS = [
  { id: 'body', name: 'Body', icon: '👤' },
  { id: 'color', name: 'Color', icon: '🎨' },
  { id: 'eyes', name: 'Eyes', icon: '👀' },
  { id: 'mouth', name: 'Mouth', icon: '😊' },
  { id: 'background', name: 'Background', icon: '🖼️' },
];

export function AvatarCreator() {
  const { avatar: savedAvatar, updateAvatar } = useAvatar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('body');
  const [currentAvatar, setCurrentAvatar] = useState(savedAvatar);

  // Update local state when saved avatar changes
  useEffect(() => {
    setCurrentAvatar(savedAvatar);
  }, [savedAvatar]);

  const handleAvatarUpdate = (updates) => {
    const newAvatar = { ...currentAvatar, ...updates };
    setCurrentAvatar(newAvatar);
  };

  const handleSave = () => {
    updateAvatar(currentAvatar);
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 p-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Edit Avatar</h1>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Avatar Preview - Left side on desktop, top on mobile */}
        <div className="lg:w-1/2 p-6">
          <div className="aspect-square max-w-md mx-auto bg-gray-800 rounded-2xl overflow-hidden">
            <AvatarPreview avatar={currentAvatar} />
          </div>
        </div>

        {/* Customization Panel - Right side on desktop, bottom on mobile */}
        <div className="lg:w-1/2 p-6">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-6 bg-gray-800 rounded-xl p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="text-xl mb-1">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800 rounded-xl p-6 min-h-[400px]">
            {renderTabContent()}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
}
