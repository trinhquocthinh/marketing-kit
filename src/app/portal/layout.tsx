'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { I18n } from '@/i18n';
import ThemeToggle from '@/components/ui/ThemeToggle';

const sidebarLinks = [
  {
    href: '/portal/folders',
    label: I18n.portal.folders,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    href: '/portal/posters',
    label: I18n.portal.posters,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/portal/avatars',
    label: I18n.portal.avatars,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex theme-transition relative">
      {/* Aurora background */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--background)]">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--blob-1)] blur-[140px] gradient-blob animate-aurora-1" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[65%] h-[65%] rounded-full bg-[var(--blob-2)] blur-[160px] gradient-blob animate-aurora-2" />
        <div className="absolute top-[15%] right-[15%] w-[40%] h-[40%] rounded-full bg-[var(--blob-3)] blur-[120px] gradient-blob animate-aurora-3" />
        <div className="noise-overlay" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-[var(--sidebar-bg)] backdrop-blur-2xl border-r border-[var(--border)] flex flex-col sticky top-0 h-screen z-10 theme-transition">
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-6 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-linear-to-br from-orange-400 to-rose-400 shadow-[var(--glow-primary)]">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">Admin Portal</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 mx-3 my-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                  isActive
                    ? 'bg-[var(--nav-active-bg)] border-[var(--nav-active-border)] text-[var(--primary)] shadow-[var(--glow-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--border)] p-4 space-y-2">
          <ThemeToggle />
          <Link
            href="/agent/marketing-kit/library"
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Agent View
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 z-10">
        {children}
      </main>
    </div>
  );
}
