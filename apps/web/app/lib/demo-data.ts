// ─── ScoutVision Demo Data ──────────────────────────────────────────
// Pre-populated demo prospects for each sport, used in Demo Mode.
// Each demo prospect includes sport-specific measurables, analytics,
// skill grades, strengths, weaknesses, projections, archetypes, red flags, and role fit.

import type { SportKey } from './sport-packs';

// ─── Types ──────────────────────────────────────────────────────────

export interface DemoSkillGrade {
  key: string;
  label: string;
  grade: number;      // 1-100
  letterGrade: string; // A+, A, A-, B+, etc.
  note: string;
}

export interface DemoAnalyticValue {
  key: string;
  label: string;
  value: number;
  unit: string;
  percentile?: number;
}

export interface DemoProjection {
  ceiling: number;
  floor: number;
  current: number;
  confidence: number;
  timeline: string;
  trajectory: 'rising' | 'steady' | 'volatile';
}

export interface DemoEvaluation {
  measurables: Record<string, number | string>;
  skillGrades: DemoSkillGrade[];
  strengths: string[];
  weaknesses: string[];
  analytics: DemoAnalyticValue[];
  projection: DemoProjection;
  archetype: { key: string; label: string; confidence: number };
  redFlags: string[];
  roleFit: { role: string; confidence: number; description: string }[];
  scoutNotes: string;
}

export interface DemoProspect {
  id: string;
  sport: SportKey;
  level: string;
  firstName: string;
  lastName: string;
  position: string;
  bio: string;
  classYear: number;
  school: string;
  city: string;
  state: string;
  evaluation: DemoEvaluation;
}

// ─── Letter Grade Util ──────────────────────────────────────────────

export function numberToLetterGrade(n: number): string {
  if (n >= 97) return 'A+';
  if (n >= 93) return 'A';
  if (n >= 90) return 'A-';
  if (n >= 87) return 'B+';
  if (n >= 83) return 'B';
  if (n >= 80) return 'B-';
  if (n >= 77) return 'C+';
  if (n >= 73) return 'C';
  if (n >= 70) return 'C-';
  if (n >= 67) return 'D+';
  if (n >= 60) return 'D';
  return 'F';
}

// ─── Football Demo Prospects ────────────────────────────────────────

const FOOTBALL_DEMOS: DemoProspect[] = [
  {
    id: 'demo-fb-1',
    sport: 'football',
    level: 'high_school',
    firstName: 'Marcus',
    lastName: 'Johnson',
    position: 'QB',
    bio: 'Elite dual-threat QB with exceptional pocket awareness and developing arm talent.',
    classYear: 2027,
    school: 'Lincoln Prep',
    city: 'Atlanta',
    state: 'GA',
    evaluation: {
      measurables: { height: '6\'2"', weight: 205, armLength: 32.5, fortyYard: 4.55, shuttle: 4.12, threeCone: 7.02, vertical: 34, broad: 118 },
      skillGrades: [
        { key: 'processing', label: 'Processing Speed', grade: 88, letterGrade: 'A', note: 'Reads progressions quickly, strong pre-snap work' },
        { key: 'release', label: 'Release Package', grade: 78, letterGrade: 'C+', note: 'Quick release, needs more velocity on deep outs' },
        { key: 'footballIQ', label: 'Football IQ', grade: 92, letterGrade: 'A', note: 'Film junkie, sees the field like a coach' },
        { key: 'hips', label: 'Hip Fluidity', grade: 82, letterGrade: 'B', note: 'Smooth mover in pocket, athletic scrambler' },
        { key: 'ballSkills', label: 'Ball Placement', grade: 85, letterGrade: 'B+', note: 'Accurate on intermediate routes, developing deep ball' },
        { key: 'tackling', label: 'Toughness', grade: 80, letterGrade: 'B-', note: 'Willing to take a hit, slides when needed' },
      ],
      strengths: [
        'Elite processing speed — reads full-field progressions pre-snap',
        'Strong pocket presence with natural feel for pressure',
        'Dual-threat mobility: 620 rushing yards, 4.55 forty',
        'High football IQ — self-scout mentality, film-obsessed',
        'Accurate on intermediate routes (68.4% completion)',
      ],
      weaknesses: [
        'Arm strength adequate but not elite — struggles on deep outs in wind',
        'Footwork breaks down under duress on 3rd and long',
        'Tendency to lock onto first read when blitzed',
        'Needs 15-20 lbs of good weight for next level',
      ],
      analytics: [
        { key: 'epa', label: 'EPA/Play', value: 0.32, unit: '', percentile: 88 },
        { key: 'completionPctOverExpected', label: 'CPOE', value: 4.2, unit: '%', percentile: 82 },
        { key: 'pressurePct', label: 'Pressure Rate', value: 28.5, unit: '%', percentile: 65 },
        { key: 'yac', label: 'YAC/Completion', value: 5.8, unit: 'yds', percentile: 72 },
      ],
      projection: { ceiling: 93, floor: 72, current: 84, confidence: 0.78, timeline: '3-year development arc', trajectory: 'rising' },
      archetype: { key: 'dualThreatQB', label: 'Dual-Threat QB', confidence: 0.87 },
      redFlags: ['Needs strength development', 'Limited experience against elite competition'],
      roleFit: [
        { role: 'Day-one competitor for starting job', confidence: 0.72, description: 'Athletic enough to compete early but needs S&C development' },
        { role: 'Year-2 projected starter', confidence: 0.88, description: 'With development, projects as multi-year starter by sophomore year' },
      ],
      scoutNotes: 'Top target at QB. Elite processing speed and leadership traits set him apart. Arm talent is good, not elite — but accuracy and decision-making compensate. Will benefit significantly from college S&C program. High character, team captain, film junkie. Family engaged and supportive.',
    },
  },
  {
    id: 'demo-fb-2',
    sport: 'football',
    level: 'high_school',
    firstName: 'Jaylen',
    lastName: 'Carter',
    position: 'WR',
    bio: 'Physical receiver with great route-running ability and reliable hands.',
    classYear: 2027,
    school: 'Westfield High',
    city: 'Houston',
    state: 'TX',
    evaluation: {
      measurables: { height: '6\'0"', weight: 185, armLength: 31.5, fortyYard: 4.42, shuttle: 4.05, threeCone: 6.85, vertical: 38, broad: 122 },
      skillGrades: [
        { key: 'release', label: 'Release Package', grade: 90, letterGrade: 'A', note: 'Multiple release types, excellent off the line' },
        { key: 'ballSkills', label: 'Ball Skills', grade: 86, letterGrade: 'B+', note: 'Strong hands, tracks the ball well, body control' },
        { key: 'hips', label: 'Route Running', grade: 88, letterGrade: 'A', note: 'Sharp breaks, sells routes, creates separation' },
        { key: 'footballIQ', label: 'Football IQ', grade: 78, letterGrade: 'C+', note: 'Developing — reads coverage well on film' },
        { key: 'blocking', label: 'Blocking', grade: 72, letterGrade: 'C', note: 'Willing but needs to add functional strength' },
      ],
      strengths: [
        'Elite route runner — creates 2+ yards of separation consistently',
        'Speed is verified: 4.42 forty, explosive first step',
        'Strong contested catch ability with 38" vertical',
        'Physical after the catch — 6.2 YAC/reception',
        'High-volume producer: 68 receptions, 1100 yards, 14 TDs',
      ],
      weaknesses: [
        'Needs to add 10-15 lbs of functional muscle',
        'Blocking effort inconsistent in run game',
        'Can get rerouted by physical press corners',
        'Limited experience running full route tree (mostly short/intermediate)',
      ],
      analytics: [
        { key: 'separation', label: 'Avg Separation', value: 2.4, unit: 'yds', percentile: 90 },
        { key: 'yac', label: 'YAC/Reception', value: 6.2, unit: 'yds', percentile: 85 },
        { key: 'missedTacklesForced', label: 'Missed Tackles Forced', value: 18, unit: '', percentile: 82 },
        { key: 'epa', label: 'EPA/Target', value: 0.45, unit: '', percentile: 88 },
      ],
      projection: { ceiling: 91, floor: 70, current: 82, confidence: 0.80, timeline: '2-year development arc', trajectory: 'rising' },
      archetype: { key: 'threeAndDWing', label: 'Dynamic Route Runner', confidence: 0.83 },
      redFlags: ['Slight frame for physical Big 12 football'],
      roleFit: [
        { role: 'Slot receiver contributor Year 1', confidence: 0.78, description: 'Route running translates immediately to slot role' },
        { role: 'Primary outside receiver Year 2-3', confidence: 0.82, description: 'With added weight, projects as WR1 outside' },
      ],
      scoutNotes: 'Explosive, polished route runner who wins with technique over pure athleticism — though the athleticism is also elite. Needs to fill out his frame. Sleeper potential: could be the best WR in the class if he adds weight. Film shows a natural feel for creating space. Low-drama kid, competitive, great work ethic.',
    },
  },
];

// ─── Basketball Demo Prospects ──────────────────────────────────────

const BASKETBALL_DEMOS: DemoProspect[] = [
  {
    id: 'demo-bb-1',
    sport: 'basketball',
    level: 'high_school',
    firstName: 'Aiden',
    lastName: 'Brooks',
    position: 'PG',
    bio: 'Crafty point guard with elite court vision and developing shooting range.',
    classYear: 2027,
    school: 'Oak Hill Academy',
    city: 'Mouth of Wilson',
    state: 'VA',
    evaluation: {
      measurables: { height: '6\'2"', wingspan: 78, standingReach: 98, weight: 178, handWidth: 9.0, laneAgility: 10.8, verticalLeap: 36, courtSprint: 3.15 },
      skillGrades: [
        { key: 'shooting', label: 'Shooting', grade: 75, letterGrade: 'C+', note: 'Good form, developing range — 34% from 3, but improving' },
        { key: 'handle', label: 'Ball Handling', grade: 92, letterGrade: 'A', note: 'Elite handles, tight crossover, PnR navigation superb' },
        { key: 'decisionMaking', label: 'Decision Making', grade: 94, letterGrade: 'A', note: 'Rare court vision for HS — makes the right play consistently' },
        { key: 'defensiveVersatility', label: 'Defensive Versatility', grade: 78, letterGrade: 'C+', note: 'Active hands, needs to improve off-ball effort' },
        { key: 'basketballIQ', label: 'Basketball IQ', grade: 93, letterGrade: 'A', note: 'Understands spacing, timing, and pace at elite level' },
        { key: 'finishing', label: 'Finishing', grade: 82, letterGrade: 'B', note: 'Creative finisher, developing floater, uses angles well' },
      ],
      strengths: [
        'Elite court vision — 9.2 assists per game with only 2.1 turnovers',
        'Advanced pick-and-roll operator — reads coverage, makes correct play',
        'Handles pressure without turning the ball over',
        'Natural leader — vocal, organizes teammates on both ends',
        'Good lateral quickness and active hands defensively',
      ],
      weaknesses: [
        '3-point shooting still developing — 34% but low volume',
        'Slight frame — needs strength for physical college guards',
        'Off-ball defensive effort inconsistent at times',
        'Pull-up jumper needs work from mid-range',
      ],
      analytics: [
        { key: 'tsPct', label: 'TS%', value: 55.2, unit: '%', percentile: 70 },
        { key: 'assistRate', label: 'Assist Rate', value: 42.1, unit: '%', percentile: 95 },
        { key: 'turnoverRate', label: 'TO Rate', value: 12.8, unit: '%', percentile: 82 },
        { key: 'usageRate', label: 'Usage', value: 28.4, unit: '%', percentile: 75 },
        { key: 'defensiveActivity', label: 'Steals+Deflections', value: 3.8, unit: '/gm', percentile: 78 },
      ],
      projection: { ceiling: 91, floor: 68, current: 80, confidence: 0.76, timeline: '3–4 year development arc', trajectory: 'rising' },
      archetype: { key: 'connector', label: 'Connector', confidence: 0.91 },
      redFlags: ['Shooting must improve for spacing', 'Physical maturity needs time'],
      roleFit: [
        { role: 'Backup PG Year 1', confidence: 0.82, description: 'IQ translates immediately, shooting needs to catch up' },
        { role: 'Starting PG Year 2-3', confidence: 0.85, description: 'With shooting development, becomes elite floor general' },
      ],
      scoutNotes: 'Rare feel for the game. Court vision and passing are the best in the class. Shooting is the swing skill — if the jumper develops, the ceiling is conference Player of the Year. If not, still a high-level backup PG. Character is excellent. Team-first mentality.',
    },
  },
  {
    id: 'demo-bb-2',
    sport: 'basketball',
    level: 'college_D1',
    firstName: 'Terrence',
    lastName: 'Williams',
    position: 'SF',
    bio: 'Long, athletic wing with elite defensive versatility and developing offensive game.',
    classYear: 2026,
    school: 'Duke University',
    city: 'Durham',
    state: 'NC',
    evaluation: {
      measurables: { height: '6\'7"', wingspan: 84, standingReach: 106, weight: 210, handWidth: 9.5, laneAgility: 10.4, verticalLeap: 38, courtSprint: 3.08 },
      skillGrades: [
        { key: 'shooting', label: 'Shooting', grade: 72, letterGrade: 'C', note: '35% from 3, mechanics improved but still streaky' },
        { key: 'handle', label: 'Ball Handling', grade: 70, letterGrade: 'C-', note: 'Limited creation, effective in straight line, tight handle needs work' },
        { key: 'defensiveVersatility', label: 'Defensive Versatility', grade: 96, letterGrade: 'A+', note: 'DPOY candidate — guards 1-5, elite switchability' },
        { key: 'basketballIQ', label: 'Basketball IQ', grade: 85, letterGrade: 'B+', note: 'Excellent defensive rotations, offensive reads improving' },
        { key: 'finishing', label: 'Finishing', grade: 80, letterGrade: 'B-', note: 'Finishes with length, developing contact finishing' },
        { key: 'rebounding', label: 'Rebounding', grade: 84, letterGrade: 'B+', note: 'Excellent motor, uses wingspan to pull boards' },
      ],
      strengths: [
        'Elite defensive switchability — guards all 5 positions credibly',
        'Plus wingspan (84") with excellent lateral quickness',
        '7.2 rebounds per game despite playing wing',
        'Transition scoring — finishes at the rim in the open court',
        'High motor, compete level is elite every possession',
      ],
      weaknesses: [
        'Half-court shot creation is limited',
        '3-point shooting inconsistent (35%, streaky)',
        'Free throw shooting concerning (68%)',
        'Not a primary offensive option yet',
      ],
      analytics: [
        { key: 'tsPct', label: 'TS%', value: 56.8, unit: '%', percentile: 65 },
        { key: 'defensiveActivity', label: 'Stk+Blk+Defl', value: 4.2, unit: '/gm', percentile: 95 },
        { key: 'reboundRate', label: 'Rebound Rate', value: 14.2, unit: '%', percentile: 85 },
        { key: 'usageRate', label: 'Usage', value: 18.2, unit: '%', percentile: 40 },
      ],
      projection: { ceiling: 88, floor: 75, current: 81, confidence: 0.82, timeline: '1-2 year path to high-level role', trajectory: 'steady' },
      archetype: { key: 'threeAndDWing', label: '3-and-D Wing', confidence: 0.92 },
      redFlags: ['Free throw percentage', 'Half-court creation ceiling'],
      roleFit: [
        { role: 'Defensive anchor / glue guy', confidence: 0.94, description: 'Elite defender who makes the team better without needing touches' },
        { role: 'Versatile starter', confidence: 0.82, description: 'With shooting improvement, becomes ideal modern wing' },
      ],
      scoutNotes: 'Elite defender with rare physical tools. The shooting is the swing skill — if it becomes reliable (38%+), this is a pro prospect. Even without it, the defense, rebounding, and IQ make him extremely valuable. High character, coachable, competitive. Fits any system.',
    },
  },
];

// ─── Baseball Demo Prospects ────────────────────────────────────────

const BASEBALL_DEMOS: DemoProspect[] = [
  {
    id: 'demo-ba-1',
    sport: 'baseball',
    level: 'high_school',
    firstName: 'Jake',
    lastName: 'Morrison',
    position: 'RHP',
    bio: 'Power arm right-hander with three-pitch mix and rising velocity.',
    classYear: 2027,
    school: 'Central High',
    city: 'Tampa',
    state: 'FL',
    evaluation: {
      measurables: { height: '6\'3"', weight: 195, batSpeed: 0, armSlot: 72, sixtyYard: 7.0, infieldVelo: 0, popTime: 0 },
      skillGrades: [
        { key: 'armStrength', label: 'Arm Strength', grade: 90, letterGrade: 'A', note: 'FB sits 92-94, touched 96 in showcases' },
        { key: 'pitchCommand', label: 'Pitch Command', grade: 74, letterGrade: 'C', note: 'Developing — walks too many (4.2 BB/9), but improving' },
        { key: 'pitchRecognition', label: 'Secondary Stuff', grade: 82, letterGrade: 'B', note: 'Slider is plus, changeup flashes average' },
        { key: 'hittingApproach', label: 'Mound Presence', grade: 85, letterGrade: 'B+', note: 'Competes hard, doesn\'t rattle, attacks hitters' },
        { key: 'fielding', label: 'Fielding (PFP)', grade: 70, letterGrade: 'C-', note: 'Average — needs to be quicker off the mound' },
      ],
      strengths: [
        'FB velocity is elite for HS: 92-94, touching 96',
        'Plus slider with tight spin (2680 rpm) and good depth',
        'Projectable frame — room for velocity gains with physical maturity',
        'Compete level is elite — big-game performer',
        'K rate: 12.1 per 9 innings',
      ],
      weaknesses: [
        'Walk rate too high (4.2 BB/9) — command needs refinement',
        'Changeup is developmental — below average currently',
        'Tendency to overthrow when behind in count',
        'Needs to improve consistency of mechanics (arm slot drifts)',
      ],
      analytics: [
        { key: 'spinRate', label: 'FB Spin Rate', value: 2340, unit: 'rpm', percentile: 85 },
        { key: 'whiffRate', label: 'Whiff Rate', value: 32, unit: '%', percentile: 88 },
        { key: 'chasePct', label: 'Chase %', value: 34, unit: '%', percentile: 78 },
        { key: 'exitVelo', label: 'Exit Velo Against', value: 82.1, unit: 'mph', percentile: 80 },
      ],
      projection: { ceiling: 92, floor: 65, current: 80, confidence: 0.72, timeline: '3-4 year development arc', trajectory: 'rising' },
      archetype: { key: 'powerArm', label: 'Power Arm', confidence: 0.90 },
      redFlags: ['Walk rate in pressure situations', 'Workload management needed'],
      roleFit: [
        { role: 'Weekend starter by Year 2', confidence: 0.75, description: 'Velocity plays immediately, command will determine timeline' },
        { role: 'Friday night starter by Year 3', confidence: 0.68, description: 'If command develops, ace potential' },
      ],
      scoutNotes: 'Power arm with legit top-of-rotation upside. The FB velocity and slider combination already play at the college level. The development question is command — if he tightens the zone, this is a potential early-round draft pick down the road. Physically projectable, high character, competitive. The changeup is the third pitch that will determine his ceiling.',
    },
  },
];

// ─── Soccer Demo Prospects ──────────────────────────────────────────

const SOCCER_DEMOS: DemoProspect[] = [
  {
    id: 'demo-sc-1',
    sport: 'soccer',
    level: 'high_school',
    firstName: 'Santiago',
    lastName: 'Rivera',
    position: 'CM',
    bio: 'Technical central midfielder with elite passing range and a high work rate.',
    classYear: 2027,
    school: 'St. Benedict\'s Prep',
    city: 'Newark',
    state: 'NJ',
    evaluation: {
      measurables: { speed: 20.2, stamina: 58.4, agility: 9.1, height: '5\'10"', weight: 160, sprintRepeat: 27.2 },
      skillGrades: [
        { key: 'firstTouch', label: 'First Touch', grade: 91, letterGrade: 'A', note: 'Exceptional close control, receives under pressure' },
        { key: 'vision', label: 'Vision', grade: 94, letterGrade: 'A', note: 'Sees passes before they develop — rare spatial awareness' },
        { key: 'passingRange', label: 'Passing Range', grade: 90, letterGrade: 'A', note: 'Accurate short and long, switches play with precision' },
        { key: 'defensiveWorkRate', label: 'Defensive Work Rate', grade: 82, letterGrade: 'B', note: 'Covers ground, presses well, could be more physical' },
        { key: 'dribbling', label: 'Dribbling', grade: 78, letterGrade: 'C+', note: 'Good in tight spaces, not a 1v1 specialist' },
        { key: 'positioning', label: 'Positioning', grade: 88, letterGrade: 'A', note: 'Finds space consistently, manipulates passing lanes' },
      ],
      strengths: [
        'Elite passing range — switches play accurately over 40+ yards',
        'Exceptional first touch allows play in tight spaces',
        'High stamina (VO2max 58.4) — covers 11km+ per match',
        'Natural leader, organizes teammates positionally',
        'Creates 3.2 key passes per 90 minutes',
      ],
      weaknesses: [
        'Physicality — gets outmuscled in aerial duels',
        'Needs to add strength for physical college midfields',
        'Speed is average — relies on positioning over pace',
        '1v1 dribbling is functional, not dynamic',
      ],
      analytics: [
        { key: 'xA', label: 'xA/90', value: 0.42, unit: '', percentile: 92 },
        { key: 'progressivePasses', label: 'Progressive Passes', value: 8.4, unit: '/90', percentile: 90 },
        { key: 'passCompletionPct', label: 'Pass Completion', value: 88.2, unit: '%', percentile: 85 },
        { key: 'pressures', label: 'Pressures', value: 18.1, unit: '/90', percentile: 72 },
        { key: 'recoveries', label: 'Recoveries', value: 6.2, unit: '/90', percentile: 68 },
      ],
      projection: { ceiling: 90, floor: 72, current: 82, confidence: 0.80, timeline: '2-3 year development arc', trajectory: 'rising' },
      archetype: { key: 'deepPlaymaker', label: 'Deep Playmaker', confidence: 0.88 },
      redFlags: ['Physical maturity concerns in physical conferences'],
      roleFit: [
        { role: 'Starting CM by Year 2', confidence: 0.80, description: 'Technical skills translate immediately; physical development determines timeline' },
        { role: 'Midfield anchor by Year 3', confidence: 0.78, description: 'Dictates tempo and controls the middle of the park' },
      ],
      scoutNotes: 'Rare passer with vision beyond his years. Plays the game at a different speed mentally — sees the pass before it opens. Needs physical development but the technical foundation is elite. Would thrive in a possession-based system. Strong academic profile. MLS academy interest.',
    },
  },
];

// ─── Hockey Demo Prospects ──────────────────────────────────────────

const HOCKEY_DEMOS: DemoProspect[] = [
  {
    id: 'demo-hk-1',
    sport: 'hockey',
    level: 'high_school',
    firstName: 'Erik',
    lastName: 'Lindstrom',
    position: 'C',
    bio: 'Smooth-skating two-way center with elite hockey sense and playmaking ability.',
    classYear: 2027,
    school: 'Shattuck-St. Mary\'s',
    city: 'Faribault',
    state: 'MN',
    evaluation: {
      measurables: { height: '6\'0"', weight: 185, reach: 74, skatingSpeed: 22.1, agility: 9.5, shotSpeed: 86 },
      skillGrades: [
        { key: 'skating', label: 'Skating', grade: 90, letterGrade: 'A', note: 'Excellent edges, smooth stride, strong transitions' },
        { key: 'puckHandling', label: 'Puck Handling', grade: 86, letterGrade: 'B+', note: 'Soft hands, protects puck well, creative dekes' },
        { key: 'hockeyVision', label: 'Vision', grade: 93, letterGrade: 'A', note: 'Elite playmaker — sees the ice at a high level' },
        { key: 'physicality', label: 'Physicality', grade: 72, letterGrade: 'C', note: 'Willing but needs to add strength for board battles' },
        { key: 'shooting', label: 'Shooting', grade: 78, letterGrade: 'C+', note: 'Good wrist shot, need more power, release is quick' },
        { key: 'defensivePlay', label: 'Defensive Play', grade: 84, letterGrade: 'B+', note: 'Strong positioning, backchecks hard, responsible' },
        { key: 'faceoffs', label: 'Faceoffs', grade: 80, letterGrade: 'B-', note: '54.2% FO win rate — technique is solid' },
      ],
      strengths: [
        'Skating is elite — smooth edges, explosive crossovers, transitions',
        'Vision and playmaking are the best in the prep school ranks',
        '54.2% faceoff win rate with sound technique',
        'Two-way commitment — plays 200 feet of ice responsibly',
        'Point-per-game producer (62 points in 58 games)',
      ],
      weaknesses: [
        'Needs to add 15-20 lbs for college-level physical play',
        'Shot power is below average — can score but not a shooter',
        'Board play suffers against bigger opponents',
        'Power play usage is limited — needs to develop PP role',
      ],
      analytics: [
        { key: 'corsi', label: 'Corsi%', value: 58.4, unit: '%', percentile: 88 },
        { key: 'pointsPer60', label: 'Points/60', value: 3.82, unit: '', percentile: 85 },
        { key: 'zoneEntries', label: 'Zone Entries', value: 8.4, unit: '/60', percentile: 82 },
        { key: 'xGoals', label: 'xG', value: 14.2, unit: '', percentile: 72 },
      ],
      projection: { ceiling: 90, floor: 70, current: 82, confidence: 0.78, timeline: '3-4 year development arc', trajectory: 'rising' },
      archetype: { key: 'twoWayCenter', label: 'Two-Way Center', confidence: 0.90 },
      redFlags: ['Physical maturity — needs significant S&C', 'Shot power development needed'],
      roleFit: [
        { role: 'Top-9 forward Year 1', confidence: 0.80, description: 'Skating and IQ play immediately; physicality limits top-6 role' },
        { role: 'Top-6 center by Year 2-3', confidence: 0.82, description: 'With physical development, projects as high-end 2C' },
      ],
      scoutNotes: 'Silky-smooth skater with elite vision. Plays the game at a high pace and makes everyone around him better. The physical development is the key question — if he adds strength without losing the skating, the ceiling is very high. Smart kid, great character, hockey family. Committed student.',
    },
  },
];

// ─── All Demo Prospects ─────────────────────────────────────────────

export const ALL_DEMO_PROSPECTS: DemoProspect[] = [
  ...FOOTBALL_DEMOS,
  ...BASKETBALL_DEMOS,
  ...BASEBALL_DEMOS,
  ...SOCCER_DEMOS,
  ...HOCKEY_DEMOS,
];

/** Get demo prospects filtered by sport */
export function getDemoProspectsForSport(sport: SportKey): DemoProspect[] {
  return ALL_DEMO_PROSPECTS.filter((p) => p.sport === sport);
}

/** Get a single demo prospect by ID */
export function getDemoProspect(id: string): DemoProspect | undefined {
  return ALL_DEMO_PROSPECTS.find((p) => p.id === id);
}

/** Get demo prospects filtered by sport and level */
export function getDemoProspectsForSportAndLevel(sport: SportKey, level: string): DemoProspect[] {
  return ALL_DEMO_PROSPECTS.filter((p) => p.sport === sport && p.level === level);
}
