'use client';

import { useState } from 'react';
import { COMPLIANCE_EVENTS, RECRUITING_PERIODS, VISITS, PROSPECTS } from '../lib/mock-data';
import ComplianceAlert from '../components/ComplianceAlert';
import { cn, formatDate, periodColor } from '../lib/utils';
import type { RecruitingPeriodType } from '../lib/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'alerts' | 'contacts'>('calendar');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const alerts = filterSeverity === 'all'
    ? COMPLIANCE_EVENTS
    : COMPLIANCE_EVENTS.filter((e) => e.severity === filterSeverity);

  const unresolvedCount = COMPLIANCE_EVENTS.filter((e) => !e.resolved).length;
  const warningCount = COMPLIANCE_EVENTS.filter((e) => e.severity === 'warning').length;
  const violationCount = COMPLIANCE_EVENTS.filter((e) => e.severity === 'violation').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Compliance Center</h1>
          <p className="text-sm text-gray-500 mt-1">NCAA recruiting period management & compliance tracking</p>
        </div>
        <button className="btn-primary text-sm">+ Log Event</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card card-hover px-5 py-4">
          <p className="stat-label">Active Alerts</p>
          <p className="stat-value text-amber-400">{unresolvedCount}</p>
        </div>
        <div className="card card-hover px-5 py-4">
          <p className="stat-label">Warnings</p>
          <p className="stat-value text-amber-400">{warningCount}</p>
        </div>
        <div className="card card-hover px-5 py-4">
          <p className="stat-label">Violations</p>
          <p className="stat-value text-red-400">{violationCount}</p>
        </div>
        <div className="card card-hover px-5 py-4">
          <p className="stat-label">Current Period</p>
          <p className="stat-value text-emerald-400 text-xl">Contact</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-charcoal rounded-xl p-1 w-fit">
        {(['calendar', 'alerts', 'contacts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
              activeTab === tab ? 'bg-electric/10 text-electric' : 'text-gray-400 hover:text-white'
            )}
          >
            {tab}
            {tab === 'alerts' && unresolvedCount > 0 && (
              <span className="ml-2 bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full">
                {unresolvedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'alerts' && (
        <AlertsView alerts={alerts} filterSeverity={filterSeverity} onFilterChange={setFilterSeverity} />
      )}
      {activeTab === 'contacts' && <ContactLogView />}
    </div>
  );
}

// ─── Calendar View ──────────────────────────────────────────────────

function CalendarView() {
  const year = 2026;

  return (
    <div className="space-y-6">
      {/* Recruiting Period Timeline */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Recruiting Calendar — {year}</h2>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          {(['contact', 'quiet', 'dead', 'evaluation'] as RecruitingPeriodType[]).map((type) => {
            const colors = periodColor(type);
            return (
              <div key={type} className="flex items-center gap-2 text-xs">
                <span className={cn('w-3 h-3 rounded-sm', colors.bg, 'border', colors.border)} />
                <span className={cn('capitalize font-medium', colors.text)}>{type}</span>
              </div>
            );
          })}
        </div>

        {/* Timeline Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month Headers */}
            <div className="grid grid-cols-12 gap-px mb-2">
              {MONTHS.map((m) => (
                <div key={m} className="text-center text-xs text-gray-500 font-medium py-1">
                  {m}
                </div>
              ))}
            </div>

            {/* Period Bars */}
            <div className="relative h-24 border border-white/5 rounded-xl overflow-hidden">
              {/* Month grid lines */}
              <div className="absolute inset-0 grid grid-cols-12">
                {MONTHS.map((_, i) => (
                  <div key={i} className={cn('border-r border-white/5', i === 0 && 'border-l')} />
                ))}
              </div>

              {/* Today marker */}
              <div
                className="absolute top-0 bottom-0 w-px bg-electric z-10"
                style={{ left: `${((new Date().getMonth() * 30 + new Date().getDate()) / 365) * 100}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-electric" />
              </div>

              {/* Period Bars */}
              {RECRUITING_PERIODS.map((period) => {
                const start = new Date(period.startDate);
                const end = new Date(period.endDate);
                const startDay = Math.floor((start.getMonth() * 30.44 + start.getDate()));
                const endDay = Math.floor((end.getMonth() * 30.44 + end.getDate()));
                const left = (startDay / 365) * 100;
                const width = ((endDay - startDay) / 365) * 100;
                const colors = periodColor(period.type);

                return (
                  <div
                    key={period.id}
                    className={cn(
                      'absolute h-8 rounded-md flex items-center px-2 text-[10px] font-medium border',
                      colors.bg, colors.text, colors.border
                    )}
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(width, 2)}%`,
                      top: period.type === 'contact' ? '8px' :
                           period.type === 'quiet' ? '28px' :
                           period.type === 'dead' ? '48px' : '68px',
                    }}
                    title={period.description || period.type}
                  >
                    <span className="truncate">{period.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Dead Periods Warning */}
      <div className="card p-5 border-red-500/10">
        <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Dead Period Alerts
        </h3>
        <div className="space-y-2">
          {RECRUITING_PERIODS.filter((p) => p.type === 'dead').map((period) => (
            <div key={period.id} className="flex items-center justify-between text-sm rounded-lg p-3 bg-red-500/5 border border-red-500/10">
              <span className="text-gray-300">{period.description}</span>
              <span className="text-red-400 font-medium">
                {formatDate(period.startDate)} — {formatDate(period.endDate)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Visits */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Scheduled Visits</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="table-header">Prospect</th>
                <th className="table-header">Type</th>
                <th className="table-header">Date</th>
                <th className="table-header">Location</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {VISITS.map((visit) => {
                const prospect = PROSPECTS.find((p) => p.id === visit.prospectId);
                return (
                  <tr key={visit.id} className="table-row">
                    <td className="table-cell font-medium">
                      {prospect ? `${prospect.firstName} ${prospect.lastName}` : 'Unknown'}
                    </td>
                    <td className="table-cell capitalize text-gray-400">{visit.type.replace('_', ' ')}</td>
                    <td className="table-cell text-gray-400">{formatDate(visit.date)}</td>
                    <td className="table-cell text-gray-400">{visit.location || '—'}</td>
                    <td className="table-cell">
                      <span className={cn(
                        'badge text-[10px]',
                        visit.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        visit.status === 'scheduled' ? 'bg-electric/10 text-electric' :
                        visit.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                        'bg-gray-500/10 text-gray-400'
                      )}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Alerts View ────────────────────────────────────────────────────

function AlertsView({
  alerts,
  filterSeverity,
  onFilterChange,
}: {
  alerts: typeof COMPLIANCE_EVENTS;
  filterSeverity: string;
  onFilterChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        {['all', 'info', 'warning', 'violation'].map((sev) => (
          <button
            key={sev}
            onClick={() => onFilterChange(sev)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
              filterSeverity === sev ? 'bg-electric/10 text-electric' : 'text-gray-400 hover:text-white bg-white/5'
            )}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Events */}
      <div className="space-y-2">
        {alerts.map((event) => (
          <ComplianceAlert key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

// ─── Contact Log View ───────────────────────────────────────────────

function ContactLogView() {
  const contactEntries = [
    { id: 'cl1', prospect: 'Marcus Johnson', type: 'Call', date: '2026-02-28', staff: 'Coach Rivera', notes: 'Discussed visit plans for March', duration: '12 min' },
    { id: 'cl2', prospect: 'Jaylen Carter', type: 'Email', date: '2026-02-27', staff: 'Coach Rivera', notes: 'Follow-up on campus tour interest', duration: '—' },
    { id: 'cl3', prospect: 'DeAndre Williams', type: 'In-Person', date: '2026-02-25', staff: 'Coach Adams', notes: 'High school visit — great interaction', duration: '45 min' },
    { id: 'cl4', prospect: 'Isaiah Thompson', type: 'Text', date: '2026-02-24', staff: 'Coach Adams', notes: 'Sent game day invite', duration: '—' },
    { id: 'cl5', prospect: 'Cameron Lee', type: 'Call', date: '2026-02-23', staff: 'Coach Rivera', notes: 'Academic requirements discussion', duration: '8 min' },
    { id: 'cl6', prospect: 'Jaylen Carter', type: 'Social', date: '2026-02-22', staff: 'Coach Rivera', notes: 'DM on Twitter re: unofficial visit', duration: '—' },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="table-header">Prospect</th>
              <th className="table-header">Type</th>
              <th className="table-header">Date</th>
              <th className="table-header">Staff</th>
              <th className="table-header">Notes</th>
              <th className="table-header">Duration</th>
            </tr>
          </thead>
          <tbody>
            {contactEntries.map((c) => (
              <tr key={c.id} className="table-row">
                <td className="table-cell font-medium">{c.prospect}</td>
                <td className="table-cell">
                  <span className="badge-gray text-[10px]">{c.type}</span>
                </td>
                <td className="table-cell text-gray-400">{formatDate(c.date)}</td>
                <td className="table-cell text-gray-400">{c.staff}</td>
                <td className="table-cell text-gray-400 max-w-[200px] truncate">{c.notes}</td>
                <td className="table-cell text-gray-500">{c.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
