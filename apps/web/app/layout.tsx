import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Image from 'next/image';
import AppIcon from './components/AppIcon';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Scout Vision',
  description: 'Division II & III recruiting intelligence platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className + ' bg-navy text-white min-h-screen'}>
        <header className="flex items-center p-6 gap-4">
          <AppIcon className="rounded-xl" />
          <Image src="/logo.png" alt="Scout Vision Logo" width={48} height={48} className="rounded-xl" />
          <Image src="/app-icon.png" alt="Scout Vision Typography" width={180} height={48} className="ml-2" />
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
