import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MobileSportBar from './components/MobileSportBar';
import { SidebarProvider } from './components/SidebarContext';
import { ProspectProvider } from './components/ProspectContext';
import { SportProvider } from './components/SportContext';
import AddProspectModal from './components/AddProspectModal';
import { TeamProvider } from './components/TeamContext';
import CreateProfileModal from './components/CreateProfileModal';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#22C55E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'Scout Vision — Recruiting Intelligence Platform',
    template: '%s | Scout Vision',
  },
  description: 'AI-powered multi-sport recruiting intelligence. CRM, compliance tracking, video scouting, predictive analytics, and biomechanical analysis for athletic programs at every level.',
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
    description: 'AI-powered recruiting intelligence for athletic programs at every level. Streamline scouting, ensure compliance, and make data-driven decisions.',
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
    description: 'AI-powered recruiting intelligence for athletic programs at every level.',
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
        <SidebarProvider>
          <SportProvider>
          <ProspectProvider>
          <TeamProvider>
          <Sidebar />
          <main className="lg:ml-[260px] min-h-screen transition-[margin] duration-200 relative z-10">
            <TopBar />
            <MobileSportBar />
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </div>
          </main>
          <AddProspectModal />
          <CreateProfileModal />
          </TeamProvider>
          </ProspectProvider>
          </SportProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
