'use client';

import { useState } from 'react';
import Link from 'next/link';

type ProfileTab = 'overview' | 'stats' | 'evaluations' | 'film' | 'ai' | 'communication' | 'timeline';

const PROSPECT = {
  id: 'p-001',
  firstName: 'Marcus',
  lastName: 'Williams',
  position: 'QB',
  height: '6\'3"',
  weight: 210,
  classYear: 2025,
  highSchool: 'Westlake High School',
  city: 'Austin',
  state: 'TX',
  gpa: 3.8,
  sat: 1280,
  tier: 'A',
  status: 'active' as const,
  commitmentScore: 78,
  stage: 'Official Visit',
  stageColor: '#3b82f6',
  tags: ['Elite Arm', 'Dual Threat', 'High Character', 'Captain'],
  hudlUrl: 'https://hudl.com/profile/12345',
  twitterUrl: 'https://twitter.com/mwilliams',
  fortyYard: 4.62,
  shuttle: 4.15,
  vertical: 34,
  broad: 120,
  bench: 225,
  squat: 385,
  sportMetrics: {
    completionPct: 68.4,
    touchdowns: 32,
    interceptions: 5,
    passingYards: 3450,
    rushingYards: 620,
    qbRating: 128.5,
  },
  evaluations: [
    { id: 'e1', date: '2024-01-10', author: 'Coach Rivera', overall: 88, athleticism: 85, academics: 92, character: 95, skill: 82, comment: 'Elite arm talent with strong pocket presence. Quick release and good decision-making under pressure. Needs to improve footwork on rollouts.' },
    { id: 'e2', date: '2023-11-15', author: 'Sarah Chen', overall: 84, athleticism: 83, academics: 90, character: 90, skill: 78, comment: 'Top-tier prospect for our system. Accuracy on intermediate routes is excellent. Film shows good pre-snap reads. Could be day-one contributor.' },
    { id: 'e3', date: '2023-09-22', author: 'Mike Johnson', overall: 81, athleticism: 80, academics: 88, character: 88, skill: 75, comment: 'Very coachable kid. Strong fundamentals. Arm strength adequate, ball placement above average. Footwork inconsistent under rush.' },
  ],
  notes: [
    { id: 'n1', date: '2024-01-12', author: 'Coach Rivera', content: 'Had a great phone call. Very interested in the program. Parents are supportive. Wants to visit campus in February.', pinned: true },
    { id: 'n2', date: '2024-01-05', author: 'Sarah Chen', content: 'Attended his game vs Lincoln. Threw 3 TDs, looked poised. Defense threw different looks and he adjusted well. Worth a deeper eval.', pinned: false },
    { id: 'n3', date: '2023-12-20', author: 'Mike Johnson', content: 'Film review complete. 15 clips tagged. Highlight reel sent to coaching staff. Strong intermediate passing game.', pinned: false },
  ],
  film: [
    { id: 'v1', title: 'Season Highlights 2023', type: 'Highlight', duration: '4:32', date: '2023-12-01', status: 'analyzed' },
    { id: 'v2', title: 'vs Lincoln High (Full Game)', type: 'Game Film', duration: '48:15', date: '2024-01-05', status: 'ready' },
    { id: 'v3', title: 'Training Session', type: 'Practice', duration: '12:08', date: '2024-01-08', status: 'analyzed' },
    { id: 'v4', title: 'vs Memorial (Playoffs)', type: 'Game Film', duration: '52:30', date: '2023-11-17', status: 'ready' },
  ],
  aiReport: {
    overallGrade: 86,
    recruitingPriority: 'High',
    fitScore: 91,
    strengths: ['Quick release (0.38s avg)', 'Strong pocket awareness', 'High football IQ', 'Excellent ball placement on intermediate routes', 'Dual-threat capability'],
    weaknesses: ['Footwork inconsistency on rollouts', 'Arm fatigue in 4th quarter', 'Tendency to lock onto first read under pressure'],
    projections: { ceiling: 93, floor: 72, confidence: 0.82 },
    comparisons: [
      { name: 'Player A (2021 class)', similarity: 0.87, outcome: 'Started year 2, All-Conference year 3' },
      { name: 'Player B (2020 class)', similarity: 0.79, outcome: 'Backup year 1, Transfer year 2' },
    ],
    nilEstimate: { value: 45000, tier: 'mid-tier' },
  },
  contactLog: [
    { type: 'call', direction: 'outbound', date: '2024-01-12', summary: 'Discussed visit plans', by: 'Coach Rivera' },
    { type: 'text', direction: 'outbound', date: '2024-01-10', summary: 'Follow up on film request', by: 'Sarah Chen' },
    { type: 'in-person', direction: 'inbound', date: '2024-01-05', summary: 'Met at game', by: 'Coach Rivera' },
    { type: 'call', direction: 'outbound', date: '2023-12-15', summary: 'Initial contact, expressed interest', by: 'Coach Rivera' },
    { type: 'mail', direction: 'outbound', date: '2023-11-01', summary: 'Sent recruiting questionnaire', by: 'Sarah Chen' },
  ],
};

export default function ProspectProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const p = PROSPECT;

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'stats', label: 'Stats & Metrics' },
    { key: 'evaluations', label: 'Evaluations' },
    { key: 'film', label: 'Film Room' },
    { key: 'ai', label: 'AI Insights' },
    { key: 'communication', label: 'Communication' },
    { key: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Header */}
      <div>
        <Link href="/crm" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to CRM
        </Link>

        <div className="card p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {p.firstName[0]}{p.lastName[0]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{p.firstName} {p.lastName}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300">{p.position}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  p.tier === 'A' ? 'bg-green-500/20 text-green-300' :
                  p.tier === 'B' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>Tier {p.tier}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>{p.highSchool}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span>{p.city}, {p.state}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span>Class of {p.classYear}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span>{p.height} / {p.weight} lbs</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {p.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-gray-300 border border-white/5">{tag}</span>
                ))}
              </div>
            </div>

            {/* Right side metrics */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-400">{p.commitmentScore}%</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Commit Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{p.aiReport.fitScore}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Fit Score</div>
              </div>
              <div className="text-center px-3 py-2 rounded-lg" style={{ borderLeft: `3px solid ${p.stageColor}` }}>
                <div className="text-sm font-medium text-white">{p.stage}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Pipeline Stage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-electric-400 border-electric-400'
                : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-4">
          {/* Quick Stats */}
          <div className="card p-5 col-span-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Athletics</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '40-Yard Dash', value: `${p.fortyYard}s`, grade: 'B+' },
                { label: 'Shuttle', value: `${p.shuttle}s`, grade: 'B' },
                { label: 'Vertical', value: `${p.vertical}"`, grade: 'A-' },
                { label: 'Broad Jump', value: `${p.broad}"`, grade: 'B+' },
                { label: 'Bench', value: `${p.bench} lbs`, grade: 'C+' },
                { label: 'Squat', value: `${p.squat} lbs`, grade: 'B+' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-xs text-gray-500">{stat.label}</div>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-lg font-semibold text-white">{stat.value}</span>
                    <span className="text-xs font-medium text-electric-400">{stat.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academics */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Academics</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-gray-400">GPA</span><span className="text-sm font-medium text-white">{p.gpa}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-400">SAT</span><span className="text-sm font-medium text-white">{p.sat}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-400">NCAA Eligible</span><span className="text-sm font-medium text-green-400">Yes</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-400">Core GPA</span><span className="text-sm font-medium text-white">3.6</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-400">Intended Major</span><span className="text-sm font-medium text-white">Business</span></div>
            </div>
          </div>

          {/* Recent Notes */}
          <div className="card p-5 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Notes</h3>
              <button className="text-xs text-electric-400 hover:text-electric-300">+ Add Note</button>
            </div>
            <div className="space-y-3">
              {p.notes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{note.author}</span>
                      {note.pinned && <span className="text-[10px] text-yellow-400">Pinned</span>}
                    </div>
                    <span className="text-[10px] text-gray-500">{new Date(note.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-400">{note.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Season Stats */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Season Stats</h3>
            <div className="space-y-3">
              {Object.entries(p.sportMetrics).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm text-gray-400">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  <span className="text-sm font-medium text-white">{typeof value === 'number' && value % 1 !== 0 ? (value as number).toFixed(1) : value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-white mb-4">Athletic Testing</h3>
            <div className="grid grid-cols-6 gap-4">
              {[
                { label: '40-Yard', value: p.fortyYard, unit: 's', percentile: 78, avg: 4.75 },
                { label: 'Shuttle', value: p.shuttle, unit: 's', percentile: 72, avg: 4.30 },
                { label: 'Vertical', value: p.vertical, unit: '"', percentile: 85, avg: 30 },
                { label: 'Broad Jump', value: p.broad, unit: '"', percentile: 80, avg: 114 },
                { label: 'Bench', value: p.bench, unit: ' lbs', percentile: 55, avg: 235 },
                { label: 'Squat', value: p.squat, unit: ' lbs', percentile: 75, avg: 365 },
              ].map((m) => (
                <div key={m.label} className="text-center p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                  <div className="text-xs text-gray-500 mb-2">{m.label}</div>
                  <div className="text-xl font-bold text-white">{m.value}{m.unit}</div>
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-white/5 relative">
                      <div className="h-full rounded-full bg-electric-500" style={{ width: `${m.percentile}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">{m.percentile}th percentile</div>
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">Avg: {m.avg}{m.unit}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-semibold text-white mb-4">Sport-Specific Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(p.sportMetrics).map(([key, value]) => {
                const pct = key === 'completionPct' ? (value as number) : key === 'qbRating' ? ((value as number) / 158.3 * 100) : Math.min(100, ((value as number) / 40) * 100);
                return (
                  <div key={key} className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                    <div className="text-xs text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
                    <div className="text-2xl font-bold text-white mt-1">{typeof value === 'number' && value % 1 !== 0 ? (value as number).toFixed(1) : value}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-electric-500 to-green-400" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Staff Evaluations ({p.evaluations.length})</h3>
            <button className="btn-primary text-sm">+ New Evaluation</button>
          </div>
          {p.evaluations.map((ev) => (
            <div key={ev.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center text-xs font-medium text-white">
                    {ev.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{ev.author}</div>
                    <div className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-electric-400">{ev.overall}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Overall</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Athleticism', value: ev.athleticism },
                  { label: 'Academics', value: ev.academics },
                  { label: 'Character', value: ev.character },
                  { label: 'Skill Level', value: ev.skill },
                ].map((cat) => (
                  <div key={cat.label} className="text-center p-2 rounded-lg bg-white/[0.02]">
                    <div className="text-xs text-gray-500">{cat.label}</div>
                    <div className="text-lg font-semibold text-white mt-0.5">{cat.value}</div>
                    <div className="mt-1 h-1 rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-electric-500" style={{ width: `${cat.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-400 italic">&quot;{ev.comment}&quot;</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'film' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Film Library ({p.film.length})</h3>
            <button className="btn-primary text-sm">Upload Film</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {p.film.map((video) => (
              <div key={video.id} className="card p-4 hover:border-white/10 transition-colors cursor-pointer">
                <div className="aspect-video rounded-lg bg-black/40 border border-white/5 flex items-center justify-center mb-3 relative">
                  <svg className="w-12 h-12 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">{video.duration}</span>
                  {video.status === 'analyzed' && (
                    <span className="absolute top-2 left-2 bg-electric-600/80 text-white text-[10px] px-1.5 py-0.5 rounded">AI Analyzed</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{video.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{video.type} - {new Date(video.date).toLocaleDateString()}</div>
                  </div>
                  <button className="text-xs text-electric-400 hover:text-electric-300">Analyze</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="card card-hover p-5 text-center">
              <div className="text-3xl font-bold text-electric-400">{p.aiReport.overallGrade}</div>
              <div className="text-xs text-gray-500 mt-1">AI Overall Grade</div>
            </div>
            <div className="card card-hover p-5 text-center">
              <div className="text-3xl font-bold text-green-400">{p.aiReport.fitScore}</div>
              <div className="text-xs text-gray-500 mt-1">Program Fit</div>
            </div>
            <div className="card card-hover p-5 text-center">
              <div className="text-3xl font-bold text-yellow-400">{p.aiReport.projections.ceiling}</div>
              <div className="text-xs text-gray-500 mt-1">Ceiling Projection</div>
            </div>
            <div className="card card-hover p-5 text-center">
              <div className="text-3xl font-bold text-white">${(p.aiReport.nilEstimate.value / 1000).toFixed(0)}K</div>
              <div className="text-xs text-gray-500 mt-1">NIL Estimate</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                Strengths
              </h3>
              <ul className="space-y-2">
                {p.aiReport.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                Areas for Development
              </h3>
              <ul className="space-y-2">
                {p.aiReport.weaknesses.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Player Comparisons</h3>
            <div className="space-y-3">
              {p.aiReport.comparisons.map((comp) => (
                <div key={comp.name} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white">{comp.name}</div>
                    <div className="text-xs text-gray-500">{comp.outcome}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-electric-400">{(comp.similarity * 100).toFixed(0)}%</div>
                    <div className="text-[10px] text-gray-500">Similarity</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Performance Projection</h3>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <div className="relative h-4 rounded-full bg-white/5">
                  <div className="absolute h-full rounded-full bg-gradient-to-r from-yellow-500 to-green-500" style={{ left: `${p.aiReport.projections.floor}%`, width: `${p.aiReport.projections.ceiling - p.aiReport.projections.floor}%` }} />
                  <div className="absolute w-3 h-3 rounded-full bg-white border-2 border-electric-500 -top-[2px]" style={{ left: `${p.aiReport.overallGrade}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Floor: {p.aiReport.projections.floor}</span>
                  <span>Current: {p.aiReport.overallGrade}</span>
                  <span>Ceiling: {p.aiReport.projections.ceiling}</span>
                </div>
              </div>
              <div className="text-center px-4">
                <div className="text-lg font-semibold text-white">{(p.aiReport.projections.confidence * 100).toFixed(0)}%</div>
                <div className="text-[10px] text-gray-500">Confidence</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Contact History ({p.contactLog.length})</h3>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm">Log Contact</button>
              <button className="btn-primary text-sm">Send Email</button>
            </div>
          </div>
          <div className="card p-5">
            <div className="space-y-0">
              {p.contactLog.map((log, i) => (
                <div key={i} className="flex gap-4 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      log.type === 'call' ? 'bg-blue-500/20 text-blue-400' :
                      log.type === 'text' ? 'bg-green-500/20 text-green-400' :
                      log.type === 'in-person' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {log.type === 'call' ? 'C' : log.type === 'text' ? 'T' : log.type === 'in-person' ? 'P' : 'M'}
                    </div>
                    {i < p.contactLog.length - 1 && <div className="w-px h-full bg-white/5 mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white capitalize">{log.type.replace('-', ' ')}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{log.direction}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{log.summary}</p>
                    <div className="text-xs text-gray-500 mt-1">by {log.by} - {new Date(log.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="card p-5">
          <h3 className="text-base font-semibold text-white mb-6">Recruiting Timeline</h3>
          <div className="space-y-0">
            {[
              { date: '2024-01-12', event: 'Phone Call', detail: 'Discussed visit plans with prospect and parents', type: 'contact' },
              { date: '2024-01-10', event: 'AI Analysis Complete', detail: 'Season highlights analyzed. Overall grade: 86', type: 'ai' },
              { date: '2024-01-08', event: 'Film Uploaded', detail: 'Training session film added to library', type: 'film' },
              { date: '2024-01-05', event: 'In-Person Evaluation', detail: 'Attended vs Lincoln High. 3 TDs, strong performance.', type: 'eval' },
              { date: '2024-01-02', event: 'Moved to Official Visit', detail: 'Pipeline stage updated from Campus Visit to Official Visit', type: 'stage' },
              { date: '2023-12-20', event: 'Film Review Complete', detail: '15 clips tagged from game film. Highlight reel created.', type: 'film' },
              { date: '2023-12-15', event: 'Initial Contact', detail: 'First phone call with prospect. Expressed strong interest.', type: 'contact' },
              { date: '2023-11-15', event: 'Evaluation Added', detail: 'Sarah Chen submitted evaluation. Score: 84', type: 'eval' },
              { date: '2023-11-01', event: 'Prospect Added', detail: 'Added to pipeline by Coach Rivera', type: 'stage' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    item.type === 'contact' ? 'border-blue-400 bg-blue-400/20' :
                    item.type === 'ai' ? 'border-electric-400 bg-electric-400/20' :
                    item.type === 'film' ? 'border-purple-400 bg-purple-400/20' :
                    item.type === 'eval' ? 'border-green-400 bg-green-400/20' :
                    'border-yellow-400 bg-yellow-400/20'
                  }`} />
                  {i < 8 && <div className="w-px flex-1 bg-white/5 mt-1" />}
                </div>
                <div className="flex-1 -mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{item.event}</span>
                    <span className="text-[10px] text-gray-500">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
