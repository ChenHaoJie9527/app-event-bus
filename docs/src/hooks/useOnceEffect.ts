import { useEffect, useRef } from 'react';

export function useOnceEffect(callback?: () => void) {
  const isMounted = useRef(false);
  const callbackRef = useRef(callback);
  useEffect(() => {
    if (!isMounted.current) {
      callbackRef.current?.();
      isMounted.current = true;
    }
  }, []);
}
