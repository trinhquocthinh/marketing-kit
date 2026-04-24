'use client';

import dynamic from 'next/dynamic';

import { SkeletonChart } from '@/components/ui/Skeleton';

/**
 * Lazy load `PerformanceChart` (chứa `recharts` ~80KB gzipped).
 *
 * - `ssr: false` để recharts không chạy ở server (cần DOM).
 * - `loading` dùng SkeletonChart giữ layout không nhảy.
 */
const PerformanceChartLazy = dynamic(() => import('./PerformanceChart'), {
  ssr: false,
  loading: () => <SkeletonChart />,
});

export default PerformanceChartLazy;
