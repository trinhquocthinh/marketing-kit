export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-[var(--surface)] border border-[var(--border)] rounded-xl ${className}`}
    >
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}
