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
    <div className="space-y-1">
      {sliced.map((item, i) => (
        <div
          key={item.id}
          className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <span className="mt-0.5 text-base leading-none">{activityIcon(item.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium text-white">{item.title}</span>
              {' '}
              <span className="text-gray-400">{item.description}</span>
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{timeAgo(item.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
