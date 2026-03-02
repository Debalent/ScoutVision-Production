import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#00E6FF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'Scout Vision — Recruiting Intelligence Platform',
    template: '%s | Scout Vision',
  },
  description: 'AI-powered multi-sport recruiting intelligence. CRM, compliance tracking, video scouting, predictive analytics, and biomechanical analysis for Division II and III programs.',
  keywords: ['recruiting', 'scouting', 'sports analytics', 'CRM', 'NCAA', 'compliance', 'AI', 'video analysis', 'college recruiting'],
  authors: [{ name: 'ScoutVision Team' }],
  creator: 'ScoutVision',
  publisher: 'ScoutVision',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://scoutvision.app'),
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Scout Vision',
    title: 'Scout Vision — Recruiting Intelligence Platform',
    description: 'AI-powered recruiting intelligence for college sports programs. Streamline scouting, ensure compliance, and make data-driven decisions.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Scout Vision - Recruiting Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scout Vision — Recruiting Intelligence Platform',
    description: 'AI-powered recruiting intelligence for college sports programs.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ScoutVision',
  },
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
