'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AlertTriangle } from 'lucide-react';

import Button from '@/components/ui/Button';

export default function AgentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[agent:error]', error);
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
        <p className="bento-eyebrow mb-2 justify-center" style={{ display: 'inline-flex' }}>
          Error
        </p>
        <h2 className="mb-3 text-xl font-black tracking-tight text-[var(--text-strong)]">
          Đã xảy ra lỗi
        </h2>
        <p className="mb-6 text-sm break-words text-[var(--text-muted)]">
          {error.message || 'Không thể tải trang agent. Vui lòng thử lại.'}
        </p>
        <div className="flex gap-3">
          <Button variant="primary" onClick={reset} className="flex-1 justify-center">
            Thử lại
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/agent/marketing-kit/library')}
            className="flex-1 justify-center"
          >
            Về Library
          </Button>
        </div>
      </div>
    </div>
  );
}
