import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-black leading-none mb-2" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
        <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary text-sm"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/crm"
            className="btn-secondary text-sm"
          >
            View Prospects
          </Link>
        </div>
      </div>
    </div>
  );
}
