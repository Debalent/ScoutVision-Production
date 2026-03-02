import { NextRequest, NextResponse } from 'next/server';
import { COMPLIANCE_EVENTS } from '../../../lib/mock-data';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function GET() {
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/compliance/events`);
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      // Fall through to mock data
    }
  }
  return NextResponse.json(COMPLIANCE_EVENTS);
}
