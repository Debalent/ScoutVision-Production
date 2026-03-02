import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Rate Limiting (in-memory for demo; use Redis in production) ────

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// ─── Middleware ──────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Security Headers ---
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // --- Rate Limiting for API routes ---
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // CORS for API routes
    response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  // --- Auth check for protected routes ---
  const protectedPaths = ['/settings', '/reports', '/compare'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const sessionToken = request.cookies.get('session_token')?.value;

    // In production, validate session against database/JWT
    // For now, allow access (demo mode)
    if (!sessionToken && process.env.NODE_ENV === 'production' && process.env.ENFORCE_AUTH === 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // --- Request ID for tracing ---
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
