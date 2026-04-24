'use client';

import { MAX_CHARACTER_SHOW_ANIMATION } from '@/lib/constants';

const MAX_MARQUEE_LENGTH = 100;

interface MarqueeProps {
  text: string;
  className?: string;
  textClassName?: string;
  minChars?: number;
  speed?: number; // seconds for one cycle
}

export default function Marquee({
  text,
  className = '',
  textClassName = '',
  minChars = MAX_CHARACTER_SHOW_ANIMATION,
  speed = 8,
}: MarqueeProps) {
  // Clamp text to max 100 characters
  const displayText = text.length > MAX_MARQUEE_LENGTH ? text.slice(0, MAX_MARQUEE_LENGTH) : text;

  // Only animate if text length is between minChars and MAX_MARQUEE_LENGTH
  if (displayText.length < minChars) {
    return <span className={`${className} ${textClassName}`}>{displayText}</span>;
  }

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <span
        className={`animate-marquee inline-block ${textClassName}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {displayText}
      </span>
    </div>
  );
}
