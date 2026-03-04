'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';

interface Notification {
  id: string;
  type: 'analysis_complete' | 'report_ready' | 'compliance_alert' | 'visit_reminder' | 'stage_change';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'analysis_complete', title: 'AI Analysis Complete',
    message: 'Video analysis for Marcus Johnson film is ready. Grade: A-',
    read: false, link: '/video', createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'n2', type: 'report_ready', title: 'Scouting Report Generated',
    message: 'AI scouting report for DeAndre Williams is ready to review.',
    read: false, link: '/crm', createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'n3', type: 'compliance_alert', title: 'Dead Period Approaching',
    message: 'NCAA dead period begins in 3 days. Review scheduled contacts.',
    read: false, link: '/compliance', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'n4', type: 'visit_reminder', title: 'Visit Tomorrow',
    message: 'Khalil Brown unofficial visit scheduled for tomorrow at 10:00 AM.',
    read: true, link: '/crm', createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'n5', type: 'stage_change', title: 'Prospect Stage Updated',
    message: 'Jaylen Carter moved from Contacted to Evaluating.',
    read: true, link: '/crm', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const typeIcons: Record<string, { path: string; color: string }> = {
  analysis_complete: {
    path: 'M12 2a4 4 0 014 4v1a1 1 0 01-1 1H9a1 1 0 01-1-1V6a4 4 0 014-4zM8 7v3a1 1 0 001 1h6a1 1 0 001-1V7',
    color: 'text-electric bg-electric/10',
  },
  report_ready: {
    path: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    color: 'text-purple-400 bg-purple-500/10',
  },
  compliance_alert: {
    path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    color: 'text-amber-400 bg-amber-500/10',
  },
  visit_reminder: {
    path: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    color: 'text-emerald-400 bg-emerald-500/10',
  },
  stage_change: {
    path: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    color: 'text-blue-400 bg-blue-500/10',
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
          <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-electric text-navy text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px] shadow-glow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-3 w-96 card p-0 z-40 animate-scale-in max-h-[480px] overflow-hidden flex flex-col shadow-card-elevated">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-electric hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {notifications.map((n) => {
                const iconConfig = typeIcons[n.type] || typeIcons.stage_change;
                return (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); setOpen(false); }}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors border-b border-white/5',
                      !n.read && 'bg-electric/[0.02]'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', iconConfig.color)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d={iconConfig.path} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-medium truncate', n.read ? 'text-gray-300' : 'text-white')}>{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-electric flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-2xs text-gray-600 mt-1 block">{timeAgo(n.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
