import { useMediaQuery } from '../hooks';

export function MediaQueryExample() {
  // Using presets (type-safe)
  const isMobile = useMediaQuery('mobile');
  const isTablet = useMediaQuery('tablet');
  const isDesktop = useMediaQuery('desktop');
  const isDarkMode = useMediaQuery('darkMode');
  const isLandscape = useMediaQuery('landscape');

  // Using custom queries (also type-safe)
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)');
  const isTouchDevice = useMediaQuery('(pointer: coarse)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)'
  );

  return (
    <div className="space-y-4 p-6">
      <h2 className="font-bold text-2xl">Media Query Hook Example</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          className={`rounded-lg border p-4 ${
            isMobile
              ? 'border-blue-300 bg-blue-100'
              : 'border-gray-300 bg-gray-100'
          }`}
        >
          <h3 className="font-semibold">Mobile (Preset)</h3>
          <p className="text-sm">useMediaQuery('mobile')</p>
          <p
            className={`font-bold ${isMobile ? 'text-green-600' : 'text-red-600'}`}
          >
            {isMobile ? '✓ Matches' : '✗ No match'}
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            isTablet
              ? 'border-green-300 bg-green-100'
              : 'border-gray-300 bg-gray-100'
          }`}
        >
          <h3 className="font-semibold">Tablet (Preset)</h3>
          <p className="text-sm">useMediaQuery('tablet')</p>
          <p
            className={`font-bold ${isTablet ? 'text-green-600' : 'text-red-600'}`}
          >
            {isTablet ? '✓ Matches' : '✗ No match'}
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            isDesktop
              ? 'border-purple-300 bg-purple-100'
              : 'border-gray-300 bg-gray-100'
          }`}
        >
          <h3 className="font-semibold">Desktop (Preset)</h3>
          <p className="text-sm">useMediaQuery('desktop')</p>
          <p
            className={`font-bold ${isDesktop ? 'text-green-600' : 'text-red-600'}`}
          >
            {isDesktop ? '✓ Matches' : '✗ No match'}
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            isDarkMode
              ? 'border-gray-600 bg-gray-800 text-white'
              : 'border-gray-300 bg-gray-100'
          }`}
        >
          <h3 className="font-semibold">Dark Mode (Preset)</h3>
          <p className="text-sm">useMediaQuery('darkMode')</p>
          <p
            className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-red-600'}`}
          >
            {isDarkMode ? '✓ Matches' : '✗ No match'}
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            isLandscape
              ? 'border-orange-300 bg-orange-100'
              : 'border-gray-300 bg-gray-100'
          }`}
        >
          <h3 className="font-semibold">Landscape (Preset)</h3>
          <p className="text-sm">useMediaQuery('landscape')</p>
          <p
            className={`font-bold ${isLandscape ? 'text-green-600' : 'text-red-600'}`}
          >
            {isLandscape ? '✓ Matches' : '✗ No match'}
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            isLargeDesktop
              ? 'border-indigo-300 bg-indigo-100'
              : 'border-gray-300 bg-gray-100'
          }`}
        >
          <h3 className="font-semibold">Large Desktop (Custom)</h3>
          <p className="text-sm">useMediaQuery('(min-width: 1440px)')</p>
          <p
            className={`font-bold ${isLargeDesktop ? 'text-green-600' : 'text-red-600'}`}
          >
            {isLargeDesktop ? '✓ Matches' : '✗ No match'}
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            isTouchDevice
              ? 'border-pink-300 bg-pink-100'
              : 'border-gray-300 bg-gray-100'
          }`}
        >
          <h3 className="font-semibold">Touch Device (Custom)</h3>
          <p className="text-sm">useMediaQuery('(pointer: coarse)')</p>
          <p
            className={`font-bold ${isTouchDevice ? 'text-green-600' : 'text-red-600'}`}
          >
            {isTouchDevice ? '✓ Matches' : '✗ No match'}
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            prefersReducedMotion
              ? 'border-yellow-300 bg-yellow-100'
              : 'border-gray-300 bg-gray-100'
          }`}
        >
          <h3 className="font-semibold">Reduced Motion (Custom)</h3>
          <p className="text-sm">
            useMediaQuery('(prefers-reduced-motion: reduce)')
          </p>
          <p
            className={`font-bold ${prefersReducedMotion ? 'text-green-600' : 'text-red-600'}`}
          >
            {prefersReducedMotion ? '✓ Matches' : '✗ No match'}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold">Current Device Info:</h3>
        <ul className="space-y-1 text-sm">
          <li>
            Screen Width:{' '}
            {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px
          </li>
          <li>
            Screen Height:{' '}
            {typeof window !== 'undefined' ? window.innerHeight : 'N/A'}px
          </li>
          <li>
            User Agent:{' '}
            {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
          </li>
        </ul>
      </div>
    </div>
  );
}
