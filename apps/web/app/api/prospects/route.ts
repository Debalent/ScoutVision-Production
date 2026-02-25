import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET() {
  const res = await fetch(`${API_URL}/prospects`);
  const data = await res.json();
  return NextResponse.json(data);
}

// You can add POST, PATCH, DELETE handlers here to proxy to backend as needed
