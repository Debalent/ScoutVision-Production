// ─── ScoutVision Demo Evaluation Panel ──────────────────────────────
// Renders a complete sport+level-aware evaluation for a demo prospect,
// plugging into the existing sections: Measurables, Skill Grades,
// Strengths, Weaknesses, Analytics, Projection, Archetype, Red Flags, Role Fit.

'use client';

import { cn } from '../lib/utils';
import type { DemoProspect, DemoSkillGrade, DemoAnalyticValue, DemoProjection } from '../lib/demo-data';
import { numberToLetterGrade } from '../lib/demo-data';
import { useSport } from './SportContext';
import { getGradeInfo } from '../lib/level-packs';

// ─── Main Component ─────────────────────────────────────────────────

export default function DemoEvaluationPanel({ prospect }: { prospect: DemoProspect }) {
  const { sportPack, levelPack, level } = useSport();
  const ev = prospect.evaluation;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Row: Sport Badge + Level Badge + Archetype */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-electric/10 text-electric border border-electric/20">
          {sportPack.icon} {sportPack.label}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          {levelPack.label}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Archetype: {ev.archetype.label} ({(ev.archetype.confidence * 100).toFixed(0)}% match)
        </span>
      </div>

      {/* Level Evaluation Philosophy */}
      <div className="card p-4 border-l-4 border-electric">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Evaluation Philosophy — {levelPack.label}</p>
        <p className="text-sm text-gray-300">{levelPack.evaluationPhilosophy}</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 2-wide */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Measurables ────────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Measurables</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(ev.measurables).map(([key, value]) => {
                const packMeasurable = sportPack.measurables.find((m) => m.key === key);
                const label = packMeasurable?.label ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                const unit = packMeasurable?.unit ?? '';
                return (
                  <div key={key} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
                    <div className="text-lg font-semibold text-white mt-0.5">
                      {value}{typeof value === 'number' && unit ? <span className="text-xs text-gray-500 ml-0.5">{unit}</span> : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Skill Grades ───────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Skill Grades</h3>
            <div className="space-y-3">
              {ev.skillGrades.map((skill) => (
                <SkillGradeRow key={skill.key} skill={skill} />
              ))}
            </div>
          </div>

          {/* ── Strengths ──────────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              Strengths
            </h3>
            <ul className="space-y-2">
              {ev.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Weaknesses ─────────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
              Weaknesses
            </h3>
            <ul className="space-y-2">
              {ev.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Analytics ──────────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Analytics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ev.analytics.map((a) => (
                <AnalyticCard key={a.key} metric={a} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* ── Projection ─────────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Projection</h3>
            <ProjectionDisplay projection={ev.projection} level={level} />
          </div>

          {/* ── Archetype ──────────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Archetype</h3>
            <div className="bg-electric/5 border border-electric/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{sportPack.icon}</span>
                <div>
                  <p className="font-semibold text-white">{ev.archetype.label}</p>
                  <p className="text-xs text-gray-500">{(ev.archetype.confidence * 100).toFixed(0)}% match confidence</p>
                </div>
              </div>
              {(() => {
                const archDef = sportPack.archetypes.find((a) => a.key === ev.archetype.key);
                if (!archDef) return null;
                return (
                  <>
                    <p className="text-sm text-gray-400 mb-2">{archDef.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {archDef.keyTraits.map((trait) => (
                        <span key={trait} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-gray-300 border border-white/5">{trait}</span>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* ── Red Flags ──────────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" /></svg>
              Red Flags
            </h3>
            {ev.redFlags.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No significant red flags identified</p>
            ) : (
              <ul className="space-y-2">
                {ev.redFlags.map((rf, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    {rf}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Role Fit ───────────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Role Fit</h3>
            <div className="space-y-3">
              {ev.roleFit.map((rf, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{rf.role}</span>
                    <span className="text-xs font-medium text-electric">{(rf.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-gray-400">{rf.description}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-electric to-emerald-400 transition-all" style={{ width: `${rf.confidence * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Scout Notes ────────────────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Scout Notes</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{ev.scoutNotes}</p>
          </div>

          {/* ── Level-Specific Emphasis ─────────────────────────────── */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Evaluation Emphasis — {levelPack.label}
            </h3>
            <div className="space-y-2.5">
              {levelPack.primaryEmphasis.map((emp) => (
                <div key={emp.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300 font-medium">{emp.label}</span>
                    <span className="text-gray-500">{emp.weight}/10</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-purple-500/60 transition-all"
                      style={{ width: `${emp.weight * 10}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{emp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────

function SkillGradeRow({ skill }: { skill: DemoSkillGrade }) {
  const gradeColor =
    skill.grade >= 90 ? 'text-green-400' :
    skill.grade >= 80 ? 'text-blue-400' :
    skill.grade >= 70 ? 'text-amber-400' :
    skill.grade >= 60 ? 'text-orange-400' :
    'text-red-400';

  const barColor =
    skill.grade >= 90 ? 'from-green-500/60 to-green-400/40' :
    skill.grade >= 80 ? 'from-blue-500/60 to-blue-400/40' :
    skill.grade >= 70 ? 'from-amber-500/60 to-amber-400/40' :
    skill.grade >= 60 ? 'from-orange-500/60 to-orange-400/40' :
    'from-red-500/60 to-red-400/40';

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{skill.label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-bold', gradeColor)}>{skill.letterGrade}</span>
          <span className="text-xs text-gray-500 tabular-nums">{skill.grade}</span>
        </div>
      </div>
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', barColor)}
          style={{ width: `${skill.grade}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-500 mt-0.5">{skill.note}</p>
    </div>
  );
}

function AnalyticCard({ metric }: { metric: DemoAnalyticValue }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 group hover:border-electric/20 transition-colors">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{metric.label}</div>
      <div className="text-lg font-bold text-white">
        {typeof metric.value === 'number' && metric.value % 1 !== 0 ? metric.value.toFixed(1) : metric.value}
        {metric.unit && <span className="text-xs text-gray-500 ml-0.5">{metric.unit}</span>}
      </div>
      {metric.percentile != null && (
        <div className="mt-1.5">
          <div className="h-1 rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-electric/50"
              style={{ width: `${metric.percentile}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{metric.percentile}th pctile</span>
        </div>
      )}
    </div>
  );
}

function ProjectionDisplay({ projection, level }: { projection: DemoProjection; level: string }) {
  const gradeInfo = getGradeInfo(level, projection.current);
  const ceilingInfo = getGradeInfo(level, projection.ceiling);
  const floorInfo = getGradeInfo(level, projection.floor);

  const trajectoryColor =
    projection.trajectory === 'rising' ? 'text-green-400' :
    projection.trajectory === 'steady' ? 'text-blue-400' :
    'text-amber-400';

  const trajectoryIcon =
    projection.trajectory === 'rising' ? '↗' :
    projection.trajectory === 'steady' ? '→' :
    '↕';

  return (
    <div className="space-y-4">
      {/* Current Grade */}
      <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="text-3xl font-bold" style={{ color: gradeInfo.color }}>{projection.current}</div>
        <div className="text-xs text-gray-500 mt-1">{gradeInfo.label}</div>
        <div className={cn('text-xs font-medium mt-1', trajectoryColor)}>
          {trajectoryIcon} {projection.trajectory.charAt(0).toUpperCase() + projection.trajectory.slice(1)} Trajectory
        </div>
      </div>

      {/* Projection Bar */}
      <div>
        <div className="relative h-4 rounded-full bg-white/5">
          <div
            className="absolute h-full rounded-full opacity-30"
            style={{
              left: `${projection.floor}%`,
              width: `${projection.ceiling - projection.floor}%`,
              background: `linear-gradient(90deg, ${floorInfo.color}, ${ceilingInfo.color})`,
            }}
          />
          <div
            className="absolute w-3 h-3 rounded-full bg-white border-2 border-electric top-0.5"
            style={{ left: `${projection.current}%`, transform: 'translateX(-50%)' }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
          <span>Floor: <span style={{ color: floorInfo.color }}>{projection.floor}</span></span>
          <span>Current: <span className="text-white font-medium">{projection.current}</span></span>
          <span>Ceiling: <span style={{ color: ceilingInfo.color }}>{projection.ceiling}</span></span>
        </div>
      </div>

      {/* Confidence & Timeline */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <div className="text-sm font-semibold text-white">{(projection.confidence * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-gray-500">Confidence</div>
        </div>
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <div className="text-sm font-semibold text-white">{projection.timeline.split(' ').slice(0, 2).join(' ')}</div>
          <div className="text-[10px] text-gray-500">Timeline</div>
        </div>
      </div>
    </div>
  );
}
