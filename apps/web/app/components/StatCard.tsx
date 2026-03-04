'use client';

import { cn } from '../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  accent?: 'electric' | 'emerald' | 'amber' | 'red' | 'purple';
  className?: string;
}

const accentStyles = {
  electric: {
    iconBg: 'bg-electric/10',
    iconText: 'text-electric',
    glow: 'rgba(34, 197, 94, 0.06)',
    border: 'border-electric/10',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    glow: 'rgba(16, 185, 129, 0.06)',
    border: 'border-emerald-500/10',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
    glow: 'rgba(245, 158, 11, 0.06)',
    border: 'border-amber-500/10',
  },
  red: {
    iconBg: 'bg-red-500/10',
    iconText: 'text-red-400',
    glow: 'rgba(239, 68, 68, 0.06)',
    border: 'border-red-500/10',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconText: 'text-purple-400',
    glow: 'rgba(168, 85, 247, 0.06)',
    border: 'border-purple-500/10',
  },
};

export default function StatCard({ label, value, change, trend, icon, accent = 'electric', className }: StatCardProps) {
  const style = accentStyles[accent];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.06] px-5 py-5 transition-all duration-300 group hover:border-white/10',
        className
      )}
      style={{
        background: `linear-gradient(145deg, rgba(28, 32, 40, 0.95), rgba(20, 23, 30, 0.98))`,
        boxShadow: `0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)`,
      }}
    >
      {/* Subtle corner glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${style.glow}, transparent 70%)` }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col gap-3">
          <span className="stat-label">{label}</span>
          <div className="flex items-end gap-2.5">
            <span className="stat-value animate-count-up">{value}</span>
            {change && (
              <span className={cn(
                'text-xs font-semibold mb-1 flex items-center gap-0.5',
                trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
              )}>
                {trend === 'up' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                )}
                {trend === 'down' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                )}
                {change}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
            style.iconBg, style.iconText
          )}>
            {icon}
          </div>
        )}
      </div>

      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}
