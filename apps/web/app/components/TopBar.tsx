'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import NotificationCenter from './NotificationCenter';
import { useSidebar } from './SidebarContext';

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { toggle } = useSidebar();

  return (
    <div className="sticky top-0 z-30 border-b border-white/[0.06]" style={{ background: 'rgba(11, 17, 32, 0.85)', backdropFilter: 'blur(20px) saturate(180%)' }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-1 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all shrink-0"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Global Search */}
        <div className="flex-1 max-w-lg">
          <button
            onClick={() => {
              setSearchOpen(true);
              setTimeout(() => searchRef.current?.focus(), 50);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-500 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <span className="hidden sm:inline">Search prospects, videos, reports...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="ml-auto text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded font-mono hidden sm:inline">Ctrl+K</kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Add */}
          <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all" title="Quick Add">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
            </svg>
          </button>

          {/* Help */}
          <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all" title="Help & Support">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
            </svg>
          </button>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-white/5 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric/30 to-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-electric ring-2 ring-electric/10">
                CR
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden animate-scale-in" style={{ background: 'linear-gradient(145deg, #1C2028, #14171E)' }}>
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-medium">Coach Rivera</p>
                  <p className="text-xs text-gray-500">rivera@university.edu</p>
                </div>
                <div className="p-1">
                  <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /></svg>
                    Settings
                  </Link>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                    Profile
                  </a>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                    Help Center
                  </a>
                </div>
                <div className="p-1 border-t border-white/5">
                  <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sign Out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Command Palette / Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-start justify-center pt-[12vh]" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'linear-gradient(145deg, #1C2028, #14171E)' }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 h-14 border-b border-white/5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-electric shrink-0">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search prospects, videos, reports, commands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
              <kbd className="text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded font-mono">ESC</kbd>
            </div>

            {/* Quick Actions */}
            {!searchQuery && (
              <div className="p-3">
                <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wider px-2 mb-2">Quick Actions</p>
                <div className="space-y-0.5">
                  {[
                    { label: 'Add New Prospect', icon: 'M8 12h8 M12 8v8', href: '/crm' },
                    { label: 'Upload Video', icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12', href: '/video' },
                    { label: 'Generate Report', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', href: '/analytics' },
                    { label: 'View Compliance Calendar', icon: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', href: '/compliance' },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-electric transition-colors">
                        <path d={action.icon} />
                      </svg>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Placeholder */}
            {searchQuery && (
              <div className="p-3">
                <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wider px-2 mb-2">Results</p>
                <div className="space-y-0.5">
                  {[
                    { name: 'Marcus Johnson', detail: 'QB - Lincoln Prep - Atlanta, GA', type: 'Prospect' },
                    { name: 'DeAndre Williams', detail: 'DE - North Shore HS - Chicago, IL', type: 'Prospect' },
                    { name: 'Junior Season Highlights', detail: 'Marcus Johnson - 4:00 - Analyzed', type: 'Video' },
                  ]
                    .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.detail.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((result) => (
                      <button
                        key={result.name}
                        onClick={() => setSearchOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center text-[10px] font-bold text-electric">
                          {result.type === 'Prospect' ? 'P' : 'V'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{result.detail}</p>
                        </div>
                        <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded">{result.type}</span>
                      </button>
                    ))}
                  {searchQuery.length > 0 && (
                    <p className="text-xs text-gray-600 text-center py-3">
                      Press Enter for full AI-powered search
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
