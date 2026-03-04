// ─── ScoutVision Utility Helpers ─────────────────────────────────────

/** Merge class names, filtering out falsy values */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Format a date string to readable format */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format a date string to relative time (e.g. "2 hours ago") */
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

/** Get initials from a name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Format a number as a percentage */
export function pct(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Truncate string with ellipsis */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/** Get color class for compliance severity */
export function severityColor(severity: string): string {
  switch (severity) {
    case 'violation': return 'text-red-400 bg-red-400/10';
    case 'warning': return 'text-amber-400 bg-amber-400/10';
    default: return 'text-electric bg-electric/10';
  }
}

/** Get color class for recruiting period type */
export function periodColor(type: string): { bg: string; text: string; border: string } {
  switch (type) {
    case 'contact': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'quiet': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'dead': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
    case 'evaluation': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
    default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' };
  }
}

/** Activity type icon & color mapping */
export function activityIcon(type: string): { icon: string; color: string } {
  switch (type) {
    case 'note': return { icon: 'note', color: 'text-blue-400' };
    case 'email': return { icon: 'email', color: 'text-violet-400' };
    case 'evaluation': return { icon: 'star', color: 'text-amber-400' };
    case 'visit': return { icon: 'visit', color: 'text-emerald-400' };
    case 'stage_change': return { icon: 'stage', color: 'text-cyan-400' };
    case 'compliance': return { icon: 'shield', color: 'text-red-400' };
    default: return { icon: 'pin', color: 'text-gray-400' };
  }
}
