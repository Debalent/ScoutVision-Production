import { NextRequest, NextResponse } from 'next/server';
import { PROSPECTS } from '../../lib/mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// In-memory store for runtime additions (cleared on server restart)
const runtimeProspects: typeof PROSPECTS = [];

export async function GET() {
  // When backend is available, proxy to it
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/prospects`);
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

  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/prospects`, {
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

