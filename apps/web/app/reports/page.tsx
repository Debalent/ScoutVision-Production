'use client';

import { useState } from 'react';
import { PROSPECTS } from '../lib/mock-data';
import { cn, getInitials, formatDate } from '../lib/utils';

type ReportType = 'scouting' | 'comparison' | 'pipeline' | 'compliance';

interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: 'completed' | 'generating' | 'scheduled';
  createdAt: string;
  author: string;
  prospects: string[];
  pages: number;
  summary: string;
}

const MOCK_REPORTS: Report[] = [
  {
    id: 'r1',
    title: 'Class of 2027 QB Evaluation Report',
    type: 'scouting',
    status: 'completed',
    createdAt: '2026-02-28T14:00:00Z',
    author: 'Coach Rivera',
    prospects: ['Marcus Johnson'],
    pages: 12,
    summary: 'Comprehensive scouting report covering arm mechanics, decision-making, athletic testing, and film analysis. Includes AI-generated biomechanical breakdown and performance projections.',
  },
  {
    id: 'r2',
    title: 'DE/LB Position Comparison',
    type: 'comparison',
    status: 'completed',
    createdAt: '2026-02-25T09:00:00Z',
    author: 'Coach Adams',
    prospects: ['DeAndre Williams', 'Khalil Brown'],
    pages: 8,
    summary: 'Side-by-side comparison of edge rushers and linebackers in current pipeline. Includes athletic testing, film grades, academic profiles, and commitment probability analysis.',
  },
  {
    id: 'r3',
    title: 'Spring 2026 Pipeline Status',
    type: 'pipeline',
    status: 'completed',
    createdAt: '2026-02-20T11:00:00Z',
    author: 'System',
    prospects: [],
    pages: 18,
    summary: 'Full pipeline analysis with stage-by-stage conversion rates, geographic distribution, position fill progress, and predictive commitment modeling for all active prospects.',
  },
  {
    id: 'r4',
    title: 'Q1 2026 Compliance Audit',
    type: 'compliance',
    status: 'completed',
    createdAt: '2026-02-15T08:00:00Z',
    author: 'System',
    prospects: [],
    pages: 6,
    summary: 'Quarterly compliance review including contact period adherence, visit documentation, evaluation limits, and staff activity audit trail.',
  },
  {
    id: 'r5',
    title: 'Weekly Recruiting Intelligence Briefing',
    type: 'pipeline',
    status: 'generating',
    createdAt: '2026-03-02T06:00:00Z',
    author: 'AI',
    prospects: [],
    pages: 0,
    summary: 'Auto-generated weekly briefing with pipeline changes, top engagement signals, and recommended follow-ups.',
  },
];

const REPORT_TYPE_CONFIG: Record<ReportType, { label: string; color: string; bg: string }> = {
  scouting: { label: 'Scouting Report', color: 'text-electric', bg: 'bg-electric/10' },
  comparison: { label: 'Comparison', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  pipeline: { label: 'Pipeline', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  compliance: { label: 'Compliance', color: 'text-amber-400', bg: 'bg-amber-400/10' },
};

export default function ReportsPage() {
  const [activeFilter, setActiveFilter] = useState<ReportType | 'all'>('all');
  const [showGenerator, setShowGenerator] = useState(false);

  const filtered = activeFilter === 'all'
    ? MOCK_REPORTS
    : MOCK_REPORTS.filter((r) => r.type === activeFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports & Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">{MOCK_REPORTS.length} reports generated this cycle</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm">Schedule Report</button>
          <button onClick={() => setShowGenerator(true)} className="btn-primary text-sm">Generate Report</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card px-5 py-4">
          <p className="stat-label">Total Reports</p>
          <p className="stat-value">{MOCK_REPORTS.length}</p>
        </div>
        <div className="card px-5 py-4">
          <p className="stat-label">AI Generated</p>
          <p className="stat-value text-electric">3</p>
        </div>
        <div className="card px-5 py-4">
          <p className="stat-label">Scheduled</p>
          <p className="stat-value text-amber-400">2</p>
        </div>
        <div className="card px-5 py-4">
          <p className="stat-label">Total Pages</p>
          <p className="stat-value">44</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-charcoal rounded-xl p-1 w-fit">
        {(['all', 'scouting', 'comparison', 'pipeline', 'compliance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
              activeFilter === tab ? 'bg-electric/10 text-electric' : 'text-gray-400 hover:text-white'
            )}
          >
            {tab === 'all' ? 'All Reports' : tab}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filtered.map((report) => {
          const config = REPORT_TYPE_CONFIG[report.type];
          return (
            <div key={report.id} className="card p-5 hover:border-white/10 transition-all group cursor-pointer">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={config.color}>
                    {report.type === 'scouting' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></>}
                    {report.type === 'comparison' && <><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></>}
                    {report.type === 'pipeline' && <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></>}
                    {report.type === 'compliance' && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>}
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold group-hover:text-electric transition-colors">{report.title}</h3>
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', config.bg, config.color)}>
                      {config.label}
                    </span>
                    {report.status === 'generating' && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 animate-pulse">
                        Generating...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{report.summary}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-500">
                    <span>{report.author}</span>
                    <span>{formatDate(report.createdAt)}</span>
                    {report.pages > 0 && <span>{report.pages} pages</span>}
                    {report.prospects.length > 0 && (
                      <span className="flex items-center gap-1">
                        {report.prospects.map((name) => (
                          <span key={name} className="badge-gray text-[9px]">{name}</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                  {report.status === 'completed' && (
                    <>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Download PDF">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Share">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Templates */}
      <div className="card p-6">
        <h3 className="section-title mb-2">Report Templates</h3>
        <p className="text-sm text-gray-500 mb-4">Start from a pre-built template or create your own</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Full Scouting Report', desc: 'Complete prospect evaluation with film analysis, athletic testing, academics, and AI insights', type: 'scouting' as const },
            { title: 'Head-to-Head Comparison', desc: 'Side-by-side evaluation of 2-4 prospects with visual breakdowns', type: 'comparison' as const },
            { title: 'Weekly Pipeline Briefing', desc: 'Auto-generated pipeline status with changes, alerts, and recommended actions', type: 'pipeline' as const },
            { title: 'Compliance Audit Trail', desc: 'Full audit of contact activity, visit documentation, and period compliance', type: 'compliance' as const },
          ].map((template) => {
            const config = REPORT_TYPE_CONFIG[template.type];
            return (
              <button
                key={template.title}
                onClick={() => setShowGenerator(true)}
                className="text-left rounded-xl border border-white/5 p-4 hover:border-white/10 hover:bg-white/[0.02] transition-all group"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', config.bg)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={config.color}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold mb-1 group-hover:text-electric transition-colors">{template.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{template.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Generator Modal */}
      {showGenerator && (
        <ReportGenerator onClose={() => setShowGenerator(false)} />
      )}
    </div>
  );
}

// ─── Report Generator Modal ────────────────────────────────────────

function ReportGenerator({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState<ReportType>('scouting');
  const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  function toggleProspect(id: string) {
    setSelectedProspects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      onClose();
    }, 3000);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Generate Report</h3>
            <p className="text-xs text-gray-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose} title="Close" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn(
                'flex-1 h-1 rounded-full transition-all',
                s <= step ? 'bg-electric' : 'bg-white/5'
              )} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium mb-4">Select report type</p>
              {(['scouting', 'comparison', 'pipeline', 'compliance'] as const).map((type) => {
                const config = REPORT_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      reportType === type ? 'border-electric/30 bg-electric/5' : 'border-white/5 hover:border-white/10'
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bg)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={config.color}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-gray-500">Generate a {type} report</p>
                    </div>
                    {reportType === type && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-electric">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium mb-4">Select prospects to include</p>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {PROSPECTS.map((prospect) => {
                  const isSelected = selectedProspects.includes(prospect.id);
                  return (
                    <button
                      key={prospect.id}
                      onClick={() => toggleProspect(prospect.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                        isSelected ? 'border-electric/30 bg-electric/5' : 'border-white/5 hover:border-white/10'
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric/20 to-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-electric">
                        {getInitials(`${prospect.firstName} ${prospect.lastName}`)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{prospect.firstName} {prospect.lastName}</p>
                        <p className="text-xs text-gray-500">{prospect.position} - {prospect.highSchool}</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded border flex items-center justify-center transition-all',
                        isSelected ? 'border-electric bg-electric' : 'border-white/20'
                      )}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-navy">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">{selectedProspects.length} prospects selected</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-medium mb-4">Review and generate</p>
              <div className="rounded-xl border border-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Report Type</span>
                  <span className="font-medium">{REPORT_TYPE_CONFIG[reportType].label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Prospects</span>
                  <span className="font-medium">{selectedProspects.length} selected</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">AI Analysis</span>
                  <span className="font-medium text-electric">Included</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Est. Pages</span>
                  <span className="font-medium">{selectedProspects.length * 4 + 2}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-electric/5 border border-electric/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-electric shrink-0 mt-0.5">
                  <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
                  <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
                  <path d="M8.56 14h6.88" />
                </svg>
                <p className="text-xs text-gray-300">
                  AI will analyze film data, athletic metrics, academic profiles, and engagement history to generate comprehensive insights and performance projections.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="btn-secondary text-sm">Back</button>
          ) : <div />}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="btn-primary text-sm">Continue</button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={cn('btn-primary text-sm', generating && 'opacity-60 cursor-wait')}
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Generating...
                </span>
              ) : 'Generate Report'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
