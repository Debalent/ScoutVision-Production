// ─── ScoutVision Mock Data ───────────────────────────────────────────
// Production-quality demo data for all modules

import type {
  Prospect, RecruitingStage, ComplianceEvent, RecruitingPeriod,
  Visit, Video, VideoClip, Note, Evaluation, ContactLog, Email,
  DashboardStats, ActivityItem, PipelineMetric,
} from './types';

// ─── Recruiting Stages ──────────────────────────────────────────────

export const STAGES: RecruitingStage[] = [
  { id: 's1', name: 'Identified',  order: 0, color: '#6B7280', programId: 'p1' },
  { id: 's2', name: 'Contacted',   order: 1, color: '#3B82F6', programId: 'p1' },
  { id: 's3', name: 'Evaluating',  order: 2, color: '#F59E0B', programId: 'p1' },
  { id: 's4', name: 'Offer',       order: 3, color: '#8B5CF6', programId: 'p1' },
  { id: 's5', name: 'Committed',   order: 4, color: '#10B981', programId: 'p1' },
];

// ─── Prospects ──────────────────────────────────────────────────────

export const PROSPECTS: Prospect[] = [
  {
    id: 'pr1', firstName: 'Marcus', lastName: 'Johnson', bio: 'Elite dual-threat QB with exceptional pocket awareness.',
    email: 'mjohnson@email.com', phone: '555-0101', imageUrl: null,
    position: 'QB', height: '6\'2"', weight: 205, highSchool: 'Lincoln Prep', clubTeam: null,
    city: 'Atlanta', state: 'GA', zipCode: '30301', hudlUrl: 'https://hudl.com/v/example1',
    twitterUrl: null, instagramUrl: null, tags: ['Priority', 'Official Visit'],
    commitmentScore: 78, classYear: 2027, status: 'active',
    stats: { id: 'st1', fortyYard: 4.55, shuttle: 4.12, vertical: 34, bench: 225, squat: 405, broad: 9.8, sportMetrics: { passingYards: 3200, touchdowns: 32, completionPct: 67.4 } },
    academics: { id: 'ac1', gpa: 3.6, satScore: 1180, actScore: 25, school: 'Lincoln Prep Academy', gradYear: 2027, intendedMajor: 'Business', ncaaEligible: true, coreGpa: 3.4 },
    stage: STAGES[2], stageId: 's3', stageOrder: 0,
    notes: [], evaluations: [], videos: [], visits: [], contactLogs: [], emails: [],
    programId: 'p1', createdAt: '2025-09-15T10:00:00Z', updatedAt: '2026-02-20T14:30:00Z',
  },
  {
    id: 'pr2', firstName: 'Jaylen', lastName: 'Carter', bio: 'Physical WR with great route-running ability and reliable hands.',
    email: 'jcarter@email.com', phone: '555-0102', imageUrl: null,
    position: 'WR', height: '6\'0"', weight: 185, highSchool: 'Westfield High', clubTeam: null,
    city: 'Houston', state: 'TX', zipCode: '77001', hudlUrl: 'https://hudl.com/v/example2',
    twitterUrl: null, instagramUrl: null, tags: ['Sleeper', 'Film Reviewed'],
    commitmentScore: 62, classYear: 2027, status: 'active',
    stats: { id: 'st2', fortyYard: 4.42, shuttle: 4.05, vertical: 38, bench: 185, squat: 365, broad: 10.2, sportMetrics: { receptions: 68, receivingYards: 1100, touchdowns: 14 } },
    academics: { id: 'ac2', gpa: 3.2, satScore: 1050, actScore: 22, school: 'Westfield High School', gradYear: 2027, intendedMajor: 'Communications', ncaaEligible: true, coreGpa: 3.0 },
    stage: STAGES[1], stageId: 's2', stageOrder: 0,
    notes: [], evaluations: [], videos: [], visits: [], contactLogs: [], emails: [],
    programId: 'p1', createdAt: '2025-10-01T08:00:00Z', updatedAt: '2026-02-18T11:00:00Z',
  },
  {
    id: 'pr3', firstName: 'DeAndre', lastName: 'Williams', bio: 'Explosive edge rusher with a relentless motor.',
    email: 'dwilliams@email.com', phone: '555-0103', imageUrl: null,
    position: 'DE', height: '6\'3"', weight: 235, highSchool: 'North Shore HS', clubTeam: null,
    city: 'Chicago', state: 'IL', zipCode: '60601', hudlUrl: 'https://hudl.com/v/example3',
    twitterUrl: null, instagramUrl: null, tags: ['High Motor', 'Camp Invite'],
    commitmentScore: 85, classYear: 2027, status: 'active',
    stats: { id: 'st3', fortyYard: 4.68, shuttle: 4.22, vertical: 32, bench: 275, squat: 455, broad: 9.5, sportMetrics: { sacks: 14, tackles: 78, forcedFumbles: 4 } },
    academics: { id: 'ac3', gpa: 3.8, satScore: 1220, actScore: 27, school: 'North Shore High School', gradYear: 2027, intendedMajor: 'Engineering', ncaaEligible: true, coreGpa: 3.6 },
    stage: STAGES[3], stageId: 's4', stageOrder: 0,
    notes: [], evaluations: [], videos: [], visits: [], contactLogs: [], emails: [],
    programId: 'p1', createdAt: '2025-08-20T09:00:00Z', updatedAt: '2026-02-25T16:00:00Z',
  },
  {
    id: 'pr4', firstName: 'Khalil', lastName: 'Brown', bio: 'Versatile LB with great coverage skills and leadership.',
    email: 'kbrown@email.com', phone: '555-0104', imageUrl: null,
    position: 'LB', height: '6\'1"', weight: 220, highSchool: 'Central Academy', clubTeam: null,
    city: 'Nashville', state: 'TN', zipCode: '37201', hudlUrl: 'https://hudl.com/v/example4',
    twitterUrl: null, instagramUrl: null, tags: ['Team Captain', 'Multi-Sport'],
    commitmentScore: 91, classYear: 2027, status: 'committed',
    stats: { id: 'st4', fortyYard: 4.58, shuttle: 4.08, vertical: 35, bench: 255, squat: 425, broad: 9.9, sportMetrics: { tackles: 112, interceptions: 3, sacks: 6 } },
    academics: { id: 'ac4', gpa: 3.9, satScore: 1280, actScore: 29, school: 'Central Academy', gradYear: 2027, intendedMajor: 'Pre-Med', ncaaEligible: true, coreGpa: 3.8 },
    stage: STAGES[4], stageId: 's5', stageOrder: 0,
    notes: [], evaluations: [], videos: [], visits: [], contactLogs: [], emails: [],
    programId: 'p1', createdAt: '2025-07-10T07:00:00Z', updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'pr5', firstName: 'Tyrese', lastName: 'Mitchell', bio: 'Rangy CB with elite ball skills and 4.3 speed.',
    email: 'tmitchell@email.com', phone: '555-0105', imageUrl: null,
    position: 'CB', height: '5\'11"', weight: 175, highSchool: 'Bishop Gorman', clubTeam: null,
    city: 'Las Vegas', state: 'NV', zipCode: '89101', hudlUrl: 'https://hudl.com/v/example5',
    twitterUrl: null, instagramUrl: null, tags: ['Track Star', 'All-Region'],
    commitmentScore: 55, classYear: 2028, status: 'active',
    stats: { id: 'st5', fortyYard: 4.38, shuttle: 3.98, vertical: 40, bench: 165, squat: 335, broad: 10.5, sportMetrics: { interceptions: 8, passBreakups: 16, tackles: 45 } },
    academics: { id: 'ac5', gpa: 3.1, satScore: 1020, actScore: 21, school: 'Bishop Gorman HS', gradYear: 2028, intendedMajor: 'Sports Science', ncaaEligible: true, coreGpa: 2.9 },
    stage: STAGES[0], stageId: 's1', stageOrder: 0,
    notes: [], evaluations: [], videos: [], visits: [], contactLogs: [], emails: [],
    programId: 'p1', createdAt: '2026-01-05T12:00:00Z', updatedAt: '2026-02-28T09:00:00Z',
  },
  {
    id: 'pr6', firstName: 'Andre', lastName: 'Davis', bio: 'Powerful RB with breakaway speed and pass-catching ability.',
    email: 'adavis@email.com', phone: '555-0106', imageUrl: null,
    position: 'RB', height: '5\'10"', weight: 200, highSchool: 'Mater Dei', clubTeam: null,
    city: 'Los Angeles', state: 'CA', zipCode: '90001', hudlUrl: 'https://hudl.com/v/example6',
    twitterUrl: null, instagramUrl: null, tags: ['Workhorse', 'Needs Academic Check'],
    commitmentScore: 44, classYear: 2027, status: 'active',
    stats: { id: 'st6', fortyYard: 4.48, shuttle: 4.10, vertical: 36, bench: 245, squat: 445, broad: 10.0, sportMetrics: { rushingYards: 1850, touchdowns: 22, yardsPerCarry: 7.2 } },
    academics: { id: 'ac6', gpa: 2.7, satScore: 940, actScore: 19, school: 'Mater Dei HS', gradYear: 2027, intendedMajor: 'Undecided', ncaaEligible: null, coreGpa: 2.5 },
    stage: STAGES[2], stageId: 's3', stageOrder: 1,
    notes: [], evaluations: [], videos: [], visits: [], contactLogs: [], emails: [],
    programId: 'p1', createdAt: '2025-11-01T10:00:00Z', updatedAt: '2026-02-22T13:00:00Z',
  },
  {
    id: 'pr7', firstName: 'Isaiah', lastName: 'Thompson', bio: 'Athletic TE with rare combination of size and speed.',
    email: 'ithompson@email.com', phone: '555-0107', imageUrl: null,
    position: 'TE', height: '6\'4"', weight: 230, highSchool: 'St. Thomas More', clubTeam: null,
    city: 'Philadelphia', state: 'PA', zipCode: '19101', hudlUrl: 'https://hudl.com/v/example7',
    twitterUrl: null, instagramUrl: null, tags: ['Matchup Nightmare', 'Priority'],
    commitmentScore: 72, classYear: 2027, status: 'active',
    stats: { id: 'st7', fortyYard: 4.62, shuttle: 4.18, vertical: 33, bench: 235, squat: 405, broad: 9.6, sportMetrics: { receptions: 42, receivingYards: 680, touchdowns: 8 } },
    academics: { id: 'ac7', gpa: 3.5, satScore: 1150, actScore: 24, school: 'St. Thomas More Academy', gradYear: 2027, intendedMajor: 'Finance', ncaaEligible: true, coreGpa: 3.3 },
    stage: STAGES[1], stageId: 's2', stageOrder: 1,
    notes: [], evaluations: [], videos: [], visits: [], contactLogs: [], emails: [],
    programId: 'p1', createdAt: '2025-10-15T14:00:00Z', updatedAt: '2026-02-24T11:00:00Z',
  },
  {
    id: 'pr8', firstName: 'Cameron', lastName: 'Lee', bio: 'Smart, technically-sound OL with dominant run blocking.',
    email: 'clee@email.com', phone: '555-0108', imageUrl: null,
    position: 'OL', height: '6\'5"', weight: 295, highSchool: 'Heritage HS', clubTeam: null,
    city: 'Dallas', state: 'TX', zipCode: '75201', hudlUrl: 'https://hudl.com/v/example8',
    twitterUrl: null, instagramUrl: null, tags: ['Anchor', 'All-State'],
    commitmentScore: 68, classYear: 2027, status: 'active',
    stats: { id: 'st8', fortyYard: 5.15, shuttle: 4.65, vertical: 26, bench: 315, squat: 525, broad: 8.2, sportMetrics: { pancakeBlocks: 48, sacksAllowed: 1 } },
    academics: { id: 'ac8', gpa: 3.3, satScore: 1100, actScore: 23, school: 'Heritage High School', gradYear: 2027, intendedMajor: 'Construction Mgmt', ncaaEligible: true, coreGpa: 3.1 },
    stage: STAGES[3], stageId: 's4', stageOrder: 1,
    notes: [], evaluations: [], videos: [], visits: [], contactLogs: [], emails: [],
    programId: 'p1', createdAt: '2025-09-01T08:00:00Z', updatedAt: '2026-02-26T15:00:00Z',
  },
];

// ─── Notes (for prospect pr1) ───────────────────────────────────────

export const NOTES: Note[] = [
  { id: 'n1', content: 'Strong camp showing — arm talent is legit. Good release mechanics.', isPinned: true, authorId: 'u1', authorName: 'Coach Rivera', prospectId: 'pr1', createdAt: '2026-02-15T10:30:00Z' },
  { id: 'n2', content: 'Spoke with HS coach — Marcus is a team leader and film junkie.', isPinned: false, authorId: 'u2', authorName: 'Coach Adams', prospectId: 'pr1', createdAt: '2026-02-10T14:00:00Z' },
  { id: 'n3', content: 'Family visited campus 2/8. Parents are very engaged, asking about academic support.', isPinned: false, authorId: 'u1', authorName: 'Coach Rivera', prospectId: 'pr1', createdAt: '2026-02-08T16:00:00Z' },
];

// ─── Evaluations (for prospect pr1) ─────────────────────────────────

export const EVALUATIONS: Evaluation[] = [
  { id: 'e1', overallScore: 8, athleticism: 8, academics: 7, character: 9, skillLevel: 8, comment: 'Top target at QB. Elite processing speed.', authorId: 'u1', authorName: 'Coach Rivera', prospectId: 'pr1', createdAt: '2026-02-12T09:00:00Z' },
  { id: 'e2', overallScore: 7, athleticism: 7, academics: 7, character: 8, skillLevel: 8, comment: 'Good upside. Needs strength development.', authorId: 'u2', authorName: 'Coach Adams', prospectId: 'pr1', createdAt: '2026-01-20T11:00:00Z' },
];

// ─── Videos (for prospect pr1) ──────────────────────────────────────

export const VIDEOS: Video[] = [
  {
    id: 'v1', title: 'Junior Season Highlights', url: 'https://hudl.com/v/example1', type: 'hudl', sourceType: 'link',
    sourceUrl: 'https://hudl.com/v/example1',
    thumbnailUrl: null, duration: 240, status: 'analyzed',
    aiTags: ['Pass', 'Scramble', 'Deep Ball', 'RPO'],
    aiMetrics: { completionRate: 67.4, avgDepthOfTarget: 12.3 },
    prospectId: 'pr1',
    clips: [
      { id: 'vc1', title: 'TD Pass — 4th Quarter', label: 'TD Pass — 4th Quarter', videoId: 'v1', startTime: 45, endTime: 58, rating: 5, tags: ['TD', 'Deep Ball'], notes: 'Perfect ball placement', shareToken: 'share_abc123', createdAt: '2026-02-15T10:00:00Z' },
      { id: 'vc2', title: 'Scramble — 3rd Down', label: 'Scramble — 3rd Down', videoId: 'v1', startTime: 102, endTime: 115, rating: 4, tags: ['Scramble', 'First Down'], notes: 'Great pocket awareness', shareToken: 'share_def456', createdAt: '2026-02-15T10:05:00Z' },
    ],
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'v2', title: 'Camp Throws Compilation', url: 'https://hudl.com/v/camp1', type: 'hudl', sourceType: 'link',
    sourceUrl: 'https://hudl.com/v/camp1',
    thumbnailUrl: null, duration: 180, status: 'analyzed',
    aiTags: ['Out Route', 'Slant', 'Fade', 'Seam'],
    aiMetrics: { armStrength: 8.2, releaseTime: 0.38 },
    prospectId: 'pr1', clips: [],
    createdAt: '2026-02-01T12:00:00Z',
  },
];

// ─── Compliance Events ──────────────────────────────────────────────

export const COMPLIANCE_EVENTS: ComplianceEvent[] = [
  { id: 'ce1', type: 'dead_period', title: 'Dead Period Violation Attempt', details: 'Coach Adams attempted to schedule a call during NCAA dead period. Action was blocked.', severity: 'warning', resolved: true, programId: 'p1', userId: 'u2', createdAt: '2026-02-20T09:00:00Z' },
  { id: 'ce2', type: 'contact_period', title: 'Contact Period Started', details: 'NCAA Contact Period begins for Spring 2026.', severity: 'info', resolved: false, programId: 'p1', userId: null, createdAt: '2026-03-01T00:00:00Z' },
  { id: 'ce3', type: 'visit', title: 'Official Visit Logged', details: 'Khalil Brown completed official visit. All forms on file.', severity: 'info', resolved: false, programId: 'p1', userId: 'u1', createdAt: '2026-02-08T17:00:00Z' },
  { id: 'ce4', type: 'evaluation', title: 'Evaluation Period Reminder', details: 'Spring evaluation period opens in 5 days.', severity: 'info', resolved: false, programId: 'p1', userId: null, createdAt: '2026-02-25T08:00:00Z' },
  { id: 'ce5', type: 'contact_period', title: 'Contact Limit Warning', details: 'Approaching weekly contact limit for Jaylen Carter (5/6 contacts used).', severity: 'warning', resolved: false, programId: 'p1', userId: 'u1', createdAt: '2026-02-27T14:00:00Z' },
];

// ─── Recruiting Periods ─────────────────────────────────────────────

export const RECRUITING_PERIODS: RecruitingPeriod[] = [
  { id: 'rp1', type: 'contact', sport: 'Football', startDate: '2026-01-15T00:00:00Z', endDate: '2026-02-28T23:59:00Z', description: 'Spring Contact Period', programId: 'p1' },
  { id: 'rp2', type: 'dead', sport: 'Football', startDate: '2026-02-16T00:00:00Z', endDate: '2026-02-22T23:59:00Z', description: 'Presidents Day Dead Period', programId: 'p1' },
  { id: 'rp3', type: 'quiet', sport: 'Football', startDate: '2026-03-01T00:00:00Z', endDate: '2026-03-15T23:59:00Z', description: 'Spring Quiet Period', programId: 'p1' },
  { id: 'rp4', type: 'evaluation', sport: 'Football', startDate: '2026-04-01T00:00:00Z', endDate: '2026-05-31T23:59:00Z', description: 'Spring Evaluation Period', programId: 'p1' },
  { id: 'rp5', type: 'dead', sport: 'Football', startDate: '2026-06-25T00:00:00Z', endDate: '2026-07-06T23:59:00Z', description: 'Summer Dead Period', programId: 'p1' },
  { id: 'rp6', type: 'contact', sport: 'Football', startDate: '2026-07-07T00:00:00Z', endDate: '2026-08-31T23:59:00Z', description: 'Summer Contact Period', programId: 'p1' },
];

// ─── Visits ─────────────────────────────────────────────────────────

export const VISITS: Visit[] = [
  { id: 'vi1', type: 'official', date: '2026-03-08T10:00:00Z', location: 'Main Campus', notes: 'Full day visit with academic tour', status: 'scheduled', prospectId: 'pr1', createdAt: '2026-02-20T10:00:00Z' },
  { id: 'vi2', type: 'unofficial', date: '2026-03-15T14:00:00Z', location: 'Athletic Complex', notes: 'Practice observation', status: 'scheduled', prospectId: 'pr2', createdAt: '2026-02-22T09:00:00Z' },
  { id: 'vi3', type: 'official', date: '2026-02-08T10:00:00Z', location: 'Main Campus', notes: 'Completed — great visit, family loved it', status: 'completed', prospectId: 'pr4', createdAt: '2026-01-25T08:00:00Z' },
  { id: 'vi4', type: 'junior_day', date: '2026-04-12T09:00:00Z', location: 'Stadium', notes: 'Spring game junior day event', status: 'scheduled', prospectId: 'pr5', createdAt: '2026-02-28T11:00:00Z' },
];

// ─── Dashboard Stats ────────────────────────────────────────────────

export const DASHBOARD_STATS: DashboardStats = {
  totalProspects: 142,
  activeProspects: 98,
  committed: 8,
  conversionRate: 14.2,
  upcomingVisits: 12,
  complianceAlerts: 3,
  emailsSentThisWeek: 47,
  avgEvalScore: 7.3,
};

// ─── Activity Feed ──────────────────────────────────────────────────

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'evaluation', title: 'New Evaluation', description: 'Coach Rivera rated Marcus Johnson 8/10', timestamp: '2026-03-02T09:15:00Z', prospectName: 'Marcus Johnson', userName: 'Coach Rivera' },
  { id: 'a2', type: 'stage_change', title: 'Stage Updated', description: 'DeAndre Williams moved to Offer stage', timestamp: '2026-03-01T16:30:00Z', prospectName: 'DeAndre Williams', userName: 'Coach Adams' },
  { id: 'a3', type: 'email', title: 'Email Sent', description: 'Follow-up email sent to Jaylen Carter', timestamp: '2026-03-01T14:00:00Z', prospectName: 'Jaylen Carter', userName: 'Coach Rivera' },
  { id: 'a4', type: 'visit', title: 'Visit Scheduled', description: 'Official visit for Marcus Johnson on Mar 8', timestamp: '2026-03-01T11:00:00Z', prospectName: 'Marcus Johnson', userName: 'Coach Rivera' },
  { id: 'a5', type: 'compliance', title: 'Compliance Alert', description: 'Quiet period begins March 1st', timestamp: '2026-03-01T00:00:00Z' },
  { id: 'a6', type: 'note', title: 'Note Added', description: 'Coach Adams added a note on Isaiah Thompson', timestamp: '2026-02-28T15:30:00Z', prospectName: 'Isaiah Thompson', userName: 'Coach Adams' },
  { id: 'a7', type: 'evaluation', title: 'New Evaluation', description: 'Coach Adams rated Cameron Lee 7/10', timestamp: '2026-02-28T10:00:00Z', prospectName: 'Cameron Lee', userName: 'Coach Adams' },
  { id: 'a8', type: 'stage_change', title: 'Pipeline Update', description: 'Khalil Brown moved to Committed', timestamp: '2026-02-27T09:00:00Z', prospectName: 'Khalil Brown', userName: 'Coach Rivera' },
];

// ─── Pipeline Metrics (for analytics) ───────────────────────────────

export const PIPELINE_METRICS: PipelineMetric[] = [
  // Conversion rates by stage
  { id: 'pm1', type: 'conversion_rate', dimension: 'Identified→Contacted', value: 72, metadata: null, programId: 'p1', period: '2025-2026', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm2', type: 'conversion_rate', dimension: 'Contacted→Evaluating', value: 45, metadata: null, programId: 'p1', period: '2025-2026', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm3', type: 'conversion_rate', dimension: 'Evaluating→Offer', value: 38, metadata: null, programId: 'p1', period: '2025-2026', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm4', type: 'conversion_rate', dimension: 'Offer→Commit', value: 52, metadata: null, programId: 'p1', period: '2025-2026', createdAt: '2026-03-01T00:00:00Z' },
  // Regional yield
  { id: 'pm5', type: 'regional_yield', dimension: 'Southeast', value: 34, metadata: { states: ['GA', 'FL', 'SC', 'NC', 'TN', 'AL'] }, programId: 'p1', period: '2025-2026', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm6', type: 'regional_yield', dimension: 'Southwest', value: 28, metadata: { states: ['TX', 'OK', 'AZ', 'NM'] }, programId: 'p1', period: '2025-2026', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm7', type: 'regional_yield', dimension: 'Northeast', value: 18, metadata: { states: ['PA', 'NJ', 'NY', 'CT', 'MA'] }, programId: 'p1', period: '2025-2026', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm8', type: 'regional_yield', dimension: 'Midwest', value: 12, metadata: { states: ['OH', 'IL', 'MI', 'IN', 'WI'] }, programId: 'p1', period: '2025-2026', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm9', type: 'regional_yield', dimension: 'West', value: 8, metadata: { states: ['CA', 'NV', 'OR', 'WA', 'CO'] }, programId: 'p1', period: '2025-2026', createdAt: '2026-03-01T00:00:00Z' },
  // Position fill rates
  { id: 'pm10', type: 'position_fill', dimension: 'QB', value: 1, metadata: { target: 2 }, programId: 'p1', period: '2027', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm11', type: 'position_fill', dimension: 'WR', value: 2, metadata: { target: 4 }, programId: 'p1', period: '2027', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm12', type: 'position_fill', dimension: 'RB', value: 0, metadata: { target: 2 }, programId: 'p1', period: '2027', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm13', type: 'position_fill', dimension: 'TE', value: 1, metadata: { target: 1 }, programId: 'p1', period: '2027', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm14', type: 'position_fill', dimension: 'OL', value: 1, metadata: { target: 3 }, programId: 'p1', period: '2027', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm15', type: 'position_fill', dimension: 'DE', value: 1, metadata: { target: 2 }, programId: 'p1', period: '2027', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm16', type: 'position_fill', dimension: 'LB', value: 1, metadata: { target: 3 }, programId: 'p1', period: '2027', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm17', type: 'position_fill', dimension: 'CB', value: 0, metadata: { target: 2 }, programId: 'p1', period: '2027', createdAt: '2026-03-01T00:00:00Z' },
  { id: 'pm18', type: 'position_fill', dimension: 'S', value: 0, metadata: { target: 2 }, programId: 'p1', period: '2027', createdAt: '2026-03-01T00:00:00Z' },
];
