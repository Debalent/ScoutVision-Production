'use client';

import { cn } from '../../lib/utils';

// ─── Progress Ring ──────────────────────────────────────────────────

interface ProgressRingProps {
  value: number;       // 0-100
  size?: number;       // px
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  showValue?: boolean;
}

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 4,
  color = '#22C55E',
  trackColor = 'rgba(255,255,255,0.05)',
  label,
  showValue = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && <span className="text-sm font-bold text-white">{Math.round(value)}</span>}
        {label && <span className="text-2xs text-gray-500">{label}</span>}
      </div>
    </div>
  );
}

// ─── Metric Card ────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;      // Percentage change
  icon?: React.ReactNode;
  color?: 'electric' | 'green' | 'amber' | 'red' | 'purple';
}

const colorMap = {
  electric: 'text-electric bg-electric/10',
  green: 'text-emerald-400 bg-emerald-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  red: 'text-red-400 bg-red-500/10',
  purple: 'text-purple-400 bg-purple-500/10',
};

export function MetricCard({ label, value, change, icon, color = 'electric' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        {icon && <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorMap[color])}>{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="stat-value">{value}</span>
        {change !== undefined && (
          <span className={cn('text-xs font-medium mb-1', change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-gray-500">{icon}</div>}
      <p className="text-sm font-medium text-white">{title}</p>
      {description && <p className="text-xs text-gray-500 mt-1 max-w-sm">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm mt-4">{action.label}</button>
      )}
    </div>
  );
}

// ─── Skeleton Loader ────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className, rows }: SkeletonProps) {
  if (rows) {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={cn('skeleton h-4', i === 0 ? 'w-3/4' : i === rows - 1 ? 'w-1/2' : 'w-full', className)} />
        ))}
      </div>
    );
  }
  return <div className={cn('skeleton', className)} />;
}

// ─── Divider ────────────────────────────────────────────────────────

export function Divider({ label }: { label?: string }) {
  if (label) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 divider" />
        <span className="text-xs text-gray-500">{label}</span>
        <div className="flex-1 divider" />
      </div>
    );
  }
  return <div className="divider" />;
}

// ─── Avatar ─────────────────────────────────────────────────────────

interface AvatarProps {
  name?: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const avatarSizes = {
  sm: 'avatar-sm',
  md: 'avatar',
  lg: 'avatar-lg',
};

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  if (imageUrl) {
    return <img src={imageUrl} alt={name || ''} className={cn(avatarSizes[size], 'object-cover')} />;
  }
  const initials = name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return <div className={avatarSizes[size]}>{initials}</div>;
}

// ─── Badge ──────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'electric' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  dot?: boolean;
}

const badgeVariants = {
  electric: 'badge-electric',
  green: 'badge-green',
  amber: 'badge-amber',
  red: 'badge-red',
  purple: 'badge-purple',
  gray: 'badge-gray',
};

const dotColors = {
  electric: 'bg-electric',
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red: 'bg-red-400',
  purple: 'bg-purple-400',
  gray: 'bg-gray-400',
};

export function Badge({ children, variant = 'gray', dot }: BadgeProps) {
  return (
    <span className={badgeVariants[variant]}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full mr-1', dotColors[variant])} />}
      {children}
    </span>
  );
}
