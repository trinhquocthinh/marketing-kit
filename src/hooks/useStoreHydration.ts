'use client';

import { useSyncExternalStore } from 'react';

import { useAuthStore } from '@/stores/useAuthStore';
import { useDashboardStore } from '@/stores/useDashboardStore';

/**
 * Fix Hydration Mismatch khi dùng Zustand `persist` trong Next.js.
 *
 * SSR render với initial state (trước khi đọc storage), còn client sau khi
 * rehydrate sẽ dùng state từ sessionStorage/localStorage → mismatch.
 *
 * Hook này trả `hydrated=true` chỉ khi tất cả store đã rehydrate xong.
 * Usage:
 *   const hydrated = useStoreHydration();
 *   if (!hydrated) return <Skeleton />;
 */
const stores = [useAuthStore, useDashboardStore] as const;

function subscribe(onChange: () => void) {
  const unsubs = stores.map((s) => s.persist.onFinishHydration(onChange));
  return () => unsubs.forEach((u) => u());
}

const getSnapshot = () => stores.every((s) => s.persist.hasHydrated());

// Server luôn trả `false` → khớp với initial render → không có SSR mismatch.
const getServerSnapshot = () => false;

export function useStoreHydration() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
