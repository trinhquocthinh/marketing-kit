'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { I18n } from '@/i18n';

const TABS = [
  { key: 'libraries', href: '/agent/marketing-kit/library' },
  { key: 'myImages', href: '/agent/marketing-kit/my-images' },
  { key: 'performance', href: '/agent/marketing-kit/performance' },
] as const;

export default function MarketingKitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isTabActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Tab bar – matches RN HomeTabComponent */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="flex">
          {TABS.map((tab) => {
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex-1 h-12 flex items-center justify-center text-center text-sm font-[Montserrat,sans-serif] transition-colors ${
                  active
                    ? 'text-[#FA875B] font-semibold border-b-2 border-[#FA875B]'
                    : 'text-black font-normal'
                }`}
              >
                {I18n.marketingDashboard[tab.key]}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
