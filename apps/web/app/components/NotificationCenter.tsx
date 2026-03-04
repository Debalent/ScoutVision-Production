'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

type Severity = 'success' | 'warning' | 'error' | 'info';

interface Notification {
  id: string;
  type: 'analysis_complete' | 'report_ready' | 'compliance_alert' | 'visit_reminder' | 'stage_change';
  severity: Severity;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface Toast {
  id: string;
  severity: Severity;
  title: string;
  message: string;
  dismissing?: boolean;
}

// ─── Severity Config ────────────────────────────────────────────────

const severityConfig: Record<Severity, {
  icon: string;
  iconBg: string;
  iconText: string;
  dot: string;
  toastBorder: string;
  toastGlow: string;
}> = {
  success: {
    icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M9 11l3 3L22 4',
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    dot: 'bg-emerald-400',
    toastBorder: 'border-l-emerald-400',
    toastGlow: '0 4px 24px rgba(16, 185, 129, 0.15)',
  },
  warning: {
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
    dot: 'bg-amber-400',
    toastBorder: 'border-l-amber-400',
    toastGlow: '0 4px 24px rgba(245, 158, 11, 0.15)',
  },
  error: {
    icon: 'M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    iconBg: 'bg-red-500/10',
    iconText: 'text-red-400',
    dot: 'bg-red-400',
    toastBorder: 'border-l-red-400',
    toastGlow: '0 4px 24px rgba(239, 68, 68, 0.15)',
  },
  info: {
    icon: 'M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22 M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93 M8.56 14h6.88 M9.44 17.5h5.12',
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-400',
    dot: 'bg-blue-400',
    toastBorder: 'border-l-blue-400',
    toastGlow: '0 4px 24px rgba(59, 130, 246, 0.15)',
  },
};

// ─── Mock Data ──────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'analysis_complete', severity: 'info', title: 'AI Analysis Complete',
    message: 'Video analysis for Marcus Johnson film is ready. Grade: A-',
    read: false, link: '/video', createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'n2', type: 'report_ready', severity: 'success', title: 'Scouting Report Generated',
    message: 'AI scouting report for DeAndre Williams is ready to review.',
    read: false, link: '/crm', createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'n3', type: 'compliance_alert', severity: 'warning', title: 'Dead Period Approaching',
    message: 'NCAA dead period begins in 3 days. Review scheduled contacts.',
    read: false, link: '/compliance', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'n4', type: 'visit_reminder', severity: 'info', title: 'Visit Tomorrow',
    message: 'Khalil Brown unofficial visit scheduled for tomorrow at 10:00 AM.',
    read: true, link: '/crm', createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'n5', type: 'stage_change', severity: 'success', title: 'Prospect Stage Updated',
    message: 'Jaylen Carter moved from Contacted to Evaluating.',
    read: true, link: '/crm', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Toast Stack ────────────────────────────────────────────────────

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none w-[calc(100vw-2rem)] sm:w-[380px]">
      {toasts.map((toast, i) => {
        const config = severityConfig[toast.severity];
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-xl border border-white/[0.08] border-l-[3px] px-4 py-3 flex items-start gap-3',
              config.toastBorder,
              toast.dismissing ? 'animate-toast-out' : 'animate-toast-in',
            )}
            style={{
              background: 'linear-gradient(145deg, rgba(28, 32, 40, 0.98), rgba(20, 23, 30, 0.99))',
              boxShadow: config.toastGlow,
            }}
          >
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', config.iconBg)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={config.iconText}>
                <path d={config.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{toast.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-150 shrink-0"
              aria-label="Dismiss notification"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filter, setFilter] = useState<Severity | 'all'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.severity === filter);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, dismissing: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  // Auto-dismiss toasts after 4s
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts
      .filter((t) => !t.dismissing)
      .map((t) => setTimeout(() => dismissToast(t.id), 4000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  // Demo toast on mount
  useEffect(() => {
    const firstUnread = MOCK_NOTIFICATIONS.filter((n) => !n.read).slice(0, 1);
    if (firstUnread.length > 0) {
      const n = firstUnread[0];
      const timer = setTimeout(() => {
        setToasts([{ id: `toast-${n.id}`, severity: n.severity, title: n.title, message: n.message }]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="relative">
        {/* Bell */}
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 hover:bg-white/5 rounded-lg transition-all duration-150 active:scale-95"
          aria-label="Toggle notifications"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
            <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-electric text-navy text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px] shadow-glow-sm animate-pulse-glow">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div
              className="fixed inset-x-3 top-16 z-40 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-[420px] rounded-2xl border border-white/[0.08] p-0 max-h-[520px] overflow-hidden flex flex-col animate-notification-in"
              style={{
                background: 'linear-gradient(145deg, rgba(28, 32, 40, 0.98), rgba(20, 23, 30, 0.99))',
                boxShadow: '0 16px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-electric/10 text-electric text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-electric hover:text-electric/80 transition-colors font-medium">
                    Mark all read
                  </button>
                )}
              </div>

              {/* Severity Filters */}
              <div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/[0.04] overflow-x-auto">
                {(['all', 'info', 'success', 'warning', 'error'] as const).map((sev) => {
                  const count = sev === 'all'
                    ? notifications.filter((n) => !n.read).length
                    : notifications.filter((n) => n.severity === sev && !n.read).length;
                  return (
                    <button
                      key={sev}
                      onClick={() => setFilter(sev)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150 whitespace-nowrap flex items-center gap-1.5',
                        filter === sev ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                      )}
                    >
                      {sev !== 'all' && <span className={cn('w-1.5 h-1.5 rounded-full', severityConfig[sev].dot)} />}
                      {sev}
                      {count > 0 && <span className="text-[10px] text-gray-500">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {filteredNotifications.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 mx-auto mb-2">
                      <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-gray-500">No notifications</p>
                  </div>
                ) : (
                  filteredNotifications.map((n, i) => {
                    const config = severityConfig[n.severity];
                    return (
                      <button
                        key={n.id}
                        onClick={() => { markRead(n.id); setOpen(false); }}
                        className={cn(
                          'w-full flex items-start gap-3 px-5 py-3.5 text-left transition-all duration-150 border-b border-white/[0.04] last:border-b-0 group',
                          'hover:bg-white/[0.03] active:bg-white/[0.05]',
                          !n.read && 'bg-white/[0.015]'
                        )}
                      >
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', config.iconBg)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={config.iconText}>
                            <path d={config.icon} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm font-medium truncate', n.read ? 'text-gray-300' : 'text-white')}>{n.title}</span>
                            {!n.read && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-gray-600 mt-1.5 block">{timeAgo(n.createdAt)}</span>
                        </div>
                        <div
                          className="p-1 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                          role="button"
                          aria-label="Dismiss"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                          </svg>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-center">
                <button className="text-xs text-gray-400 hover:text-electric transition-colors font-medium">
                  View all notifications →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
