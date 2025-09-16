// Hook for managing avatar unlockables
'use client';

import {
  getUserLockedAvatarItems,
  getUserUnlockedAvatarItems,
} from '@/services/avatarUnlockablesService';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAvatarUnlockables() {
  const { data: session } = useSession();
  const [unlockedItems, setUnlockedItems] = useState([]);
  const [lockedItems, setLockedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUnlockables() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [unlocked, locked] = await Promise.all([
          getUserUnlockedAvatarItems(session.user.id),
          getUserLockedAvatarItems(session.user.id),
        ]);

        setUnlockedItems(unlocked);
        setLockedItems(locked);

        // Debug logging
        console.log('🔓 Unlocked items:', unlocked);
        console.log('🔒 Locked items:', locked);
      } catch (error) {
        console.error('Error loading avatar unlockables:', error);
        // Set basic defaults on error
        setUnlockedItems(['EYE_1', 'MOUTH_1', 'MOUSTACHE_1', 'GLASSES_1']);
        setLockedItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadUnlockables();
  }, [session?.user?.id]);

  const isItemUnlocked = (itemId) => {
    // Handle both formats: 'Eye 1' -> 'EYE_1', 'Mouth 1' -> 'MOUTH_1', etc.
    const normalizedItemId = normalizeItemId(itemId);
    const isUnlocked =
      unlockedItems.includes(normalizedItemId) ||
      unlockedItems.includes(itemId);

    return isUnlocked;
  };

  const getLockedItemInfo = (itemId) => {
    const normalizedItemId = normalizeItemId(itemId);
    return lockedItems.find(
      (item) =>
        item.unlockableId === normalizedItemId || item.unlockableId === itemId,
    );
  };

  // Helper function to convert frontend display names to backend IDs
  function normalizeItemId(itemId) {
    if (!itemId || typeof itemId !== 'string') return itemId;

    // Handle conversion from display format to backend format
    // 'Eye 1' -> 'EYE_1', 'Mouth 15' -> 'MOUTH_15', etc.
    const eyeMatch = itemId.match(/^Eye (\d+)$/);
    if (eyeMatch) return `EYE_${eyeMatch[1]}`;

    const mouthMatch = itemId.match(/^Mouth (\d+)$/);
    if (mouthMatch) return `MOUTH_${mouthMatch[1]}`;

    const moustacheMatch = itemId.match(/^Moustache (\d+)$/);
    if (moustacheMatch) return `MOUSTACHE_${moustacheMatch[1]}`;

    const glassesMatch = itemId.match(/^Glasses (\d+)$/);
    if (glassesMatch) return `GLASSES_${glassesMatch[1]}`;

    // For items that are already in the correct format or don't need conversion
    return itemId;
  }

  return {
    unlockedItems,
    lockedItems,
    loading,
    isItemUnlocked,
    getLockedItemInfo,
    refresh: () => {
      if (session?.user?.id) {
        loadUnlockables();
      }
    },
  };
}
