import Skeleton, { SkeletonChart, SkeletonGrid } from '@/components/ui/Skeleton';

export default function AgentLoading() {
  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-4 pb-32 md:px-8 lg:pl-32 lg:pb-8">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <SkeletonChart className="mb-6" />
      <SkeletonGrid count={6} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
    </div>
  );
}
