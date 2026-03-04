'use client';

import { useState } from 'react';
import { VIDEOS, PROSPECTS } from '../lib/mock-data';
import { cn, formatDate, timeAgo } from '../lib/utils';

type VideoTab = 'library' | 'clips' | 'upload';

export default function VideoPage() {
  const [activeTab, setActiveTab] = useState<VideoTab>('library');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Video Scouting</h1>
          <p className="text-sm text-gray-500 mt-1">Film review, AI tagging, and shareable cutups</p>
        </div>
        <button
          onClick={() => setActiveTab('upload')}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Film
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card px-5 py-4">
          <p className="stat-label">Total Films</p>
          <p className="stat-value">{VIDEOS.length}</p>
        </div>
        <div className="card px-5 py-4">
          <p className="stat-label">Total Clips</p>
          <p className="stat-value">{VIDEOS.reduce((s, v) => s + (v.clips?.length ?? 0), 0)}</p>
        </div>
        <div className="card px-5 py-4">
          <p className="stat-label">AI Tagged</p>
          <p className="stat-value text-electric">{VIDEOS.filter((v) => v.aiTags && v.aiTags.length > 0).length}</p>
        </div>
        <div className="card px-5 py-4">
          <p className="stat-label">Pending Review</p>
          <p className="stat-value text-amber-400">{VIDEOS.filter((v) => v.status === 'processing').length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-charcoal rounded-xl p-1 w-fit">
        {(['library', 'clips', 'upload'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
              activeTab === tab ? 'bg-electric/10 text-electric' : 'text-gray-400 hover:text-white'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'library' && <VideoLibrary search={search} setSearch={setSearch} />}
      {activeTab === 'clips' && <ClipsView />}
      {activeTab === 'upload' && <UploadView onBack={() => setActiveTab('library')} />}
    </div>
  );
}

// ─── Video Library ──────────────────────────────────────────────────

function VideoLibrary({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const filteredVideos = VIDEOS.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const prospect = PROSPECTS.find((p) => p.id === v.prospectId);
    return (
      (v.title ?? '').toLowerCase().includes(q) ||
      (prospect && `${prospect.firstName} ${prospect.lastName}`.toLowerCase().includes(q)) ||
      v.aiTags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search films, players, or AI tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredVideos.map((video) => {
          const prospect = PROSPECTS.find((p) => p.id === video.prospectId);
          return (
            <div key={video.id} className="card card-hover p-0 overflow-hidden">
              {/* Video Thumbnail */}
              <div className="relative h-48 bg-navy/80 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-transparent z-10" />
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {/* Play overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-electric/20 backdrop-blur-md flex items-center justify-center border border-electric/30">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-electric ml-1">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-20">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-md font-medium',
                    video.status === 'analyzed' ? 'bg-emerald-500/20 text-emerald-400' :
                    video.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  )}>
                    {video.status === 'analyzed' ? 'AI Analyzed' : video.status === 'processing' ? 'Processing' : 'Uploaded'}
                  </span>
                </div>
                {/* Duration */}
                {video.duration && (
                  <div className="absolute bottom-3 right-3 z-20">
                    <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-sm">{video.title}</h4>
                  {prospect && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {prospect.firstName} {prospect.lastName} · {prospect.position}
                    </p>
                  )}
                </div>

                {/* AI Tags */}
                {video.aiTags && video.aiTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {video.aiTags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-electric/10 text-electric border border-electric/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Metrics */}
                {video.aiMetrics && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    {Object.entries(video.aiMetrics).map(([key, val]) => (
                      <div key={key} className="rounded-lg bg-white/[0.03] py-1.5">
                        <p className="text-[10px] text-gray-500 uppercase">{key.replace(/_/g, ' ')}</p>
                        <p className="text-sm font-bold text-electric">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Clips & Source */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-gray-500">
                    {video.clips?.length ?? 0} clips · {timeAgo(video.createdAt)}
                  </span>
                  {video.sourceUrl && (
                    <a
                      href={video.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-electric hover:underline flex items-center gap-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Hudl
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Clips View ─────────────────────────────────────────────────────

function ClipsView() {
  const allClips = VIDEOS.flatMap((v) =>
    (v.clips ?? []).map((clip) => ({
      ...clip,
      videoTitle: v.title,
      prospectId: v.prospectId,
    }))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title">All Clips ({allClips.length})</h3>
        <button className="btn-secondary text-sm">Create Cutup</button>
      </div>

      {allClips.length === 0 ? (
        <div className="card p-12 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 mx-auto mb-3">
            <rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 8 6 4-6 4Z" />
          </svg>
          <p className="text-gray-400">No clips created yet</p>
          <p className="text-xs text-gray-600 mt-1">Upload film and create clips to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allClips.map((clip) => {
            const prospect = PROSPECTS.find((p) => p.id === clip.prospectId);
            return (
              <div key={clip.id} className="card card-hover p-4 space-y-3">
                {/* Clip Thumbnail */}
                <div className="h-32 bg-navy/60 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                    {clip.startTime}s–{clip.endTime}s
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold">{clip.label}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    From: {clip.videoTitle}
                    {prospect && ` · ${prospect.firstName} ${prospect.lastName}`}
                  </p>
                </div>

                {/* Rating */}
                {clip.rating !== undefined && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={star <= clip.rating! ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        className={star <= clip.rating! ? 'text-amber-400' : 'text-gray-600'}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                )}

                {/* Shareable Link */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] text-gray-600">Token: {clip.shareToken.slice(0, 12)}…</span>
                  <button className="text-xs text-electric hover:underline flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Upload View ────────────────────────────────────────────────────

function UploadView({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Library
      </button>

      <div className="card p-8 text-center">
        <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 hover:border-electric/30 transition-colors cursor-pointer">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 mx-auto mb-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Drop film here or click to browse</h3>
          <p className="text-sm text-gray-500">MP4, MOV, or paste a Hudl/YouTube URL</p>
          <p className="text-xs text-gray-600 mt-1">Max 2GB per file · AI analysis runs automatically</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="section-title">Upload Details</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Title</label>
            <input type="text" placeholder="e.g., Junior Season Highlights" className="input" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Link Prospect</label>
            <select className="input">
              <option value="">Select prospect...</option>
              {PROSPECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} — {p.position}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Or Paste URL</label>
            <input type="url" placeholder="https://hudl.com/..." className="input" />
          </div>
        </div>
        <button className="btn-primary w-full mt-2">Start Upload & AI Analysis</button>
      </div>

      {/* Feature Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            icon: '🤖',
            title: 'AI Tagging',
            desc: 'Auto-detected plays, formations, and metrics',
          },
          {
            icon: '✂️',
            title: 'Smart Clips',
            desc: 'Create and share clips with one click',
          },
          {
            icon: '📊',
            title: 'Performance',
            desc: 'Speed, agility, and technique scored automatically',
          },
        ].map((f) => (
          <div key={f.title} className="card p-4 text-center">
            <span className="text-2xl">{f.icon}</span>
            <h4 className="text-sm font-semibold mt-2">{f.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
