'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { I18n } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks/useStore';
import { authActions } from '@/lib/slices/auth.slice';
import { httpService } from '@/lib/http.service';
import ThemeToggle from '@/components/ui/ThemeToggle';

const tabs = [
  { href: '/agent/marketing-kit/library', label: I18n.marketingDashboard.libraries, icon: LibraryIcon },
  { href: '/agent/marketing-kit/my-images', label: I18n.marketingDashboard.myImages, icon: MyImagesIcon },
  { href: '/agent/marketing-kit/performance', label: I18n.marketingDashboard.performance, icon: PerformanceIcon },
];

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-[var(--text-muted)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function MyImagesIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-[var(--text-muted)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function PerformanceIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-[var(--text-muted)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export default function AgentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const agentCode = useAppSelector((state) => state.authentication.agentCode);
  const phone = useAppSelector((state) => state.authentication.phone);
  const displayName = agentCode || phone || 'Agent';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    dispatch(authActions.logout());
    httpService.clearToken();
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex text-[var(--text-secondary)] theme-transition">
      {/* Aurora background — orbs + film-grain noise */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--background)]">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--blob-1)] blur-[140px] gradient-blob animate-aurora-1" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[65%] h-[65%] rounded-full bg-[var(--blob-2)] blur-[160px] gradient-blob animate-aurora-2" />
        <div className="absolute top-[15%] right-[15%] w-[40%] h-[40%] rounded-full bg-[var(--blob-3)] blur-[120px] gradient-blob animate-aurora-3" />
        <div className="noise-overlay" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-[280px] shrink-0 flex-col bg-[var(--sidebar-bg)] backdrop-blur-[40px] border-r border-[var(--border)] hidden md:flex z-10 fixed inset-y-0 left-0 theme-transition shadow-[8px_0_40px_var(--shadow-color)]">
        {/* Logo */}
        <div className="h-24 flex items-center px-8 border-b border-[var(--border)]">
          <div className="font-display text-3xl font-black tracking-tight text-[var(--text-primary)]">
            IZIon<span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-rose-400 drop-shadow-[0_0_12px_rgba(250,135,91,0.45)]">24</span>
          </div>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--badge-bg)] text-[var(--text-secondary)] border border-[var(--border)]">AGENT</span>
        </div>

        {/* Nav tabs */}
        <div className="flex-1 py-4 px-6 space-y-3">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
                  isActive
                    ? 'bg-[var(--nav-active-bg)] border border-[var(--nav-active-border)] text-[var(--text-primary)] shadow-[var(--glow-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 transition-colors ${isActive ? 'bg-linear-to-tr from-orange-500 to-rose-400 text-white shadow-md' : 'bg-[var(--badge-bg)] text-[var(--text-muted)]'}`}>
                  <tab.icon active={isActive} />
                </div>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User section */}
        <div className="p-6 flex flex-col gap-4">
          <ThemeToggle />
          <div className="glass-card flex items-center gap-3 p-4 rounded-2xl theme-transition cursor-pointer hover:border-[var(--border-bright)] transition-all">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm shadow-[var(--glow-primary)]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[var(--text-primary)] truncate">{displayName}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-[var(--text-muted)] hover:text-rose-400 bg-[var(--badge-bg)] hover:bg-rose-500/10 rounded-xl transition-colors" title={I18n.logout}>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden md:ml-[280px] z-10">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 bg-[var(--sidebar-bg)] backdrop-blur-lg border-b border-[var(--border)] sticky top-0 z-20 theme-transition">
          <div className="font-display font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-rose-400 drop-shadow-[0_0_10px_rgba(250,135,91,0.45)]">
            IZIon24 MKT
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <button onClick={handleLogout} className="p-2 text-[var(--text-muted)] hover:text-rose-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            </button>
          </div>
        </header>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex overflow-x-auto bg-[var(--sidebar-bg)] backdrop-blur-md border-b border-[var(--border)] sticky top-16 z-20 hide-scrollbar theme-transition">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 py-4 text-sm font-medium text-center whitespace-nowrap transition-colors relative ${
                  isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-orange-400 to-rose-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-1xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
