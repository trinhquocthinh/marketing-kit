'use client';

import { MAX_CHARACTER_SHOW_ANIMATION } from '@/lib/constants';

interface MarqueeProps {
  text: string;
  className?: string;
  maxChars?: number;
  speed?: number; // seconds for one cycle
}

export default function Marquee({ text, className = '', maxChars = MAX_CHARACTER_SHOW_ANIMATION, speed = 8 }: MarqueeProps) {
  if (text.length <= maxChars) {
    return <span className={className}>{text}</span>;
  }

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <span
        className="inline-block animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        {text}
      </span>
    </div>
  );
}
