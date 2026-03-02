'use client';

import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';

interface SearchResult {
  id: string;
  name: string;
  position: string | null;
  state: string | null;
  highSchool: string | null;
  classYear: number | null;
  commitmentScore: number | null;
  gpa: number | null;
  fortyYard: number | null;
  status: string;
  stage: string | null;
}

interface SearchResponse {
  query: string;
  filters: Record<string, unknown>;
  totalResults: number;
  results: SearchResult[];
}

const SUGGESTIONS = [
  'Show me the fastest wide receivers',
  'QBs from Texas with a GPA above 3.5',
  'Top prospects with high commitment scores',
  'Defensive ends over 230 lbs',
  'Class of 2027 active prospects',
  'Fast cornerbacks from the south',
];

export default function AISearchBar() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data: SearchResponse = await res.json();
      setResponse(data);
    } catch {
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 text-electric">
            <circle cx="12" cy="12" r="3" /><path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6a4 4 0 0 1 4-4z" />
            <path d="M12 19v3" /><path d="M8 22h8" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(e.target.value.length === 0); }}
            onFocus={() => { if (query.length === 0) setShowSuggestions(true); }}
            placeholder="Ask anything... e.g. 'fastest WR from Texas with 3.5+ GPA'"
            className="w-full pl-12 pr-24 py-3.5 bg-charcoal border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:border-electric/50 focus:ring-1 focus:ring-electric/20 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 px-4 py-2 bg-electric text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-electric/90 transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Suggestion chips */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-charcoal border border-white/10 rounded-xl z-50">
            <p className="text-xs text-gray-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setQuery(s); search(s); }}
                  className="text-xs px-3 py-1.5 bg-navy rounded-lg text-gray-300 hover:text-white hover:bg-electric/10 hover:border-electric/20 border border-white/5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Results */}
      {response && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Found <span className="text-white font-medium">{response.totalResults}</span> prospect{response.totalResults !== 1 ? 's' : ''}
            </p>
            {Object.keys(response.filters).length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(response.filters).map(([key, val]) => (
                  <span key={key} className="text-[10px] px-2 py-0.5 bg-electric/10 text-electric rounded-full">
                    {key}: {JSON.stringify(val)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {response.results.map((r) => (
            <div key={r.id} className="card card-hover px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-electric/10 flex items-center justify-center text-electric text-sm font-bold">
                {r.position || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{r.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {[r.highSchool, r.state, r.classYear ? `Class of ${r.classYear}` : null].filter(Boolean).join(' | ')}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {r.fortyYard && (
                  <div className="text-center">
                    <p className="text-gray-500">40yd</p>
                    <p className="text-white font-medium">{r.fortyYard}s</p>
                  </div>
                )}
                {r.gpa && (
                  <div className="text-center">
                    <p className="text-gray-500">GPA</p>
                    <p className="text-white font-medium">{r.gpa}</p>
                  </div>
                )}
                {r.commitmentScore != null && (
                  <div className="text-center">
                    <p className="text-gray-500">Score</p>
                    <p className={cn('font-medium', r.commitmentScore >= 80 ? 'text-green-400' : r.commitmentScore >= 60 ? 'text-amber-400' : 'text-gray-400')}>
                      {r.commitmentScore}
                    </p>
                  </div>
                )}
                {r.stage && (
                  <span className="px-2 py-0.5 bg-electric/10 text-electric rounded-full text-[10px]">
                    {r.stage}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
