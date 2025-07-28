import { useEffect, useLayoutEffect, useState } from 'react';
import type { MediaQueryString, MediaQueryPreset } from './mediaQueryTypes';
import { MediaQueryPresets } from './mediaQueryTypes';

// Using the isomorphic layout effect to avoid SSR issues
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Server-side detection
const IS_SERVER = typeof window === 'undefined';

// Hook options type
type UseMediaQueryOptions = {
  /**
   * Default value when rendering on the server
   * @default false
   */
  defaultValue?: boolean;
  /**
   * Whether to read the media query state on initialization
   * Should be set to false in SSR, returning options.defaultValue or false
   * @default true
   */
  initializeWithValue?: boolean;
};

/**
 * Custom hook that wraps the matchMedia API to listen for media query changes
 *
 * @example
 * ```tsx
 * // Using presets (with type hints)
 * const isMobile = useMediaQuery('mobile');
 * const isDarkMode = useMediaQuery('darkMode');
 *
 * // Using custom queries
 * const isLargeScreen = useMediaQuery('(min-width: 1440px)');
 * const isTouchDevice = useMediaQuery('(pointer: coarse)');
 *
 * // Using options
 * const isMobile = useMediaQuery('mobile', {
 *   defaultValue: true,
 *   initializeWithValue: false
 * });
 * ```
 */

// Function overload - provide precise type hints for presets
export function useMediaQuery(
  query: MediaQueryPreset,
  options?: UseMediaQueryOptions
): boolean;
// Function overload - provide type checking for custom queries
export function useMediaQuery(
  query: MediaQueryString,
  options?: UseMediaQueryOptions
): boolean;
// Implementation signature
export function useMediaQuery(
  query: MediaQueryString | MediaQueryPreset,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  // Resolve preset to actual query string
  const actualQuery = MediaQueryPresets[query as MediaQueryPreset] || query;

  // Get matching state function
  const getMatches = (_query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue;
    }
    return window.matchMedia(_query).matches;
  };

  // Initialize state
  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(actualQuery);
    }
    return defaultValue;
  });

  // Handle media query changes
  const handleChange = () => {
    setMatches(getMatches(actualQuery));
  };

  // Using the isomorphic layout effect to avoid SSR issues
  useIsomorphicLayoutEffect(() => {
    if (IS_SERVER) {
      return;
    }

    const matchMedia = window.matchMedia(actualQuery);

    // Trigger on initial client load and query changes
    handleChange();

    // Use addListener and removeListener to support Safari < 14
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener('change', handleChange);
    }

    // Cleanup function
    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener('change', handleChange);
      }
    };
  }, [actualQuery]);

  return matches;
}
