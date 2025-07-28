/**
 * Valid CSS media query types that can be used with matchMedia API
 * Based on MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries
 */

// Display size and viewport queries
export type ViewportQueries =
  | `(width${string})`
  | `(min-width${string})`
  | `(max-width${string})`
  | `(height${string})`
  | `(min-height${string})`
  | `(max-height${string})`
  | `(aspect-ratio${string})`
  | `(min-aspect-ratio${string})`
  | `(max-aspect-ratio${string})`
  | `(orientation: landscape)`
  | `(orientation: portrait)`;

// Display quality queries
export type DisplayQueries =
  | `(resolution${string})`
  | `(min-resolution${string})`
  | `(max-resolution${string})`
  | `(device-pixel-ratio${string})`
  | `(min-device-pixel-ratio${string})`
  | `(max-device-pixel-ratio${string})`
  | `(color${string})`
  | `(min-color${string})`
  | `(max-color${string})`
  | `(color-gamut${string})`
  | `(color-index${string})`
  | `(min-color-index${string})`
  | `(max-color-index${string})`
  | `(monochrome${string})`
  | `(min-monochrome${string})`
  | `(max-monochrome${string})`
  | `(scan: progressive)`
  | `(scan: interlace)`
  | `(grid: 0)`
  | `(grid: 1)`
  | `(update: fast)`
  | `(update: slow)`
  | `(update: none)`
  | `(overflow-block: none)`
  | `(overflow-block: scroll)`
  | `(overflow-block: paged)`
  | `(overflow-inline: none)`
  | `(overflow-inline: scroll)`
  | `(display-mode: fullscreen)`
  | `(display-mode: standalone)`
  | `(display-mode: minimal-ui)`
  | `(display-mode: browser)`;

// User preference queries
export type PreferenceQueries =
  | `(prefers-color-scheme: light)`
  | `(prefers-color-scheme: dark)`
  | `(prefers-color-scheme: no-preference)`
  | `(prefers-contrast: no-preference)`
  | `(prefers-contrast: high)`
  | `(prefers-contrast: low)`
  | `(prefers-reduced-motion: no-preference)`
  | `(prefers-reduced-motion: reduce)`
  | `(prefers-reduced-data: no-preference)`
  | `(prefers-reduced-data: reduce)`
  | `(prefers-reduced-transparency: no-preference)`
  | `(prefers-reduced-transparency: reduce)`
  | `(forced-colors: none)`
  | `(forced-colors: active)`
  | `(inverted-colors: none)`
  | `(inverted-colors: inverted)`;

// Interaction queries
export type InteractionQueries =
  | `(pointer: none)`
  | `(pointer: coarse)`
  | `(pointer: fine)`
  | `(hover: none)`
  | `(hover: hover)`
  | `(any-pointer: none)`
  | `(any-pointer: coarse)`
  | `(any-pointer: fine)`
  | `(any-hover: none)`
  | `(any-hover: hover)`;

// Device type queries
export type DeviceQueries =
  | `(display-mode: fullscreen)`
  | `(display-mode: standalone)`
  | `(display-mode: minimal-ui)`
  | `(display-mode: browser)`
  | `(scripting: none)`
  | `(scripting: initial-only)`
  | `(scripting: enabled)`;

// Common breakpoint queries (predefined for convenience)
export type BreakpointQueries =
  | `(max-width: ${number}px)`
  | `(min-width: ${number}px)`
  | `(max-height: ${number}px)`
  | `(min-height: ${number}px)`;

// Combined type for all valid media queries
export type ValidMediaQuery =
  | ViewportQueries
  | DisplayQueries
  | PreferenceQueries
  | InteractionQueries
  | DeviceQueries
  | BreakpointQueries
  | `(${string})`; // Allow any valid CSS media query string

// Type for complex media queries with logical operators
export type ComplexMediaQuery =
  | ValidMediaQuery
  | `${ValidMediaQuery} and ${ValidMediaQuery}`
  | `${ValidMediaQuery} or ${ValidMediaQuery}`
  | `not ${ValidMediaQuery}`;

// Final type that includes all possible media query combinations
export type MediaQueryString = ComplexMediaQuery;

// Common media query presets for convenience
export const MediaQueryPresets = {
  // Viewport breakpoints
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  largeDesktop: '(min-width: 1440px)',

  // Orientation
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',

  // User preferences
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  reducedData: '(prefers-reduced-data: reduce)',

  // Interaction
  touchDevice: '(pointer: coarse)',
  mouseDevice: '(pointer: fine)',
  hoverCapable: '(hover: hover)',

  // Display
  highDPI: '(min-resolution: 2dppx)',
  retina: '(min-device-pixel-ratio: 2)',
} as const;

export type MediaQueryPreset = keyof typeof MediaQueryPresets;
