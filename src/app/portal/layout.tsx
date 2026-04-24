'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ArrowLeft, FolderOpen, ImageIcon, Users, Zap } from 'lucide-react';

import BrandSwitcher from '@/components/ui/BrandSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { I18n } from '@/i18n';

const sidebarLinks = [
  { href: '/portal/folders', label: I18n.portal.folders, icon: FolderOpen },
  { href: '/portal/posters', label: I18n.portal.posters, icon: ImageIcon },
  { href: '/portal/avatars', label: I18n.portal.avatars, icon: Users },
];

export default function PortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

  return (
    <div className="theme-transition relative flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 z-10 flex h-screen w-72 flex-col gap-4 p-4">
        <div className="flex flex-1 flex-col rounded-[var(--radius-bento-lg)] border border-[var(--surface-glass-border)] bg-[var(--surface-glass-strong)] p-6 shadow-[var(--shadow-glass-md)] backdrop-blur-[var(--blur-glass)]">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-glow-primary)]"
              style={{ background: brandGradient }}
            >
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">
                Admin
              </p>
              <p className="text-base font-black text-[var(--text-strong)]">Portal</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-2">
            {sidebarLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    isActive
                      ? 'text-white shadow-[var(--shadow-glow-primary)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-glass-alt)] hover:text-[var(--text-strong)]'
                  }`}
                  style={isActive ? { background: brandGradient } : undefined}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom controls */}
          <div className="mt-4 space-y-3 border-t border-[var(--surface-glass-border)] pt-4">
            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <BrandSwitcher compact />
            </div>
            <Link
              href="/agent/marketing-kit/library"
              className="flex items-center gap-2 rounded-full border border-[var(--surface-glass-border)] bg-[var(--surface-glass-alt)] px-4 py-2 text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase transition-colors hover:text-[var(--text-strong)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              Agent View
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="z-10 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
