'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { href: '/',           label: 'Dashboard',   icon: DashboardIcon },
  { href: '/crm',        label: 'Recruiting',  icon: CRMIcon },
  { href: '/compliance', label: 'Compliance',  icon: ComplianceIcon },
  { href: '/analytics',  label: 'Analytics',   icon: AnalyticsIcon },
  { href: '/video',      label: 'Video Scout', icon: VideoIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-charcoal border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric to-cyan-400 flex items-center justify-center shadow-lg shadow-electric/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">Scout Vision</h1>
          <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Recruiting Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-electric/10 text-electric shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon active={isActive} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-electric animate-pulse-glow" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-2">
        <div className="card px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-electric">
              CR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Coach Rivera</p>
              <p className="text-xs text-gray-500">Head Coach</p>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span>Growth Plan · 4 seats</span>
        </div>
      </div>
    </aside>
  );
}

// ─── Icon Components ────────────────────────────────────────────────

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-electric' : 'text-gray-500'}>
      <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function CRMIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-electric' : 'text-gray-500'}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ComplianceIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-electric' : 'text-gray-500'}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function AnalyticsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-electric' : 'text-gray-500'}>
      <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function VideoIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-electric' : 'text-gray-500'}>
      <path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}
