import { SkeletonGrid } from '@/components/ui/Skeleton';

export default function PortalLoading() {
  return (
    <div className="theme-transition relative min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-[var(--surface-hover)]" />
        <SkeletonGrid count={8} />
      </div>
    </div>
  );
}
