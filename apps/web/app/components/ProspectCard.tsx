'use client';

import { cn, getInitials } from '../lib/utils';
import type { Prospect } from '../lib/types';

interface ProspectCardProps {
  prospect: Prospect;
  compact?: boolean;
  onClick?: () => void;
}

export default function ProspectCard({ prospect, compact, onClick }: ProspectCardProps) {
  const fullName = `${prospect.firstName} ${prospect.lastName}`;
  const scoreColor = (prospect.commitmentScore ?? 0) >= 75
    ? 'text-emerald-400'
    : (prospect.commitmentScore ?? 0) >= 50
    ? 'text-amber-400'
    : 'text-gray-400';

  const scoreBg = (prospect.commitmentScore ?? 0) >= 75
    ? 'bg-emerald-500/10'
    : (prospect.commitmentScore ?? 0) >= 50
    ? 'bg-amber-500/10'
    : 'bg-white/[0.04]';

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="card-hover px-4 py-3 cursor-pointer flex items-center gap-3 group"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric/20 to-emerald-500/20 flex items-center justify-center text-xs font-bold text-electric shrink-0 ring-2 ring-white/[0.04] group-hover:ring-electric/20 transition-all">
          {getInitials(fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate group-hover:text-white transition-colors">{fullName}</p>
          <p className="text-xs text-gray-500">{prospect.position} · {prospect.highSchool}</p>
        </div>
        {prospect.commitmentScore !== null && (
          <span className={cn('text-xs font-bold px-2 py-1 rounded-lg', scoreColor, scoreBg)}>
            {prospect.commitmentScore}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="card-hover p-5 cursor-pointer space-y-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-electric/20 to-emerald-500/20 flex items-center justify-center text-sm font-bold text-electric shrink-0 ring-2 ring-white/[0.04]">
          {getInitials(fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{fullName}</p>
          <p className="text-xs text-gray-500">{prospect.position} · Class of {prospect.classYear}</p>
        </div>
        {prospect.commitmentScore !== null && (
          <div className={cn('text-right px-2.5 py-1.5 rounded-xl', scoreBg)}>
            <p className={cn('text-lg font-bold leading-none', scoreColor)}>{prospect.commitmentScore}%</p>
            <p className="text-[10px] text-gray-500 mt-0.5">commit</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-white/[0.02] rounded-xl p-3">
        <div className="text-gray-500 font-medium">School</div>
        <div className="text-right truncate text-gray-300">{prospect.highSchool || '—'}</div>
        <div className="text-gray-500 font-medium">Location</div>
        <div className="text-right truncate text-gray-300">{prospect.city}, {prospect.state}</div>
        {prospect.academics?.gpa && (
          <>
            <div className="text-gray-500 font-medium">GPA</div>
            <div className="text-right text-gray-300">{prospect.academics.gpa.toFixed(2)}</div>
          </>
        )}
        {prospect.stats?.fortyYard && (
          <>
            <div className="text-gray-500 font-medium">40-Yard</div>
            <div className="text-right text-gray-300">{prospect.stats.fortyYard}s</div>
          </>
        )}
      </div>

      {/* Tags */}
      {prospect.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prospect.tags.map((tag) => (
            <span key={tag} className="badge-gray text-[10px]">{tag}</span>
          ))}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
        <span className={cn(
          'badge text-[10px]',
          prospect.status === 'committed' ? 'bg-emerald-500/10 text-emerald-400' :
          prospect.status === 'active' ? 'bg-electric/10 text-electric' :
          'bg-gray-500/10 text-gray-400'
        )}>
          {prospect.status}
        </span>
        <span className="text-[10px] text-gray-600">
          {prospect.height} · {prospect.weight} lbs
        </span>
      </div>
    </div>
  );
}
