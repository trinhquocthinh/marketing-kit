import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Background } from '@/components/ui';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Marketing Kit',
  description: 'Marketing Kit - Agent Dashboard',
};

// Inline script to prevent FOUC — runs before React hydrates
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme')||'auto';if(t==='auto'){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t);var b=localStorage.getItem('brand');if(b!=='orange'&&b!=='fecredit'&&b!=='ocean'){b='orange'}document.documentElement.setAttribute('data-brand',b)}catch(e){document.documentElement.setAttribute('data-theme','dark');document.documentElement.setAttribute('data-brand','orange')}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="relative flex min-h-full flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <Background />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
