'use client';

import { SafeButton } from '@/components/SafeButton';
import { Toast, useToast } from '@/components/ui/toast';
import { useAvatarUnlockables } from '@/hooks/useAvatarUnlockables';
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
  { id: 'body', name: 'Body', IconComponent: BodyIcon, items: BodyShapes },
  { id: 'color', name: 'Color', IconComponent: ColorIcon, items: null }, // Colors are always unlocked
  { id: 'eyes', name: 'Eyes', IconComponent: EyesIcon, items: EyeTypes },
  { id: 'mouth', name: 'Mouth', IconComponent: MouthIcon, items: MouthTypes },
  {
    id: 'moustache',
    name: 'Moustache',
    IconComponent: MoustacheIcon,
    items: MoustacheTypes,
  },
  {
    id: 'glasses',
    name: 'Glasses',
    IconComponent: GlassesIcon,
    items: GlassesTypes,
  },
  { id: 'hats', name: 'Hats', IconComponent: HatIcon, items: HatTypes },
  {
    id: 'background',
    name: 'Background',
    IconComponent: BackgroundIcon,
    items: null,
  }, // Backgrounds are always unlocked
];

export function AvatarCreator() {
  const { avatar: savedAvatar, updateAvatar } = useAvatar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('body');
  const [currentAvatar, setCurrentAvatar] = useState(savedAvatar);
  const { data: session, status, update } = useSession();
  const {
    unlockables,
    isLoading: unlockablesLoading,
    isItemUnlocked,
  } = useAvatarUnlockables();
  const { toast, showToast, hideToast } = useToast();

  // Update local state when saved avatar changes
  useEffect(() => {
    setCurrentAvatar(savedAvatar);
  }, [savedAvatar]);

  const handleAvatarUpdate = (updates) => {
    // Define which categories have unlockable items
    const unlockableCategories = [
      'eyes',
      'mouth',
      'moustache',
      'glasses',
      'hat',
    ];

    // Check if any locked items are being selected
    for (const [key, value] of Object.entries(updates)) {
      // Only check unlock status for categories that have unlockable items
      if (
        unlockableCategories.includes(key) &&
        value &&
        value !== 'none' &&
        !isItemUnlocked(value)
      ) {
        showToast(
          `This ${key} is locked! Complete more achievements to unlock it.`,
          'error',
          4000,
        );
        return; // Don't update avatar if locked item is selected
      }
    }

    const newAvatar = { ...currentAvatar, ...updates };
    setCurrentAvatar(newAvatar);
  };

  const handleSave = async () => {
    // Define which categories have unlockable items
    const unlockableCategories = [
      'eyes',
      'mouth',
      'moustache',
      'glasses',
      'hat',
    ];

    // Check if current avatar contains any locked items before saving
    const lockedItems = [];

    for (const [key, value] of Object.entries(currentAvatar)) {
      // Only check unlock status for categories that have unlockable items
      if (
        unlockableCategories.includes(key) &&
        value &&
        value !== 'none' &&
        !isItemUnlocked(value)
      ) {
        lockedItems.push(`${key}: ${value}`);
      }
    }

    if (lockedItems.length > 0) {
      showToast(
        `Cannot save avatar with locked items: ${lockedItems.join(', ')}`,
        'error',
        5000,
      );
      return;
    }

    // Keep the original simple logic, just make it async for SafeButton
    await updateAvatar(session.user.id, currentAvatar);

    // Navigate back to profile after a short delay
    setTimeout(() => {
      router.push('/profile');
    }, 1000);
  };

  const handleRandomize = () => {
    // Define which categories have unlockable items
    const unlockableCategories = [
      'eyes',
      'mouth',
      'moustache',
      'glasses',
      'hat',
    ];

    // Get all available (unlocked) options from each category
    const getUnlockedOptions = (category, allOptions) => {
      // If category doesn't have unlockable items, return all options
      if (!unlockableCategories.includes(category)) {
        return allOptions;
      }
      // For unlockable categories, filter by unlock status
      return allOptions.filter(
        (option) => option === 'none' || isItemUnlocked(option),
      );
    };

    // Get random selections from each category
    const bodyShapes = getUnlockedOptions(
      'bodyShape',
      Object.values(BodyShapes),
    );
    const eyeTypes = getUnlockedOptions('eyes', Object.values(EyeTypes));
    const mouthTypes = getUnlockedOptions('mouth', Object.values(MouthTypes));
    const moustacheTypes = getUnlockedOptions(
      'moustache',
      Object.values(MoustacheTypes),
    );
    const glassesTypes = getUnlockedOptions(
      'glasses',
      Object.values(GlassesTypes),
    );
    const hatTypes = getUnlockedOptions('hat', Object.values(HatTypes));
    const colors = avatarColors; // Colors are always unlocked

    // Background options (solid colors) - always unlocked
    const backgroundOptions = [];
    for (let i = 0; i < 8; i++) {
      backgroundOptions.push(`solid-${i}`);
    }
    for (let i = 0; i < 4; i++) {
      backgroundOptions.push(`gradient-${i}`);
    }

    // Only randomize if there are unlocked options available
    const randomAvatar = {
      bodyShape:
        bodyShapes.length > 0
          ? bodyShapes[Math.floor(Math.random() * bodyShapes.length)]
          : currentAvatar.bodyShape,
      color: colors[Math.floor(Math.random() * colors.length)],
      eyes:
        eyeTypes.length > 0
          ? eyeTypes[Math.floor(Math.random() * eyeTypes.length)]
          : currentAvatar.eyes,
      mouth:
        mouthTypes.length > 0
          ? mouthTypes[Math.floor(Math.random() * mouthTypes.length)]
          : currentAvatar.mouth,
      moustache:
        moustacheTypes.length > 0
          ? moustacheTypes[Math.floor(Math.random() * moustacheTypes.length)]
          : currentAvatar.moustache,
      glasses:
        glassesTypes.length > 0
          ? glassesTypes[Math.floor(Math.random() * glassesTypes.length)]
          : currentAvatar.glasses,
      hat:
        hatTypes.length > 0
          ? hatTypes[Math.floor(Math.random() * hatTypes.length)]
          : currentAvatar.hat,
      background:
        backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)],
    };

    setCurrentAvatar(randomAvatar);
  };

  // Helper function to get unlock stats for a category
  const getUnlockStats = (tab) => {
    // Define which categories have unlockable items and should show counts
    const unlockableCategories = [
      'eyes',
      'mouth',
      'moustache',
      'glasses',
      'hats',
    ];

    // Don't show counts for categories that don't have unlockable items
    if (!tab.items || !unlockableCategories.includes(tab.id)) return null;

    // Filter out "remove" options like 'none' and 'Nothing' from counts
    const allItems = Object.values(tab.items).filter(
      (item) => item !== 'none' && item !== 'Nothing',
    );
    const unlockedItems = allItems.filter((item) => isItemUnlocked(item));

    return {
      unlocked: unlockedItems.length,
      total: allItems.length,
      percentage: Math.round((unlockedItems.length / allItems.length) * 100),
    };
  };

  const renderTabContent = () => {
    // Add safety check only if currentAvatar is null/undefined
    if (!currentAvatar) {
      return <div>Loading avatar options...</div>;
    }

    // Show loading state while unlockables are being fetched
    if (unlockablesLoading) {
      return <div>Loading unlockables...</div>;
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
                {TABS.map((tab) => {
                  const stats = getUnlockStats(tab);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all min-w-[70px] flex-shrink-0 relative ${
                        activeTab === tab.id
                          ? 'bg-[#4d5ded] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-8 h-8 mb-1">
                        <tab.IconComponent className="w-full h-full object-contain" />
                      </div>
                      {stats && (
                        <div className="text-xs mt-1 opacity-75">
                          {stats.unlocked}/{stats.total}
                        </div>
                      )}
                    </button>
                  );
                })}
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
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
        duration={toast.duration}
        position="top-center"
      />
    </div>
  );
}
