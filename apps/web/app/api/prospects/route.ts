import { NextRequest, NextResponse } from 'next/server';
import { PROSPECTS } from '../../lib/mock-data';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function GET() {
  // When backend is available, proxy to it
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/prospects`);
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      // Fall through to mock data
    }
  }
  return NextResponse.json(PROSPECTS);
}
