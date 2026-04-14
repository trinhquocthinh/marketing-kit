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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image area */}
          <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">{tutorial.title}</h2>
            <p className="text-sm text-gray-500 mb-8">{tutorial.desc}</p>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {LIST_TUTORIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-[#FA875B]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              {!isLast ? (
                <>
                  <button onClick={handleSkip} className="text-sm text-gray-400 hover:text-gray-600">
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
