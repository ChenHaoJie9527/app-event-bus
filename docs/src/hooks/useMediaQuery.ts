import { useEffect, useState } from 'react';
import type { MediaQueryString, MediaQueryPreset } from './mediaQueryTypes';
import { MediaQueryPresets } from './mediaQueryTypes';

/**
 * Custom hook that wraps the matchMedia API to listen for media query changes
 *
 * @example
 * ```tsx
 * // Using preset (with type hints)
 * const isMobile = useMediaQuery('mobile');
 * const isDarkMode = useMediaQuery('darkMode');
 *
 * // Using custom media query
 * const isLargeScreen = useMediaQuery('(min-width: 1440px)');
 * const isTouchDevice = useMediaQuery('(pointer: coarse)');
 * ```
 */

export function useMediaQuery(query: MediaQueryPreset): boolean;
export function useMediaQuery(query: MediaQueryString): boolean;
export function useMediaQuery(
  query: MediaQueryString | MediaQueryPreset
): boolean {
  // Resolve preset to actual query string
  const actualQuery = MediaQueryPresets[query as MediaQueryPreset] || query;

  const [matches, setMatches] = useState<boolean>(() => {
    // Initialize with the current match state
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia(actualQuery).matches;
    }
    return false;
  });

  useEffect(() => {
    // Early return if not in browser environment
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(actualQuery);

    // Set initial state
    setMatches(mediaQuery.matches);

    // Create event listener function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup function to remove event listener
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [actualQuery]);

  return matches;
}
