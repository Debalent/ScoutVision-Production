'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { useSidebar } from './SidebarContext';
import { useSport } from './SportContext';
import logoImg from '../../public/logo.png';

const NAV_ITEMS = [
  { href: '/',           label: 'Dashboard',   icon: DashboardIcon },
  { href: '/crm',        label: 'Recruiting',  icon: CRMIcon },
  { href: '/compare',    label: 'Compare',     icon: CompareIcon },
  { href: '/compliance', label: 'Compliance',  icon: ComplianceIcon },
  { href: '/analytics',  label: 'Analytics',   icon: AnalyticsIcon },
  { href: '/reports',    label: 'Reports',     icon: ReportsIcon },
  { href: '/video',      label: 'Video Scout', icon: VideoIcon },
  { href: '/settings',   label: 'Settings',    icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { open, close } = useSidebar();
  const { sport, setSport, sportList, level, setLevel, levelList, demoMode, toggleDemoMode } = useSport();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}
      <aside className={cn(
        'fixed left-0 top-0 bottom-0 w-[260px] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-200 ease-in-out',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )} style={{ background: 'linear-gradient(180deg, #16191F 0%, #0F1219 100%)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.04]">
          <Image
            src={logoImg}
            alt="Scout Vision"
            width={200}
            height={50}
            className="w-full max-w-[200px] h-auto object-contain mx-auto"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {/* Sport & Level Selectors */}
        <div className="px-1 pb-4 space-y-2 border-b border-white/[0.06] mb-3">
          {/* Sport Selector */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-medium px-2 mb-1">Sport</label>
            <div className="grid grid-cols-5 gap-1">
              {sportList.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSport(s.key)}
                  title={s.label}
                  className={cn(
                    'flex items-center justify-center py-1.5 rounded-lg text-base transition-all duration-150',
                    sport === s.key
                      ? 'bg-electric/[0.12] ring-1 ring-electric/30 scale-105'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] opacity-60 hover:opacity-100'
                  )}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-medium px-2 mb-1">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              title="Select evaluation level"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-electric/30 transition-all"
            >
              {levelList.map((l) => (
                <option key={l.key} value={l.key} className="bg-navy text-gray-300">{l.label}</option>
              ))}
            </select>
          </div>

          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={cn(
              'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200',
              demoMode
                ? 'bg-electric/[0.12] text-electric border border-electric/20'
                : 'bg-white/[0.02] text-gray-400 border border-white/[0.06] hover:bg-white/[0.04] hover:text-gray-300'
            )}
          >
            <div className={cn(
              'w-8 h-4 rounded-full relative transition-colors duration-200',
              demoMode ? 'bg-electric/30' : 'bg-white/10'
            )}>
              <div className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200',
                demoMode ? 'left-4 bg-electric' : 'left-0.5 bg-gray-500'
              )} />
            </div>
            <span>Demo Mode</span>
            {demoMode && (
              <span className="ml-auto text-[10px] bg-electric/20 text-electric px-1.5 py-0.5 rounded-full">ON</span>
            )}
          </button>
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ease-out group relative',
                isActive
                  ? 'bg-electric/[0.08] text-electric shadow-[inset_0_0_0_1px_rgba(34,197,94,0.12)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] active:scale-[0.98]'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-electric" />
              )}
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
      <div className="px-3 pb-4 space-y-3">
        <div className="border-t border-white/[0.06] pt-3" />
        <div className="rounded-xl px-4 py-3 bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric/20 to-emerald-500/20 flex items-center justify-center text-xs font-bold text-electric ring-2 ring-electric/10">
              CR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Coach Rivera</p>
              <p className="text-xs text-gray-500">Head Coach</p>
            </div>
            <button className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all" title="Account settings" aria-label="Account settings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
          </div>
        </div>
        <div className="px-3 py-2 flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span>Growth Plan · 4 seats</span>
        </div>
      </div>
    </aside>
    </>
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

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-electric' : 'text-gray-500'}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CompareIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-electric' : 'text-gray-500'}>
      <rect x="2" y="4" width="8" height="16" rx="1" /><rect x="14" y="4" width="8" height="16" rx="1" /><path d="M12 2v20" />
    </svg>
  );
}

function ReportsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-electric' : 'text-gray-500'}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
    </svg>
  );
}
