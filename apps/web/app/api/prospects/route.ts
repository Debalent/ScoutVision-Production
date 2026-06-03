import { NextRequest, NextResponse } from 'next/server';
import { PROSPECTS } from '../../lib/mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Validate that API_URL points to an allowed host (CWE-918 SSRF mitigation).
 * API_URL comes from env-var, but we still verify it hasn't been misconfigured.
 */
function isSafeApiUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const allowed = (process.env.ALLOWED_API_HOST || 'localhost').split(',').map((h) => h.trim());
    return allowed.includes(parsed.hostname);
  } catch {
    return false;
  }
}

const SAFE_API = isSafeApiUrl(API_URL);
// Use only this validated reference in fetch calls
const VALIDATED_API_URL = SAFE_API ? API_URL : '';

// In-memory store for runtime additions (cleared on server restart)
const runtimeProspects: typeof PROSPECTS = [];

export async function GET() {
  // When backend is available, proxy to it
  if (SAFE_API) {
    try {
      const res = await fetch(`${VALIDATED_API_URL}/prospects`);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fall through to mock data
    }
  }
  return NextResponse.json([...PROSPECTS, ...runtimeProspects]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (SAFE_API) {
    try {
      const res = await fetch(`${VALIDATED_API_URL}/prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch {
      // Fall through to mock
    }
  }

  // Add to in-memory store
  runtimeProspects.unshift(body);
  return NextResponse.json(body, { status: 201 });
}

