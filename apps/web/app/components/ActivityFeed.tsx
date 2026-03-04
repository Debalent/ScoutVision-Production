'use client';

import { activityIcon, timeAgo } from '../lib/utils';
import type { ActivityItem } from '../lib/types';

const iconPaths: Record<string, string> = {
  note: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  email: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z M22 6l-10 7L2 6',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z',
  visit: 'M3 3v18h18 M7 16l4-8 4 4 4-6',
  stage: 'M12 20V10 M18 20V4 M6 20v-4',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
};

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
}

export default function ActivityFeed({ items, maxItems = 10 }: ActivityFeedProps) {
  const sliced = items.slice(0, maxItems);

  return (
    <div className="space-y-0.5 stagger-children">
      {sliced.map((item, i) => {
        const { icon, color } = activityIcon(item.type);
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 animate-fade-in group cursor-default"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`mt-0.5 w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 group-hover:bg-white/[0.06] transition-colors ${color}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {(iconPaths[icon] ?? iconPaths.pin).split(' M').map((d, j) => (
                  <path key={j} d={j === 0 ? d : `M${d}`} />
                ))}
              </svg>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
