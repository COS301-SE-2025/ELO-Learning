/**
 * Client-side hydration utility hook
 * Prevents hydration mismatches for platform-specific features
 */

import { useEffect, useState } from 'react';

/**
 * Hook to safely handle client-side only features
 * @returns {boolean} True when component is hydrated on client-side
 */
export const useClientSide = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Hook to safely get platform information after hydration
 * @returns {object} Platform detection results
 */
export const usePlatformDetection = () => {
  const [platform, setPlatform] = useState({
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    classes: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamic import to avoid SSR issues
      import('@/utils/platformDetection').then(
        ({ isMobile, isAndroid, isIOS, getPlatformClasses }) => {
          setPlatform({
            isMobile: isMobile(),
            isAndroid: isAndroid(),
            isIOS: isIOS(),
            classes: getPlatformClasses(),
          });
        },
      );
    }
  }, []);

  return platform;
};

/**
 * Component wrapper that ensures no hydration mismatch
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {React.ReactNode} props.fallback - Fallback to show during hydration
 * @returns {React.ReactNode} Safely hydrated component
 */
export const ClientOnly = ({ children, fallback = null }) => {
  const isClient = useClientSide();

  if (!isClient) {
    return fallback;
  }

  return children;
};

export default useClientSide;
