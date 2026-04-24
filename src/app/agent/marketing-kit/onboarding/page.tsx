'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui';
import { I18n } from '@/i18n';
import { LIST_TUTORIALS } from '@/lib/constants';
import { marketingDashboardService } from '@/lib/services/marketing-dashboard.service';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const tutorial = LIST_TUTORIALS[currentIndex];
  const isLast = currentIndex === LIST_TUTORIALS.length - 1;

  useEffect(() => {
    if (marketingDashboardService.isTutorialCompleted()) {
      router.replace('/agent/marketing-kit/library');
    }
  }, [router]);

  const handleNext = useCallback(() => {
    if (isLast) {
      marketingDashboardService.saveTutorialCompleted(true);
      router.replace('/agent/marketing-kit/library');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLast, router]);

  const handleSkip = useCallback(() => {
    marketingDashboardService.saveTutorialCompleted(true);
    router.replace('/agent/marketing-kit/library');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="animate-bento-fade-up w-full max-w-lg">
        <div className="glass-bento glass-shine overflow-hidden !p-0">
          {/* Image area */}
          <div className="flex aspect-[4/3] items-center justify-center bg-[var(--surface-glass-alt)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tutorial.image}
              alt={tutorial.title}
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <p className="bento-eyebrow mb-3 justify-center">
              Bước {currentIndex + 1} / {LIST_TUTORIALS.length}
            </p>
            <h2 className="mb-3 text-2xl font-black tracking-wide text-[var(--text-strong)]">
              {tutorial.title}
            </h2>
            <p className="mb-8 text-sm text-[var(--text-secondary)]">{tutorial.desc}</p>

            {/* Dots */}
            <div className="mb-8 flex items-center justify-center gap-2">
              {LIST_TUTORIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? 'w-8 shadow-[var(--shadow-glow-primary)]'
                      : 'w-2 bg-[var(--surface-glass-alt)]'
                  }`}
                  style={
                    i === currentIndex
                      ? {
                          background:
                            'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                        }
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              {!isLast ? (
                <>
                  <Button variant="ghost" onClick={handleSkip}>
                    Bỏ qua
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Tiếp theo
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={handleNext} className="w-full">
                  {I18n.marketingDashboard.startNow}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
