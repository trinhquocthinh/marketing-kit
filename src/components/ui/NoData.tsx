import { Inbox } from 'lucide-react';

import { I18n } from '@/i18n';

interface NoDataProps {
  message?: string;
  className?: string;
}

export default function NoData({ message, className = '' }: NoDataProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 text-center ${className}`}
    >
      <div className="shadow-inner-soft flex h-20 w-20 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]">
        <Inbox className="h-9 w-9" strokeWidth={2} />
      </div>
      <p className="text-[11px] font-black tracking-widest text-[var(--text-muted)] uppercase">
        {message || I18n.noData}
      </p>
    </div>
  );
}
