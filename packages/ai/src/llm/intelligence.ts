// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — LLM Scouting Intelligence
// AI-generated scouting reports, game summaries, player comparisons,
// team-fit recommendations, and natural-language search.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Sport,
  ScoutingReport,
  GameSummary,
  PlayerComparison,
  TeamFitRecommendation,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// LLM Client Abstraction
// ═══════════════════════════════════════════════════════════════════════════

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMClient {
  complete(prompt: string, systemPrompt?: string): Promise<string>;
  completeJSON<T>(prompt: string, systemPrompt?: string): Promise<T>;
}

/**
 * Create an LLM client. In production, this wraps OpenAI / Anthropic SDKs.
 * For local dev, returns a mock client with structured responses.
 */
export function createLLMClient(config: LLMConfig): LLMClient {
  if (config.provider === 'openai') {
    return createOpenAIClient(config);
  }
  if (config.provider === 'anthropic') {
    return createAnthropicClient(config);
  }
  return createMockClient();
}

function createOpenAIClient(config: LLMConfig): LLMClient {
  return {
    async complete(prompt, systemPrompt) {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({
        apiKey: config.apiKey ?? process.env.OPENAI_API_KEY,
        baseURL: config.baseUrl,
      });

      const response = await client.chat.completions.create({
        model: config.model ?? 'gpt-4o',
        temperature: config.temperature ?? 0.3,
        max_tokens: config.maxTokens ?? 4096,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
      });

      return response.choices[0]?.message?.content ?? '';
    },

    async completeJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
      const raw = await this.complete(
        prompt + '\n\nRespond ONLY with valid JSON. No markdown, no explanation.',
        systemPrompt,
      );

      // Extract JSON from response
      const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('LLM did not return valid JSON');
      return JSON.parse(jsonMatch[0]) as T;
    },
  };
}

function createAnthropicClient(config: LLMConfig): LLMClient {
  return {
    async complete(prompt, systemPrompt) {
      // Anthropic SDK integration
      const response = await fetch(config.baseUrl ?? 'https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey ?? process.env.ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model ?? 'claude-sonnet-4-20250514',
          max_tokens: config.maxTokens ?? 4096,
          system: systemPrompt ?? '',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json() as any;
      return data.content?.[0]?.text ?? '';
    },

    async completeJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
      const raw = await this.complete(
        prompt + '\n\nRespond ONLY with valid JSON.',
        systemPrompt,
      );
      const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('LLM did not return valid JSON');
      return JSON.parse(jsonMatch[0]) as T;
    },
  };
}

function createMockClient(): LLMClient {
  return {
    async complete(prompt) {
      return `[Mock LLM Response] Prompt received (${prompt.length} chars). Configure an API key for real responses.`;
    },
    async completeJSON<T>(): Promise<T> {
      return {} as T;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// System Prompts
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPTS = {
  scoutingReport: `You are an elite sports scout and analyst for ScoutVision, the world's most advanced multi-sport scouting platform. You write detailed, professional scouting reports that college and professional scouts rely on for recruitment decisions.

Your reports must be:
- Data-driven with specific metrics and percentiles
- Honest about strengths AND weaknesses
- Position-specific with scheme-fit analysis
- Comparable to real-world professional scouting reports
- Written in professional scouting vernacular

Always include: overall grade, position grade, ceiling/floor assessment, physical tools evaluation, technical skills breakdown, mental/intangibles assessment, development plan, and comparable players.`,

  gameSummary: `You are a sports analyst writing game summaries for ScoutVision. Your summaries distill video analysis data into actionable insights for scouts and coaches.

Focus on:
- Key performance indicators for each featured player
- Significant plays and their impact
- Tactical patterns observed
- Areas of dominance and concern
- Comparison to season/career averages`,

  playerComparison: `You are a talent evaluation specialist creating player comparisons for ScoutVision. Your comparisons must be fair, quantitative, and actionable.

Structure comparisons around:
- Physical profile overlay
- Skill-by-skill metric comparison
- Playing style differences
- Ceiling/floor comparison
- Situational advantages for each player
- Draft/recruitment implications`,

  teamFit: `You are a roster construction specialist for ScoutVision. You analyze how prospective players fit into specific team systems, schemes, and roster needs.

Consider:
- Scheme fit (does the player's skill set match the team's system?)
- Roster composition and depth chart impact
- Culture and program fit
- Development timeline alignment
- Competitive landscape at the position`,

  search: `You are the search intelligence engine for ScoutVision. Given a natural language query about athletes, translate it into structured search parameters. Extract sport, position, metrics, physical attributes, and any filtering criteria from the query.`,
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. Scouting Report Generation
// ═══════════════════════════════════════════════════════════════════════════

export interface ScoutingReportInput {
  playerName: string;
  sport: Sport;
  position: string;
  age: number;
  schoolOrTeam: string;
  physicals: {
    height: string;
    weight: string;
    wingspan?: string;
    vertical?: string;
    speed?: string;
  };
  metrics: Record<string, number>;
  highlights: Array<{ description: string; impactScore: number }>;
  biomechanicsSummary: {
    strengths: string[];
    concerns: string[];
    injuryRisk: string;
  };
  previousReports?: string[];
}

export async function generateScoutingReport(
  input: ScoutingReportInput,
  client: LLMClient,
): Promise<ScoutingReport> {
  const metricsStr = Object.entries(input.metrics)
    .map(([k, v]) => `  ${k}: ${typeof v === 'number' ? v.toFixed(2) : v}`)
    .join('\n');

  const highlightsStr = input.highlights
    .map((h) => `  - ${h.description} (impact: ${h.impactScore}/10)`)
    .join('\n');

  const prompt = `Generate a comprehensive scouting report for the following athlete:

PLAYER PROFILE:
Name: ${input.playerName}
Sport: ${input.sport}
Position: ${input.position}
Age: ${input.age}
School/Team: ${input.schoolOrTeam}
Height: ${input.physicals.height}
Weight: ${input.physicals.weight}
${input.physicals.wingspan ? `Wingspan: ${input.physicals.wingspan}` : ''}
${input.physicals.vertical ? `Vertical: ${input.physicals.vertical}` : ''}
${input.physicals.speed ? `Speed: ${input.physicals.speed}` : ''}

PERFORMANCE METRICS (from AI video analysis):
${metricsStr}

KEY HIGHLIGHTS:
${highlightsStr}

BIOMECHANICS ASSESSMENT:
Strengths: ${input.biomechanicsSummary.strengths.join(', ')}
Concerns: ${input.biomechanicsSummary.concerns.join(', ')}
Injury Risk Level: ${input.biomechanicsSummary.injuryRisk}

${input.previousReports?.length ? `PRIOR REPORTS CONTEXT:\n${input.previousReports.join('\n---\n')}` : ''}

Generate the scouting report in the following JSON structure:
{
  "overallGrade": <number 0-100>,
  "summary": "<2-3 sentence executive summary>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", ...],
  "keyMetrics": { "<metric>": { "value": <number>, "percentile": <number>, "assessment": "<string>" } },
  "projection": { "ceiling": "<comparable player>", "floor": "<comparable player>", "likelihood": "<most likely outcome>" },
  "recommendation": "<recruit/monitor/pass>",
  "detailedAnalysis": "<3-5 paragraph detailed analysis>",
  "developmentPlan": ["<recommendation 1>", "<recommendation 2>", ...]
}`;

  const report = await client.completeJSON<ScoutingReport>(prompt, SYSTEM_PROMPTS.scoutingReport);
  return {
    ...report,
    playerId: '', // caller fills this
    sport: input.sport,
    generatedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Game Summary
// ═══════════════════════════════════════════════════════════════════════════

export interface GameSummaryInput {
  sport: Sport;
  eventName: string;
  date: string;
  teams: string[];
  playerPerformances: Array<{
    name: string;
    position: string;
    metrics: Record<string, number>;
    highlights: string[];
  }>;
  playClassifications: Array<{
    playType: string;
    count: number;
    avgConfidence: number;
  }>;
  totalDurationMin: number;
}

export async function generateGameSummary(
  input: GameSummaryInput,
  client: LLMClient,
): Promise<GameSummary> {
  const playersStr = input.playerPerformances
    .map((p) => {
      const metrics = Object.entries(p.metrics).map(([k, v]) => `${k}: ${v.toFixed(2)}`).join(', ');
      return `  ${p.name} (${p.position}): ${metrics}\n    Highlights: ${p.highlights.join('; ')}`;
    })
    .join('\n');

  const playsStr = input.playClassifications
    .map((p) => `  ${p.playType}: ${p.count} instances (${(p.avgConfidence * 100).toFixed(0)}% confidence)`)
    .join('\n');

  const prompt = `Generate a game analysis summary:

EVENT: ${input.eventName}
DATE: ${input.date}
SPORT: ${input.sport}
TEAMS: ${input.teams.join(' vs ')}
DURATION: ${input.totalDurationMin} minutes

PLAYER PERFORMANCES:
${playersStr}

PLAY CLASSIFICATIONS:
${playsStr}

Generate a JSON game summary:
{
  "headline": "<catchy headline>",
  "summary": "<3-4 sentence game overview>",
  "mvp": "<best player name>",
  "keyMoments": [{ "time": "<timestamp>", "description": "<what happened>", "impact": "<why it mattered>" }],
  "topPerformers": [{ "name": "<player>", "grade": <0-100>, "standoutMetric": "<metric name>", "assessment": "<brief>" }],
  "tacticalInsights": ["<insight 1>", "<insight 2>"],
  "scoutingTakeaways": ["<takeaway 1>", "<takeaway 2>"]
}`;

  return client.completeJSON<GameSummary>(prompt, SYSTEM_PROMPTS.gameSummary);
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Player Comparison
// ═══════════════════════════════════════════════════════════════════════════

export interface PlayerComparisonInput {
  sport: Sport;
  players: Array<{
    name: string;
    position: string;
    age: number;
    physicals: Record<string, string>;
    metrics: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
  }>;
  comparisonContext?: string; // e.g. "recruiting battle for same position"
}

export async function generatePlayerComparison(
  input: PlayerComparisonInput,
  client: LLMClient,
): Promise<PlayerComparison> {
  const playersStr = input.players
    .map((p, i) => {
      const physicals = Object.entries(p.physicals).map(([k, v]) => `${k}: ${v}`).join(', ');
      const metrics = Object.entries(p.metrics).map(([k, v]) => `${k}: ${v.toFixed(2)}`).join(', ');
      return `PLAYER ${i + 1}: ${p.name}
  Position: ${p.position} | Age: ${p.age}
  Physicals: ${physicals}
  Metrics: ${metrics}
  Strengths: ${p.strengths.join(', ')}
  Weaknesses: ${p.weaknesses.join(', ')}`;
    })
    .join('\n\n');

  const prompt = `Compare the following ${input.sport} players:

${playersStr}

${input.comparisonContext ? `CONTEXT: ${input.comparisonContext}` : ''}

Generate a JSON comparison:
{
  "headline": "<comparison headline>",
  "overallEdge": "<which player has the edge and why>",
  "categories": [
    { "category": "<e.g. Athleticism>", "winner": "<player name>", "analysis": "<why>" }
  ],
  "headToHead": {
    "advantages_player1": ["<advantage>"],
    "advantages_player2": ["<advantage>"]
  },
  "projection": {
    "higherCeiling": "<player name>",
    "saferFloor": "<player name>",
    "betterFit": "<context-dependent analysis>"
  },
  "verdict": "<final assessment>"
}`;

  return client.completeJSON<PlayerComparison>(prompt, SYSTEM_PROMPTS.playerComparison);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Team-Fit Recommendation
// ═══════════════════════════════════════════════════════════════════════════

export interface TeamFitInput {
  sport: Sport;
  player: {
    name: string;
    position: string;
    metrics: Record<string, number>;
    playStyle: string;
  };
  team: {
    name: string;
    scheme: string;
    needs: string[];
    currentRoster: Array<{ position: string; starter: boolean; grade: number }>;
    culture: string;
  };
}

export async function generateTeamFitRecommendation(
  input: TeamFitInput,
  client: LLMClient,
): Promise<TeamFitRecommendation> {
  const rosterStr = input.team.currentRoster
    .map((r) => `  ${r.position}: ${r.starter ? 'Starter' : 'Backup'} (Grade: ${r.grade})`)
    .join('\n');

  const metricsStr = Object.entries(input.player.metrics)
    .map(([k, v]) => `${k}: ${v.toFixed(2)}`)
    .join(', ');

  const prompt = `Analyze how this player fits with this team:

PLAYER:
Name: ${input.player.name}
Position: ${input.player.position}
Play Style: ${input.player.playStyle}
Metrics: ${metricsStr}

TEAM:
Name: ${input.team.name}
Scheme: ${input.team.scheme}
Needs: ${input.team.needs.join(', ')}
Culture: ${input.team.culture}
Current Roster:
${rosterStr}

Generate a team-fit JSON analysis:
{
  "fitScore": <0-100>,
  "schemeFit": { "score": <0-100>, "analysis": "<why>" },
  "rosterImpact": { "immediateStarter": <boolean>, "depthChartPosition": "<position>", "analysis": "<why>" },
  "cultureFit": { "score": <0-100>, "analysis": "<why>" },
  "developmentPath": "<how the player would develop in this system>",
  "risks": ["<risk 1>"],
  "recommendation": "<strong fit / moderate fit / poor fit>",
  "verdict": "<final recommendation>"
}`;

  return client.completeJSON<TeamFitRecommendation>(prompt, SYSTEM_PROMPTS.teamFit);
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Natural Language Search
// ═══════════════════════════════════════════════════════════════════════════

export interface SearchQuery {
  raw: string;
}

export interface StructuredSearch {
  sport?: Sport;
  positions?: string[];
  metricFilters?: Array<{
    metric: string;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'between';
    value: number;
    value2?: number;
  }>;
  physicalFilters?: {
    minHeight?: number;
    maxHeight?: number;
    minWeight?: number;
    maxWeight?: number;
  };
  ageRange?: { min?: number; max?: number };
  schoolTier?: string;
  region?: string;
  keywords?: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
}

export async function parseSearchQuery(
  query: SearchQuery,
  client: LLMClient,
): Promise<StructuredSearch> {
  const prompt = `Parse this natural language search query into structured search parameters:

QUERY: "${query.raw}"

AVAILABLE SPORTS: football, basketball, soccer, baseball, track, volleyball, hockey, lacrosse, rugby, tennis

AVAILABLE METRICS (examples):
Football: burstScore, routeSeparation, timeToThrow, completionRate, yardsAfterCatch
Basketball: shotReleaseSpeed, dribbleEfficiency, closeoutSpeed, courtCoverage
Soccer: sprintAcceleration, pressingIntensity, xG, highIntensityRuns
Baseball: pitchVelocity, batSpeed, exitVelocity, launchAngle
Track: maxVelocity, strideEfficiency, accelerationPhase

Return a JSON object with these optional fields:
{
  "sport": "<sport or null>",
  "positions": ["<position1>"],
  "metricFilters": [{ "metric": "<name>", "operator": "<gt|gte|lt|lte|eq|between>", "value": <number>, "value2": <number|null> }],
  "physicalFilters": { "minHeight": <cm>, "maxHeight": <cm>, "minWeight": <kg>, "maxWeight": <kg> },
  "ageRange": { "min": <number>, "max": <number> },
  "schoolTier": "<power5|group5|fcs|D2|D3>",
  "region": "<geographic region>",
  "keywords": ["<keyword>"],
  "sortBy": "<metric to sort by>",
  "sortDirection": "<asc|desc>",
  "limit": <number>
}`;

  return client.completeJSON<StructuredSearch>(prompt, SYSTEM_PROMPTS.search);
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Batch Report Generation
// ═══════════════════════════════════════════════════════════════════════════

export interface BatchReportConfig {
  reportType: 'scouting' | 'summary' | 'comparison';
  concurrency: number;
  retryAttempts: number;
  rateLimitMs: number;
}

export async function generateBatchReports<TInput, TOutput>(
  inputs: TInput[],
  generator: (input: TInput, client: LLMClient) => Promise<TOutput>,
  client: LLMClient,
  config: Partial<BatchReportConfig> = {},
): Promise<Array<{ input: TInput; output?: TOutput; error?: string }>> {
  const { concurrency = 3, retryAttempts = 2, rateLimitMs = 500 } = config;

  const results: Array<{ input: TInput; output?: TOutput; error?: string }> = [];
  const queue = [...inputs];

  const process = async () => {
    while (queue.length > 0) {
      const input = queue.shift()!;
      let lastError: string | undefined;

      for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
          const output = await generator(input, client);
          results.push({ input, output });
          lastError = undefined;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          if (attempt < retryAttempts) {
            await new Promise((r) => setTimeout(r, rateLimitMs * (attempt + 1)));
          }
        }
      }

      if (lastError) {
        results.push({ input, error: lastError });
      }

      // Rate limiting
      await new Promise((r) => setTimeout(r, rateLimitMs));
    }
  };

  // Run with concurrency
  const workers = Array.from({ length: Math.min(concurrency, inputs.length) }, () => process());
  await Promise.all(workers);

  return results;
}
