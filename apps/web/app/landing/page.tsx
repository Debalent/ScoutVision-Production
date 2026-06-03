// ─── ScoutVision Landing Page ───────────────────────────────────────
// Buyer-facing marketing page for demos, due diligence, and acquisition review.

import Link from 'next/link';

const FEATURES = [
  { icon: '📊', title: 'Recruiting CRM', desc: 'Track prospects, stages, notes, and communications in one workflow.' },
  { icon: '🎥', title: 'Video Analysis', desc: 'Upload film, run AI analysis, and turn clips into recruiting evidence.' },
  { icon: '🛡️', title: 'Compliance Tracking', desc: 'Monitor contact windows, risk events, and audit-ready compliance logs.' },
  { icon: '🧠', title: 'AI Reports', desc: 'Generate structured scouting reports and comparison-ready summaries.' },
  { icon: '📈', title: 'Pipeline Analytics', desc: 'Understand conversion rates, regional trends, and class-year distribution.' },
  { icon: '🏟️', title: 'Multi-Sport Ready', desc: 'Designed for football, basketball, baseball, soccer, and hockey workflows.' },
];

const SCREENSHOTS = [
  { title: 'Pipeline Dashboard', caption: 'Executive snapshot of stage velocity, activity feed, and top targets.' },
  { title: 'Prospect CRM Board', caption: 'Drag-and-drop recruiting board with enriched athlete profiles.' },
  { title: 'Compliance Center', caption: 'Live alerts, event logs, and policy-aware recruiting oversight.' },
  { title: 'Analytics View', caption: 'Market-level recruiting intelligence and conversion tracking.' },
];

const STEPS = [
  'Import or create prospects and assign stage + tags.',
  'Capture film, evaluations, and communication history.',
  'Run AI analysis and generate scouting reports.',
  'Move prospects through the board with compliance guardrails.',
  'Export reports and decisions for staff and leadership review.',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.08),transparent_30%),#0B1120] text-white">
      <div className="max-w-6xl mx-auto px-6 py-14 sm:py-20 space-y-24">
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 mb-4">Acquire-Ready Recruiting Platform</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">ScoutVision turns recruiting chaos into an actionable pipeline.</h1>
            <p className="mt-5 text-gray-300 max-w-xl">
              A polished multi-sport recruiting operating system with CRM, compliance, AI analysis, and executive dashboards.
              Built to be demo-ready now and extensible for production-scale operations later.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="btn-primary">Live Demo</Link>
              <a href="https://github.com/Debalent/ScoutVision-Production" target="_blank" rel="noopener noreferrer" className="btn-secondary">View GitHub</a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
            <p className="text-sm text-gray-300 mb-4">How ScoutVision fits into a modern recruiting operation</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3"><span>Prospect Sources</span><span className="text-electric">Input</span></div>
              <div className="text-center text-gray-500">↓</div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3"><span>ScoutVision Platform</span><span className="text-emerald-300">Processing</span></div>
              <div className="text-center text-gray-500">↓</div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3"><span>Staff Decisions</span><span className="text-sky-300">Output</span></div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <article key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-2xl mb-3">{f.icon}</p>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-gray-400 mt-2">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Screenshots</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {SCREENSHOTS.map((s) => (
              <figure key={s.title} className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.03]">
                <div className="h-52 bg-[linear-gradient(145deg,rgba(34,197,94,0.14),rgba(2,132,199,0.10))] flex items-center justify-center text-sm text-gray-200">
                  Screenshot Placeholder: {s.title}
                </div>
                <figcaption className="p-4">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <ol className="space-y-4">
              {STEPS.map((step, idx) => (
                <li key={step} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Step {idx + 1}</p>
                  <p className="mt-1">{step}</p>
                </li>
              ))}
            </ol>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-gray-300 mb-4">Workflow Diagram</p>
              <div className="space-y-3 text-center text-sm">
                <div className="rounded-lg border border-white/10 py-2">Recruiting Inputs</div>
                <div className="text-gray-500">↓</div>
                <div className="rounded-lg border border-white/10 py-2">ScoutVision CRM + AI + Compliance</div>
                <div className="text-gray-500">↓</div>
                <div className="rounded-lg border border-white/10 py-2">Reports + Decisions + Outreach</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Roadmap</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-300">
              <p><span className="text-emerald-300 font-semibold">Short-term:</span> production auth hardening, deployment automation, billing instrumentation.</p>
              <p><span className="text-sky-300 font-semibold">Long-term:</span> AI-assisted board recommendations, workflow automation, and partner integrations.</p>
              <p className="inline-flex text-xs rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-amber-300">Backend deployment coming soon</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">About ScoutVision</h2>
            <p className="text-sm text-gray-300 mt-3">ScoutVision helps recruiting staffs evaluate prospects faster, collaborate better, and reduce decision risk with structured data and AI support.</p>
            <p className="text-sm text-gray-300 mt-3">Built for collegiate and competitive programs that need a practical operating system instead of fragmented spreadsheets and disconnected tools.</p>
            <p className="text-sm text-gray-300 mt-3">Created to make recruitment measurable, repeatable, and investor-presentable.</p>
          </div>
        </section>

        <footer className="border-t border-white/10 pt-8 text-sm text-gray-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p>© {new Date().getFullYear()} ScoutVision</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Debalent/ScoutVision-Production" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
            <a href="mailto:founder@scoutvision.io" className="hover:text-white">founder@scoutvision.io</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
