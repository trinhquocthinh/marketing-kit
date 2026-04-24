'use client';

import { useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

import Button from '@/components/ui/Button';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[portal:error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass-bento w-full max-w-md p-8 text-center">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-[var(--danger)]"
          style={{ background: 'color-mix(in srgb, var(--danger) 15%, transparent)' }}
        >
          <AlertTriangle className="h-7 w-7" strokeWidth={2.2} />
        </div>
        <h2 className="mb-3 text-xl font-black tracking-tight text-[var(--text-strong)]">
          Có lỗi xảy ra
        </h2>
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          {error.message || 'Không thể tải dữ liệu. Vui lòng thử lại.'}
        </p>
        <Button variant="primary" onClick={reset} className="w-full justify-center">
          Thử lại
        </Button>
      </div>
    </div>
  );
}
