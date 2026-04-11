import { ReactLenis } from '@studio-freight/react-lenis';
import { ReactNode } from 'react';

/**
 * Global Smooth Scroll Provider using Lenis.
 * Configured for creative, cinematic feel suitable for interior design showcase.
 */
export const SmoothScroll = ({ children }: { children: ReactNode }) => {
  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.08, // Slightly slower for more "luxury" feel
        duration: 1.2, 
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
};
