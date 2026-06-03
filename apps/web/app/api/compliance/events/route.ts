import { NextRequest, NextResponse } from 'next/server';
import { COMPLIANCE_EVENTS } from '../../../lib/mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
const VALIDATED_API_URL = SAFE_API ? API_URL : '';

export async function GET() {
  if (SAFE_API) {
    try {
      const res = await fetch(`${VALIDATED_API_URL}/compliance/events`);
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      // Fall through to mock data
    }
  }
  return NextResponse.json(COMPLIANCE_EVENTS);
}
