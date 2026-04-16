export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[var(--surface-hover)] rounded ${className}`} />;
}
