'use client';

import { cn, severityColor, timeAgo } from '../lib/utils';
import type { ComplianceEvent } from '../lib/types';

interface ComplianceAlertProps {
  event: ComplianceEvent;
  compact?: boolean;
}

export default function ComplianceAlert({ event, compact }: ComplianceAlertProps) {
  return (
    <div className={cn(
      'flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:brightness-110 cursor-default group',
      severityColor(event.severity)
    )}>
      <div className="mt-0.5 shrink-0">
        {event.severity === 'violation' ? (
          <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        ) : event.severity === 'warning' ? (
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-electric/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-electric">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', compact && 'truncate')}>
          {event.title || event.type}
        </p>
        {!compact && event.details && (
          <p className="text-xs mt-1.5 opacity-60 line-clamp-2 leading-relaxed">{event.details}</p>
        )}
        <p className="text-xs mt-1 opacity-40">{timeAgo(event.createdAt)}</p>
      </div>
      {event.resolved && (
        <span className="badge-green text-[10px]">Resolved</span>
      )}
    </div>
  );
}
