import { ReactLenis } from '@studio-freight/react-lenis';
import { ReactNode } from 'react';
import useReducedMotion from '@/hooks/useReducedMotion';

/**
 * Global Smooth Scroll Provider using Lenis.
 * Configured for creative, cinematic feel suitable for interior design showcase.
 * Respects prefers-reduced-motion for vestibular safety.
 */
export const SmoothScroll = ({ children }: { children: ReactNode }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

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
