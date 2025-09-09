import { useEffect, useState } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640); // 640px is the 'sm' breakpoint in Tailwind
    };

    // Check on mount
    checkIfMobile();

    // Check on window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
};
