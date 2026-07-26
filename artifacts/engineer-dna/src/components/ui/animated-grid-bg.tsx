import * as React from 'react';
import { useReducedMotionPreference } from '@/lib/animations';

export function AnimatedGridBg({ className = '' }: { className?: string }) {
  const prefersReduced = useReducedMotionPreference();

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden opacity-25 ${className}`}>
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        style={!prefersReduced ? { animation: 'grid-fade 8s ease-in-out infinite' } : undefined}
      />
    </div>
  );
}
