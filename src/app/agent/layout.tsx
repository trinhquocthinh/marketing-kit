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
    <svg className={`w-5 h-5 ${active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function MyImagesIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function PerformanceIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      {/* Background gradient blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--background)]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--blob-1)] blur-[120px] gradient-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--blob-2)] blur-[150px] gradient-blob" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-[var(--blob-3)] blur-[100px] gradient-blob" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 flex-col bg-[var(--sidebar-bg)] backdrop-blur-2xl border-r border-[var(--border)] hidden md:flex z-10 fixed inset-y-0 left-0 theme-transition">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-[var(--border)]">
          <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-rose-400">
            IZIon24
          </div>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--badge-bg)] text-[var(--text-secondary)] border border-[var(--border)]">AGENT</span>
        </div>

        {/* Nav tabs */}
        <div className="flex-1 py-6 px-4 space-y-2">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[image:var(--nav-active-bg)] border border-[var(--nav-active-border)] text-[var(--text-primary)] shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                <tab.icon active={isActive} />
                <span className="ml-3 font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User section */}
        <div className="p-4 border-t border-[var(--border)]">
          <ThemeToggle />
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] backdrop-blur-md border border-[var(--border)] mt-2 theme-transition">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{displayName}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-[var(--text-muted)] hover:text-rose-400 transition-colors" title={I18n.logout}>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden md:ml-64 z-10">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 bg-[var(--sidebar-bg)] backdrop-blur-lg border-b border-[var(--border)] sticky top-0 z-20 theme-transition">
          <div className="font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-rose-400">
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
