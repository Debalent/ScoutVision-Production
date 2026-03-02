'use client';

import { PROSPECTS, NOTES, EVALUATIONS, VIDEOS, VISITS } from '../../lib/mock-data';
import { cn, getInitials, formatDate, timeAgo } from '../../lib/utils';
import Link from 'next/link';

export default function ProspectProfileClient({ params }: { params: { id: string } }) {
  const prospect = PROSPECTS.find((p) => p.id === params.id);

  if (!prospect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-2xl font-bold">Prospect Not Found</h1>
        <Link href="/crm" className="btn-primary text-sm">Back to CRM</Link>
      </div>
    );
  }

  const fullName = `${prospect.firstName} ${prospect.lastName}`;
  const notes = NOTES.filter((n) => n.prospectId === prospect.id);
  const evals = EVALUATIONS.filter((e) => e.prospectId === prospect.id);
  const videos = VIDEOS.filter((v) => v.prospectId === prospect.id);
  const visits = VISITS.filter((v) => v.prospectId === prospect.id);
  const scoreColor = (prospect.commitmentScore ?? 0) >= 75
    ? 'text-emerald-400' : (prospect.commitmentScore ?? 0) >= 50
    ? 'text-amber-400' : 'text-gray-400';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/crm" className="hover:text-electric transition-colors">Recruiting</Link>
        <span>/</span>
        <span className="text-white">{fullName}</span>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Player Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-electric/20 to-purple-500/20 flex items-center justify-center text-2xl font-bold text-electric mb-3">
                {getInitials(fullName)}
              </div>
              <h1 className="text-xl font-bold">{fullName}</h1>
              <p className="text-sm text-gray-400">{prospect.position} · Class of {prospect.classYear}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  'badge text-xs',
                  prospect.status === 'committed' ? 'bg-emerald-500/10 text-emerald-400' :
                  prospect.status === 'active' ? 'bg-electric/10 text-electric' :
                  'bg-gray-500/10 text-gray-400'
                )}>
                  {prospect.status}
                </span>
                {prospect.stage && (
                  <span className="badge text-xs" style={{ backgroundColor: `${prospect.stage.color}15`, color: prospect.stage.color }}>
                    {prospect.stage.name}
                  </span>
                )}
              </div>
            </div>

            {prospect.commitmentScore !== null && (
              <div className="text-center pt-2 border-t border-white/5">
                <p className="text-xs text-gray-500 mb-1">Commitment Probability</p>
                <span className={cn('text-3xl font-bold', scoreColor)}>{prospect.commitmentScore}%</span>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-electric to-emerald-400 transition-all duration-700"
                    style={{ width: `${prospect.commitmentScore}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-white/5 text-sm">
              <InfoRow label="School" value={prospect.highSchool} />
              <InfoRow label="Location" value={`${prospect.city}, ${prospect.state}`} />
              <InfoRow label="Height" value={prospect.height} />
              <InfoRow label="Weight" value={prospect.weight ? `${prospect.weight} lbs` : null} />
              <InfoRow label="Email" value={prospect.email} />
              <InfoRow label="Phone" value={prospect.phone} />
            </div>

            {prospect.hudlUrl && (
              <a href={prospect.hudlUrl} target="_blank" rel="noopener" className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                View on Hudl
              </a>
            )}

            {prospect.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                {prospect.tags.map((tag) => (
                  <span key={tag} className="badge-gray text-[10px]">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {prospect.academics && (
            <div className="card p-5 space-y-3">
              <h3 className="section-title text-sm">Academics</h3>
              <div className="space-y-2 text-sm">
                <InfoRow label="GPA" value={prospect.academics.gpa?.toFixed(2)} />
                <InfoRow label="Core GPA" value={prospect.academics.coreGpa?.toFixed(2)} />
                <InfoRow label="SAT" value={prospect.academics.satScore?.toString()} />
                <InfoRow label="ACT" value={prospect.academics.actScore?.toString()} />
                <InfoRow label="Grad Year" value={prospect.academics.gradYear?.toString()} />
                <InfoRow label="Major" value={prospect.academics.intendedMajor} />
                {prospect.academics.ncaaEligible !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">NCAA Eligible</span>
                    <span className={prospect.academics.ncaaEligible ? 'text-emerald-400' : 'text-red-400'}>
                      {prospect.academics.ncaaEligible ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {prospect.stats && (
            <div className="card p-5 space-y-3">
              <h3 className="section-title text-sm">Athletic Metrics</h3>
              <div className="space-y-2 text-sm">
                <InfoRow label="40-Yard" value={prospect.stats.fortyYard ? `${prospect.stats.fortyYard}s` : null} />
                <InfoRow label="Shuttle" value={prospect.stats.shuttle ? `${prospect.stats.shuttle}s` : null} />
                <InfoRow label="Vertical" value={prospect.stats.vertical ? `${prospect.stats.vertical}"` : null} />
                <InfoRow label="Broad Jump" value={prospect.stats.broad ? `${prospect.stats.broad}'` : null} />
                <InfoRow label="Bench" value={prospect.stats.bench ? `${prospect.stats.bench} lbs` : null} />
                <InfoRow label="Squat" value={prospect.stats.squat ? `${prospect.stats.squat} lbs` : null} />
              </div>
            </div>
          )}
        </div>

        {/* CENTER: Notes + Communication */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Notes & Communication</h2>
              <button className="btn-primary text-xs py-1.5">+ Add Note</button>
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Add a note about this prospect..."
                className="input min-h-[80px] resize-none text-sm"
              />
            </div>
            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No notes yet</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className={cn(
                    'rounded-xl p-4 border',
                    note.isPinned ? 'bg-electric/5 border-electric/10' : 'bg-white/[0.02] border-white/5'
                  )}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-electric/20 to-purple-500/20 flex items-center justify-center text-[9px] font-bold text-electric">
                          {note.authorName ? getInitials(note.authorName) : '?'}
                        </div>
                        <span className="text-xs font-medium">{note.authorName || 'Unknown'}</span>
                      </div>
                      <span className="text-[10px] text-gray-600">{timeAgo(note.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="section-title mb-4">Visits</h2>
            {visits.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No visits scheduled</p>
            ) : (
              <div className="space-y-2">
                {visits.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 rounded-xl p-3 bg-white/[0.02] border border-white/5">
                    <div className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      v.status === 'completed' ? 'bg-emerald-400' :
                      v.status === 'scheduled' ? 'bg-electric' : 'bg-gray-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{v.type.replace('_', ' ')} Visit</p>
                      <p className="text-xs text-gray-500">{v.location} · {formatDate(v.date)}</p>
                    </div>
                    <span className={cn(
                      'badge text-[10px]',
                      v.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      v.status === 'scheduled' ? 'bg-electric/10 text-electric' :
                      'bg-gray-500/10 text-gray-400'
                    )}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Video + Evaluation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Evaluations</h2>
              <button className="btn-secondary text-xs py-1.5">+ Rate</button>
            </div>
            {evals.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No evaluations yet</p>
            ) : (
              <div className="space-y-3">
                {evals.map((ev) => (
                  <div key={ev.id} className="rounded-xl p-4 bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">{ev.authorName || 'Unknown'}</span>
                      <span className="text-xs text-gray-600">{timeAgo(ev.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-electric">{ev.overallScore}</p>
                        <p className="text-[10px] text-gray-500">Overall</p>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {ev.athleticism && <ScoreBar label="Athleticism" value={ev.athleticism} />}
                        {ev.skillLevel && <ScoreBar label="Skill" value={ev.skillLevel} />}
                        {ev.academics && <ScoreBar label="Academics" value={ev.academics} />}
                        {ev.character && <ScoreBar label="Character" value={ev.character} />}
                      </div>
                    </div>
                    {ev.comment && (
                      <p className="text-xs text-gray-400 italic">&quot;{ev.comment}&quot;</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Film & Video</h2>
              <button className="btn-secondary text-xs py-1.5">+ Upload</button>
            </div>
            {videos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No video linked</p>
            ) : (
              <div className="space-y-3">
                {videos.map((vid) => (
                  <div key={vid.id} className="rounded-xl p-4 bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{vid.title || 'Untitled Film'}</p>
                      <span className="badge-gray text-[10px]">{vid.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {vid.duration && <span>{Math.floor(vid.duration / 60)}:{String(Math.floor(vid.duration % 60)).padStart(2, '0')}</span>}
                      <span>·</span>
                      <span>{vid.clips.length} clips</span>
                    </div>

                    {vid.clips.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        {vid.clips.map((clip) => (
                          <div key={clip.id} className="flex items-center gap-2 text-xs p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-electric shrink-0">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            <span className="flex-1 truncate">{clip.title}</span>
                            {clip.rating && (
                              <span className="text-amber-400">{'*'.repeat(clip.rating)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <a href={vid.url} target="_blank" rel="noopener" className="btn-ghost text-xs flex items-center gap-1 w-full justify-center mt-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Open in Hudl
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value || '—'}</span>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-electric/60"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <span className="text-gray-300 w-4 text-right">{value}</span>
      </div>
    </>
  );
}
