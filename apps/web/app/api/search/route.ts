// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision — AI Natural Language Search API
// POST: Parse natural language queries into structured prospect filters
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { PROSPECTS } from '../../../lib/mock-data';

export const dynamic = 'force-dynamic';

interface SearchQuery {
  query: string;
}

interface ParsedFilter {
  positions?: string[];
  states?: string[];
  minGPA?: number;
  minSpeed?: number;
  minWeight?: number;
  maxWeight?: number;
  minHeight?: string;
  classYears?: number[];
  tags?: string[];
  status?: string[];
  minCommitmentScore?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchQuery = await request.json();
    const { query } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    // Parse the natural language query into filters
    const filters = parseNaturalLanguage(query.toLowerCase());

    // Apply filters to prospects
    let results = PROSPECTS.filter((p) => {
      if (filters.positions && filters.positions.length > 0) {
        if (!p.position || !filters.positions.includes(p.position.toUpperCase())) return false;
      }
      if (filters.states && filters.states.length > 0) {
        if (!p.state || !filters.states.includes(p.state.toUpperCase())) return false;
      }
      if (filters.minGPA && p.academics?.gpa) {
        if (p.academics.gpa < filters.minGPA) return false;
      }
      if (filters.minSpeed && p.stats?.fortyYard) {
        if (p.stats.fortyYard > filters.minSpeed) return false; // Lower is faster
      }
      if (filters.minWeight && p.weight) {
        if (p.weight < filters.minWeight) return false;
      }
      if (filters.maxWeight && p.weight) {
        if (p.weight > filters.maxWeight) return false;
      }
      if (filters.classYears && filters.classYears.length > 0) {
        if (!p.classYear || !filters.classYears.includes(p.classYear)) return false;
      }
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(p.status)) return false;
      }
      if (filters.minCommitmentScore && p.commitmentScore) {
        if (p.commitmentScore < filters.minCommitmentScore) return false;
      }
      return true;
    });

    // Apply sorting
    if (filters.sortBy) {
      results = results.sort((a, b) => {
        let aVal: number = 0, bVal: number = 0;
        switch (filters.sortBy) {
          case 'speed': aVal = a.stats?.fortyYard ?? 99; bVal = b.stats?.fortyYard ?? 99; break;
          case 'gpa': aVal = a.academics?.gpa ?? 0; bVal = b.academics?.gpa ?? 0; break;
          case 'commitment': aVal = a.commitmentScore ?? 0; bVal = b.commitmentScore ?? 0; break;
          case 'weight': aVal = a.weight ?? 0; bVal = b.weight ?? 0; break;
        }
        return filters.sortDir === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }

    return NextResponse.json({
      query,
      filters,
      totalResults: results.length,
      results: results.map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        position: p.position,
        state: p.state,
        highSchool: p.highSchool,
        classYear: p.classYear,
        commitmentScore: p.commitmentScore,
        gpa: p.academics?.gpa,
        fortyYard: p.stats?.fortyYard,
        status: p.status,
        stage: p.stage?.name,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process search' }, { status: 500 });
  }
}

function parseNaturalLanguage(query: string): ParsedFilter {
  const filters: ParsedFilter = {};

  // Position detection
  const positionMap: Record<string, string> = {
    quarterback: 'QB', qb: 'QB',
    'wide receiver': 'WR', wr: 'WR', receiver: 'WR', wideout: 'WR',
    'running back': 'RB', rb: 'RB', tailback: 'RB',
    'defensive end': 'DE', de: 'DE', 'edge rusher': 'DE',
    linebacker: 'LB', lb: 'LB',
    cornerback: 'CB', cb: 'CB', corner: 'CB',
    safety: 'S', s: 'S',
    'offensive lineman': 'OL', ol: 'OL', 'o-line': 'OL',
    'defensive tackle': 'DT', dt: 'DT',
    'tight end': 'TE', te: 'TE',
    kicker: 'K', punter: 'P',
  };

  for (const [keyword, pos] of Object.entries(positionMap)) {
    if (query.includes(keyword)) {
      filters.positions = filters.positions || [];
      if (!filters.positions.includes(pos)) filters.positions.push(pos);
    }
  }

  // State detection
  const stateMap: Record<string, string> = {
    georgia: 'GA', texas: 'TX', california: 'CA', florida: 'FL',
    illinois: 'IL', ohio: 'OH', tennessee: 'TN', nevada: 'NV',
    alabama: 'AL', michigan: 'MI', pennsylvania: 'PA', 'new york': 'NY',
  };

  for (const [name, abbr] of Object.entries(stateMap)) {
    if (query.includes(name)) {
      filters.states = filters.states || [];
      filters.states.push(abbr);
    }
  }

  // GPA
  const gpaMatch = query.match(/gpa\s*(?:above|over|>|>=|at least|minimum)\s*(\d+\.?\d*)/);
  if (gpaMatch) filters.minGPA = parseFloat(gpaMatch[1]);
  if (query.includes('high gpa') || query.includes('good grades') || query.includes('academic')) {
    filters.minGPA = filters.minGPA || 3.5;
  }

  // Speed (40-yard dash)
  const speedMatch = query.match(/(?:40|forty).*?(\d+\.?\d+)/);
  if (speedMatch) filters.minSpeed = parseFloat(speedMatch[1]);
  if (query.includes('fast') || query.includes('speed') || query.includes('quick')) {
    filters.minSpeed = filters.minSpeed || 4.5;
    filters.sortBy = 'speed';
    filters.sortDir = 'asc';
  }

  // Weight
  const weightMatch = query.match(/(?:over|above|at least)\s*(\d{3})\s*(?:lbs?|pounds?)/);
  if (weightMatch) filters.minWeight = parseInt(weightMatch[1]);

  // Class year
  const yearMatch = query.match(/class\s*(?:of\s*)?(\d{4})/);
  if (yearMatch) filters.classYears = [parseInt(yearMatch[1])];
  if (query.includes('2027')) filters.classYears = [2027];
  if (query.includes('2028')) filters.classYears = [2028];

  // Commitment score
  if (query.includes('high commitment') || query.includes('likely to commit') || query.includes('hot prospect')) {
    filters.minCommitmentScore = 75;
    filters.sortBy = 'commitment';
    filters.sortDir = 'desc';
  }

  // Status
  if (query.includes('committed')) filters.status = ['committed'];
  if (query.includes('active')) filters.status = ['active'];

  // Sorting
  if (query.includes('best') || query.includes('top') || query.includes('highest')) {
    if (!filters.sortBy) {
      filters.sortBy = 'commitment';
      filters.sortDir = 'desc';
    }
  }
  if (query.includes('fastest')) {
    filters.sortBy = 'speed';
    filters.sortDir = 'asc';
  }

  return filters;
}
