import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-white/5 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-400 text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-electric text-navy text-sm font-semibold hover:bg-electric/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/crm"
            className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
          >
            View Prospects
          </Link>
        </div>
      </div>
    </div>
  );
}
