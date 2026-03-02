'use client';

import { cn } from '../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({ label, value, change, trend, icon, className }: StatCardProps) {
  return (
    <div className={cn('card px-5 py-4 flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="stat-value">{value}</span>
        {change && (
          <span className={cn(
            'text-xs font-semibold mb-1',
            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change}
          </span>
        )}
      </div>
    </div>
  );
}
