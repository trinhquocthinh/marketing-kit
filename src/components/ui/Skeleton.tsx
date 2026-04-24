export default function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-bento-sm)] bg-[var(--surface-glass-alt)] ${className}`}
      style={style}
    />
  );
}

/** Glass bento skeleton card */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-bento p-4 ${className}`}>
      <Skeleton className="mb-3 aspect-[3/4] w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/** Grid của SkeletonCard — dùng trong loading.tsx */
export function SkeletonGrid({
  count = 8,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className={`grid gap-6 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Chart skeleton */
export function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-bento p-8 ${className}`}>
      <Skeleton className="mb-6 h-5 w-40" />
      <div className="flex h-64 items-end gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${30 + ((i * 17) % 60)}%` }} />
        ))}
      </div>
    </div>
  );
}
