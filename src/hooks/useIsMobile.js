import { useState, useEffect } from 'react';

/**
 * Hook yang mengembalikan true jika viewport width < 768px (mobile breakpoint).
 * SSR-safe: menggunakan typeof window !== 'undefined' sebagai guard.
 * Otomatis update saat window di-resize.
 *
 * @returns {boolean} true jika layar mobile (< 768px), false jika tablet/desktop
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
};
