import * as React from 'react';
import { useReducedMotionPreference } from '@/lib/animations';

export function BorderBeam({
  className = '',
  size = 180,
  duration = 8,
  borderWidth = 1.5,
  colorFrom = '#10b981',
  colorTo = '#06b6d4',
}: {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
}) {
  const prefersReduced = useReducedMotionPreference();

  if (prefersReduced) {
    return (
      <div 
        className={`pointer-events-none absolute inset-0 rounded-[inherit] border ${className}`} 
        style={{ borderColor: colorFrom }} 
      />
    );
  }

  return (
    <div
      style={{
        '--size': size,
        '--duration': `${duration}s`,
        '--anchor': '90deg',
        '--border-width': `${borderWidth}px`,
        '--color-from': colorFrom,
        '--color-to': colorTo,
      } as React.CSSProperties}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width))*1px_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor))_50%] after:[offset-path:rect(0_auto_auto_0_round_inherit)] ${className}`}
    />
  );
}
