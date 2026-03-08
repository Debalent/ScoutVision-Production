// ─── ScoutVision Level Packs ────────────────────────────────────────
// Level-specific evaluation criteria that stack on top of Sport Packs.
// These modify WHAT to emphasize inside the existing evaluation sections.

export type LevelKey = 'high_school' | 'college' | 'pro';
export type CollegeSubLevel = 'JUCO' | 'D2' | 'D1';

// ─── Types ──────────────────────────────────────────────────────────

export interface EvaluationEmphasis {
  key: string;
  label: string;
  weight: number;       // 1-10 scale of how important this is at this level
  description: string;
}

export interface LevelPack {
  key: LevelKey;
  label: string;
  subLevel?: CollegeSubLevel;
  description: string;
  evaluationPhilosophy: string;
  primaryEmphasis: EvaluationEmphasis[];
  projectionGuidance: string[];
  strengthKeywords: string[];
  weaknessKeywords: string[];
  redFlagKeywords: string[];
  gradeScale: { label: string; min: number; max: number; color: string }[];
}

// ─── High School Level ──────────────────────────────────────────────

export const HIGH_SCHOOL_PACK: LevelPack = {
  key: 'high_school',
  label: 'High School',
  description: 'Evaluating raw tools, instincts, and long-term upside',
  evaluationPhilosophy: 'Projection > Polish. Focus on raw tools, athletic ceiling, growth trajectory, and coachability. Evaluate what the athlete CAN become, not just what they are today.',
  primaryEmphasis: [
    { key: 'rawTools', label: 'Raw Tools', weight: 9, description: 'Natural ability, explosiveness, body control, coordination' },
    { key: 'instincts', label: 'Instincts', weight: 8, description: 'Natural feel for the game, anticipation, awareness' },
    { key: 'athleticism', label: 'Athleticism', weight: 9, description: 'Speed, agility, strength, overall physical profile' },
    { key: 'upside', label: 'Long-Term Upside', weight: 10, description: 'Physical projection, room for growth, frame potential' },
    { key: 'coachability', label: 'Coachability', weight: 8, description: 'Willingness to learn, response to coaching, attitude' },
    { key: 'competitiveness', label: 'Competitiveness', weight: 7, description: 'Will to win, big-moment performance, motor' },
    { key: 'academics', label: 'Academic Profile', weight: 7, description: 'GPA, test scores, eligibility, academic trajectory' },
  ],
  projectionGuidance: [
    'How much physical growth is left? Frame, weight, speed development.',
    'What does the athlete look like after 2-3 years of college S&C?',
    'Are the raw tools elite even if the technique is unrefined?',
    'Does this kid play fast and with instincts?',
    'Is there a clear development path from high school to college starter?',
    'What is the competitor level of their high school environment?',
  ],
  strengthKeywords: ['Elite tools', 'Raw athleticism', 'High motor', 'Instinctive', 'Projectable frame', 'Explosive', 'Competitive', 'Natural feel', 'Upside play', 'Coachable'],
  weaknessKeywords: ['Raw technique', 'Needs S&C', 'Undeveloped', 'Inconsistent', 'Competition level', 'Needs refinement', 'Low exposure', 'Immature', 'Lacks polish'],
  redFlagKeywords: ['Effort concerns', 'Character issue', 'Academic risk', 'Injury history', 'Plateaued growth', 'Poor coachability', 'Off-field concerns'],
  gradeScale: [
    { label: 'Elite Prospect', min: 90, max: 100, color: '#22C55E' },
    { label: 'High Priority', min: 80, max: 89, color: '#3B82F6' },
    { label: 'Target', min: 70, max: 79, color: '#F59E0B' },
    { label: 'Watch List', min: 60, max: 69, color: '#8B5CF6' },
    { label: 'Developmental', min: 50, max: 59, color: '#6B7280' },
    { label: 'Low Priority', min: 0, max: 49, color: '#374151' },
  ],
};

// ─── College Level (D1) ─────────────────────────────────────────────

export const COLLEGE_D1_PACK: LevelPack = {
  key: 'college',
  label: 'College (D1)',
  subLevel: 'D1',
  description: 'Evaluating role clarity, efficiency, and translatable skills at the highest collegiate level',
  evaluationPhilosophy: 'Efficiency > Volume. Focus on role clarity, how skills translate to the next level, scheme fit, and consistency against top competition.',
  primaryEmphasis: [
    { key: 'roleClarity', label: 'Role Clarity', weight: 9, description: 'Does the player know what they\'re good at and play to it?' },
    { key: 'efficiency', label: 'Efficiency', weight: 9, description: 'Production per opportunity — quality over quantity' },
    { key: 'consistency', label: 'Consistency', weight: 8, description: 'Show-up factor — performs against ranked and unranked opponents alike' },
    { key: 'schemeFit', label: 'Scheme Fit', weight: 8, description: 'How well does the player fit your system and coaching style?' },
    { key: 'coachability', label: 'Coachability', weight: 7, description: 'Film room habits, response to coaching, self-correction' },
    { key: 'translatableSkills', label: 'Translatable Skills', weight: 9, description: 'Which skills carry over regardless of scheme or conference?' },
    { key: 'competitionLevel', label: 'Competition Level', weight: 8, description: 'Quality of opponents faced — strength of schedule' },
  ],
  projectionGuidance: [
    'How does production hold up against top competition?',
    'Can this player immediately fill a defined role?',
    'What skills transfer if the scheme changes?',
    'Is the player still improving or has development flatlined?',
    'How does the player respond to adversity and adjustments?',
    'What is the floor vs. ceiling at this stage of development?',
  ],
  strengthKeywords: ['Efficient', 'Role-defined', 'Consistent', 'Scheme-versatile', 'Translatable', 'High-level competition tested', 'Self-correcting', 'Film rat'],
  weaknessKeywords: ['System-dependent', 'One-dimensional', 'Competition concerns', 'Maxed out', 'Inconsistent effort', 'Limited scheme versatility'],
  redFlagKeywords: ['Transfer risk', 'Locker room concerns', 'Declining production', 'Injury pattern', 'Scheme-dependent production', 'Eligibility questions'],
  gradeScale: [
    { label: 'All-American Caliber', min: 90, max: 100, color: '#22C55E' },
    { label: 'All-Conference', min: 80, max: 89, color: '#3B82F6' },
    { label: 'Starter', min: 70, max: 79, color: '#F59E0B' },
    { label: 'Contributor', min: 60, max: 69, color: '#8B5CF6' },
    { label: 'Depth / Scout Team', min: 50, max: 59, color: '#6B7280' },
    { label: 'Preferred Walk-On', min: 0, max: 49, color: '#374151' },
  ],
};

// ─── College Level (D2) ─────────────────────────────────────────────

export const COLLEGE_D2_PACK: LevelPack = {
  key: 'college',
  label: 'College (D2)',
  subLevel: 'D2',
  description: 'Evaluating efficiency, adaptability, and hidden upside at the D2 level',
  evaluationPhilosophy: 'Value > Name. Find players whose skills translate beyond their current competition level. Differentiate stats from talent.',
  primaryEmphasis: [
    { key: 'efficiency', label: 'Efficiency', weight: 9, description: 'Production per opportunity adjusted for competition level' },
    { key: 'adaptability', label: 'Adaptability', weight: 8, description: 'How quickly does the player adjust to new schemes and competition?' },
    { key: 'hiddenUpside', label: 'Hidden Upside', weight: 8, description: 'Tools and traits that are underutilized at the current level' },
    { key: 'competitionAdjusted', label: 'Competition Adjustment', weight: 9, description: 'How does production translate against higher-level opponents?' },
    { key: 'characterFit', label: 'Character Fit', weight: 7, description: 'A strong fit culturally and personality-wise?' },
    { key: 'physicalProjection', label: 'Physical Projection', weight: 7, description: 'Room for physical development with better S&C resources' },
  ],
  projectionGuidance: [
    'Does this player dominate their level or just survive?',
    'How do they look against their best opponents?',
    'Would improved S&C unlock another level?',
    'Are there specific skills that would translate up?',
    'Can this player earn minutes at a higher level?',
  ],
  strengthKeywords: ['Dominant at level', 'Translatable skills', 'Underexposed', 'Strong character', 'High motor', 'Versatile'],
  weaknessKeywords: ['Competition concerns', 'Physical limitations', 'System-generated stats', 'Limited exposure'],
  redFlagKeywords: ['Capped physically', 'Struggles vs. best opponents', 'Character flags', 'Academic risk', 'Injury concerns'],
  gradeScale: [
    { label: 'Transfer Up Candidate', min: 90, max: 100, color: '#22C55E' },
    { label: 'All-Conference', min: 80, max: 89, color: '#3B82F6' },
    { label: 'Starter', min: 70, max: 79, color: '#F59E0B' },
    { label: 'Rotation Player', min: 60, max: 69, color: '#8B5CF6' },
    { label: 'Depth', min: 0, max: 59, color: '#6B7280' },
  ],
};

// ─── College Level (JUCO) ───────────────────────────────────────────

export const COLLEGE_JUCO_PACK: LevelPack = {
  key: 'college',
  label: 'College (JUCO)',
  subLevel: 'JUCO',
  description: 'Evaluating immediate-impact transfers with a focus on readiness and maturity',
  evaluationPhilosophy: 'Readiness > Projection. JUCO evaluations should focus on what the player can do NOW. Maturity, scheme readiness, and immediate contribution potential are paramount.',
  primaryEmphasis: [
    { key: 'immediateImpact', label: 'Immediate Impact', weight: 10, description: 'Can this player contribute from day one at the next level?' },
    { key: 'maturity', label: 'Maturity', weight: 9, description: 'Emotional maturity, focus, ability to handle the transition' },
    { key: 'schemeReadiness', label: 'Scheme Readiness', weight: 8, description: 'How quickly will they learn and fit into the system?' },
    { key: 'academicTrajectory', label: 'Academic Trajectory', weight: 8, description: 'Credits, GPA trend, transfer eligibility' },
    { key: 'physicalReadiness', label: 'Physical Readiness', weight: 8, description: 'Body is ready for the next level of competition' },
    { key: 'whyJUCO', label: 'Why JUCO?', weight: 7, description: 'Understanding the path — academics, late bloomer, or red flag?' },
  ],
  projectionGuidance: [
    'What is the reason they went the JUCO route?',
    'Are they academically on track for transfer eligibility?',
    'Can they contribute immediately or need development time?',
    'How do they compare physically to players at the target level?',
    'Is the maturity level ready for D1 scrutiny?',
  ],
  strengthKeywords: ['Immediate impact', 'Physically ready', 'Mature', 'Hungry', 'Academic upswing', 'High-level talent'],
  weaknessKeywords: ['Academic risk', 'Unknown background', 'Adjustment period needed', 'Short track record'],
  redFlagKeywords: ['Academic eligibility risk', 'Multiple transfers', 'Character patterns', 'Effort inconsistency', 'Off-field issues'],
  gradeScale: [
    { label: 'Day-One Starter', min: 85, max: 100, color: '#22C55E' },
    { label: 'Rotation Contributor', min: 70, max: 84, color: '#3B82F6' },
    { label: 'Developmental', min: 55, max: 69, color: '#F59E0B' },
    { label: 'Risk/Reward', min: 0, max: 54, color: '#EF4444' },
  ],
};

// ─── Pro / Semi-Pro Level ───────────────────────────────────────────

export const PRO_PACK: LevelPack = {
  key: 'pro',
  label: 'Pro / Semi-Pro',
  description: 'Evaluating scalability, advantage creation, and matchup value',
  evaluationPhilosophy: 'Advantage > Ability. At the pro level, everyone is talented. Focus on what specific, repeatable advantages the player creates. Evaluate durability, matchup value, and system versatility.',
  primaryEmphasis: [
    { key: 'scalability', label: 'Scalability', weight: 10, description: 'Can this player\'s game scale against elite competition?' },
    { key: 'advantageCreation', label: 'Advantage Creation', weight: 10, description: 'Does the player create specific, repeatable edges in matchups?' },
    { key: 'durability', label: 'Durability', weight: 9, description: 'Workload capacity, injury history, long-term health projection' },
    { key: 'matchupValue', label: 'Matchup Value', weight: 9, description: 'How does this player perform in specific high-leverage matchups?' },
    { key: 'systemVersatility', label: 'System Versatility', weight: 8, description: 'Can they perform across different schemes and coaching styles?' },
    { key: 'ceilingFloor', label: 'Ceiling vs. Floor', weight: 8, description: 'How wide is the range between best and worst case outcomes?' },
    { key: 'leadershipImpact', label: 'Leadership Impact', weight: 7, description: 'Does this player elevate the performance of teammates?' },
  ],
  projectionGuidance: [
    'What specific advantage does this player create that others cannot?',
    'How does this player perform vs. the best opposition?',
    'What does the injury history and workload capacity look like?',
    'Can this player thrive in multiple systems?',
    'What is the realistic ceiling and floor at this level?',
    'Does this player make the team better beyond their individual stats?',
  ],
  strengthKeywords: ['Elite advantage', 'Scalable', 'Durable', 'System-versatile', 'Matchup-proof', 'Leadership', 'Clutch performer', 'Self-creator'],
  weaknessKeywords: ['Scheme-dependent', 'Durability concerns', 'One-speed player', 'Matchup-vulnerable', 'Limited versatility'],
  redFlagKeywords: ['Chronic injury', 'Declining trajectory', 'Contract risk', 'Effort variability', 'Off-field concerns', 'Age curve decline'],
  gradeScale: [
    { label: 'Franchise/Cornerstone', min: 90, max: 100, color: '#22C55E' },
    { label: 'All-Star Caliber', min: 80, max: 89, color: '#3B82F6' },
    { label: 'Quality Starter', min: 70, max: 79, color: '#F59E0B' },
    { label: 'Rotation/Bench', min: 60, max: 69, color: '#8B5CF6' },
    { label: 'Fringe/Replacement', min: 50, max: 59, color: '#6B7280' },
    { label: 'Below Standard', min: 0, max: 49, color: '#374151' },
  ],
};

// ─── Pack Registry ──────────────────────────────────────────────────

export const LEVEL_PACKS: Record<string, LevelPack> = {
  high_school: HIGH_SCHOOL_PACK,
  college_D1: COLLEGE_D1_PACK,
  college_D2: COLLEGE_D2_PACK,
  college_JUCO: COLLEGE_JUCO_PACK,
  pro: PRO_PACK,
};

export const LEVEL_LIST: { key: string; label: string; description: string }[] = [
  { key: 'high_school', label: 'High School', description: 'Projection over polish' },
  { key: 'college_D1', label: 'College (D1)', description: 'Elite division competition' },
  { key: 'college_D2', label: 'College (D2)', description: 'Hidden gems & value' },
  { key: 'college_JUCO', label: 'College (JUCO)', description: 'Immediate-impact transfers' },
  { key: 'pro', label: 'Pro / Semi-Pro', description: 'Advantage & scalability' },
];

/** Get the level pack for a given key. Falls back to high school. */
export function getLevelPack(levelKey: string): LevelPack {
  return LEVEL_PACKS[levelKey] ?? HIGH_SCHOOL_PACK;
}

/** Get grade label and color for a given score */
export function getGradeInfo(levelKey: string, score: number): { label: string; color: string } {
  const pack = getLevelPack(levelKey);
  const match = pack.gradeScale.find((g) => score >= g.min && score <= g.max);
  return match ?? { label: 'Ungraded', color: '#6B7280' };
}
