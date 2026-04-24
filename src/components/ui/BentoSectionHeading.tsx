import type { ReactNode } from 'react';

interface BentoSectionHeadingProps {
  title: string;
  variant?: 'primary' | 'accent';
  action?: ReactNode;
  className?: string;
}

export default function BentoSectionHeading({
  title,
  variant = 'primary',
  action,
  className = '',
}: BentoSectionHeadingProps) {
  return (
    <div className={`mb-6 flex items-center justify-between gap-4 ${className}`}>
      <h2 className="flex items-center gap-3 text-xl font-black tracking-wide text-[var(--text-strong)]">
        <span
          className={`bento-section-bar ${variant === 'accent' ? 'bento-section-bar--accent' : ''}`}
        />
        {title}
      </h2>
      {action}
    </div>
  );
}
