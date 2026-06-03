// ─── Reusable State Blocks ──────────────────────────────────────────
// Shared loading, empty, and error UI components for consistent UX across pages.

'use client';

interface StateBlockProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function LoadingBlock() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-4 w-40 rounded bg-white/10 mb-3" />
      <div className="h-3 w-64 rounded bg-white/10 mb-2" />
      <div className="h-3 w-56 rounded bg-white/10" />
    </div>
  );
}

export function EmptyBlock({ title, description, actionLabel, onAction }: StateBlockProps) {
  return (
    <div className="card p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-400 mt-2">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary text-sm mt-5">{actionLabel}</button>
      )}
    </div>
  );
}

export function ErrorBlock({ title, description, actionLabel, onAction }: StateBlockProps) {
  return (
    <div className="card p-8 border border-red-500/20 bg-red-500/[0.03] text-center">
      <h3 className="text-lg font-semibold text-red-300">{title}</h3>
      <p className="text-sm text-gray-300 mt-2">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-secondary text-sm mt-5">{actionLabel}</button>
      )}
    </div>
  );
}
