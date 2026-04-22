'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { I18n } from '@/i18n';
import { LIST_TUTORIALS } from '@/lib/constants';
import { marketingDashboardService } from '@/lib/services/marketing-dashboard.service';
import { Button } from '@/components/ui';

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
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden theme-transition">
      {/* Aurora decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 -left-1/4 w-[60%] aspect-square rounded-full bg-[var(--aurora-blob-a)] blur-3xl opacity-70 animate-aurora-1" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[55%] aspect-square rounded-full bg-[var(--aurora-blob-b)] blur-3xl opacity-60 animate-aurora-2" />
      </div>
      <div className="noise-overlay" />

      <div className="w-full max-w-lg relative z-10">
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Image area */}
          <div className="aspect-[4/3] bg-[var(--surface-hover)] flex items-center justify-center">
            <img
              src={tutorial.image}
              alt={tutorial.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">{tutorial.title}</h2>
            <p className="text-sm text-[var(--text-muted)] mb-8">{tutorial.desc}</p>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {LIST_TUTORIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === currentIndex ? 'w-6 bg-linear-to-r from-orange-400 to-rose-500 shadow-[var(--glow-primary)]' : 'w-2.5 bg-[var(--surface-hover)]'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              {!isLast ? (
                <>
                  <button onClick={handleSkip} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                    Bỏ qua
                  </button>
                  <Button onClick={handleNext}>Tiếp theo</Button>
                </>
              ) : (
                <Button onClick={handleNext} className="w-full">
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
