import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add hover shimmer sweep. */
  shine?: boolean;
  /** Enable lift + shadow on hover. */
  interactive?: boolean;
  /** Decorative blur orb in top-right corner for depth. */
  glow?: boolean;
  children?: ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ shine, interactive, glow, className = '', children, ...rest }, ref) => {
    const classes = [
      'glass-bento',
      interactive ? 'glass-bento-interactive' : '',
      shine ? 'glass-shine group' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...rest}>
        {glow && (
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full"
            style={{
              background:
                'linear-gradient(to bottom left, color-mix(in srgb, var(--accent) 30%, transparent), color-mix(in srgb, var(--primary) 10%, transparent))',
              filter: 'blur(40px)',
            }}
          />
        )}
        {children}
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
