'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { BarChart3, ImageIcon, Images, LogOut } from 'lucide-react';

import { useTheme } from '@/components/providers/ThemeProvider';
import BrandSwitcher from '@/components/ui/BrandSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { I18n } from '@/i18n';
import { httpService } from '@/lib/http.service';
import { useAuthStore } from '@/stores/useAuthStore';

const tabs = [
  {
    href: '/agent/marketing-kit/library',
    label: I18n.marketingDashboard.libraries,
    icon: Images,
  },
  {
    href: '/agent/marketing-kit/my-images',
    label: I18n.marketingDashboard.myImages,
    icon: ImageIcon,
  },
  {
    href: '/agent/marketing-kit/performance',
    label: I18n.marketingDashboard.performance,
    icon: BarChart3,
  },
];

const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

export default function AgentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const agentCode = useAuthStore((s) => s.agentCode);
  const phone = useAuthStore((s) => s.phone);
  const logout = useAuthStore((s) => s.logout);
  const displayName = agentCode || phone || 'Agent';
  const initials = displayName.slice(0, 2).toUpperCase();
  const { brand } = useTheme();

  const handleLogout = () => {
    logout();
    httpService.clearToken();
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/login');
  };

  const brandBadge =
    brand === 'fecredit' ? (
      <>
        <span style={{ color: '#E82629' }}>FE</span>{' '}
        <span style={{ color: '#00994F' }}>CREDIT</span>
      </>
    ) : (
      <span className="text-t-strong">
        IZIon<span className="text-primary">24</span>
      </span>
    );

  return (
    <div className="theme-transition relative flex min-h-screen text-t-secondary">
      {/* ───── Desktop Spatial Dock (left) ───── */}
      <aside className="fixed top-1/2 left-6 z-30 hidden w-24 -translate-y-1/2 flex-col items-center gap-4 rounded-[3rem] border border-(--surface-glass-border) bg-surface-glass-strong px-3 py-5 shadow-(--shadow-glass-lg) backdrop-blur-(--blur-glass) lg:flex">
        {/* Logo chip */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-[1.75rem] text-white shadow-(--shadow-glow-primary)"
          style={{ background: brandGradient }}
        >
          <span className="text-lg font-black tracking-tight">
            {brand === 'fecredit' ? 'FE' : 'IZ'}
          </span>
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-2">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                title={tab.label}
                className={`group relative flex h-14 w-14 items-center justify-center rounded-3xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  isActive
                    ? 'text-white shadow-(--shadow-glow-primary)'
                    : 'text-t-muted hover:bg-(--surface-glass-alt) hover:text-t-strong'
                }`}
                style={isActive ? { background: brandGradient } : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -right-3 h-6 w-1 rounded-full"
                    style={{ background: 'var(--primary)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="my-1 h-px w-8 bg-(--surface-glass-border)" />

        {/* Brand + theme switches */}
        <div className="flex flex-col items-center gap-2">
          <BrandSwitcher compact />
          <ThemeToggle compact />
        </div>

        <div className="my-1 h-px w-8 bg-(--surface-glass-border)" />

        {/* User avatar + logout */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white shadow-(--shadow-glass-sm)"
          style={{ background: brandGradient }}
          title={displayName}
        >
          {initials}
        </div>
        <button
          onClick={handleLogout}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-(--surface-glass-border) bg-(--surface-glass-alt) text-danger transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_15%,transparent)]"
          title={I18n.logout}
          aria-label={I18n.logout}
        >
          <LogOut className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </aside>

      {/* ───── Main Content ───── */}
      <main className="z-10 flex h-screen flex-1 flex-col overflow-hidden lg:pl-32">
        {/* Mobile top header (brand + switches) */}
        <header className="sticky top-0 z-20 glass-bento flex h-16 rounded-none! shrink-0 items-center justify-between gap-3 px-4 backdrop-blur-(--blur-glass) lg:hidden">
          <div className="flex items-center gap-3 px-4! py-2! text-sm font-black tracking-tight">
            {brandBadge}
          </div>
          <div className="flex items-center gap-2 px-2! py-1.5!">
            <ThemeToggle compact />
            <BrandSwitcher compact />
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-full text-danger transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_15%,transparent)]"
              aria-label={I18n.logout}
            >
              <LogOut className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
        </header>

        {/* Content scroll area */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-4 pt-4 pb-32 md:px-8 lg:pb-8">
          <div className="mx-auto max-w-1xl">{children}</div>
        </div>
      </main>

      {/* ───── Mobile Floating Bottom Nav ───── */}
      <nav className="fixed right-4 bottom-6 left-4 z-30 mx-auto flex max-w-95 items-center justify-around rounded-full border border-(--surface-glass-border) bg-surface-glass-strong px-3 py-2 shadow-(--shadow-glass-lg) backdrop-blur-(--blur-glass) lg:hidden">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                isActive
                  ? 'text-white shadow-(--shadow-glow-primary)'
                  : 'text-t-muted'
              }`}
              style={isActive ? { background: brandGradient } : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
