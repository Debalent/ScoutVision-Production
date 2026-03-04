'use client';

import { activityIcon, timeAgo } from '../lib/utils';
import type { ActivityItem } from '../lib/types';

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
}

export default function ActivityFeed({ items, maxItems = 10 }: ActivityFeedProps) {
  const sliced = items.slice(0, maxItems);

  return (
    <div className="space-y-0.5 stagger-children">
      {sliced.map((item, i) => (
        <div
          key={item.id}
          className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 animate-fade-in group cursor-default"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-base leading-none shrink-0 group-hover:bg-white/[0.06] transition-colors">
            {activityIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">
              <span className="font-medium text-white">{item.title}</span>
              {' '}
              <span className="text-gray-400">{item.description}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">{timeAgo(item.timestamp)}</p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all" title="View details" aria-label="View details">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
