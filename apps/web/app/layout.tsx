import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Scout Vision — Recruiting Intelligence Platform',
  description: 'Division II & III recruiting intelligence. CRM, compliance, video scouting, and predictive analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className + ' bg-navy text-white min-h-screen antialiased'}>
        <Sidebar />
        <main className="ml-[260px] min-h-screen">
          <TopBar />
          <div className="max-w-[1440px] mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
