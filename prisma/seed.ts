/**
 * ScoutVision — Database Seed Script
 * Run with: npx ts-node prisma/seed.ts
 * or via:   npx prisma db seed
 *
 * Seeds: Program, Roles, Users, Stages, Prospects (with Stats + Academics),
 *        Notes, Evaluations, ComplianceEvents, RecruitingPeriods, Visits,
 *        ContactLogs, PipelineMetrics, AIReports, Videos
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 18);
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting ScoutVision seed…');

  // ── Roles ────────────────────────────────────────────────────────

  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      id: 'role-admin',
      name: 'Admin',
      permissions: { manageUsers: true, manageProgram: true, viewAll: true, editAll: true },
    },
  });

  const coachRole = await prisma.role.upsert({
    where: { name: 'Coach' },
    update: {},
    create: {
      id: 'role-coach',
      name: 'Coach',
      permissions: { manageUsers: false, manageProgram: false, viewAll: true, editAll: true },
    },
  });

  const analystRole = await prisma.role.upsert({
    where: { name: 'Analyst' },
    update: {},
    create: {
      id: 'role-analyst',
      name: 'Analyst',
      permissions: { viewAll: true, editAll: false },
    },
  });

  console.log('  ✓ Roles');

  // ── Program ──────────────────────────────────────────────────────

  const program = await prisma.program.upsert({
    where: { id: 'prog-1' },
    update: {},
    create: {
      id: 'prog-1',
      name: 'State University Football',
      sport: 'Football',
      division: 'D1',
      conference: 'Sun Belt Conference',
      state: 'GA',
      primaryColor: '#1B3A6B',
      secondaryColor: '#E8B923',
      subscriptionTier: 'elite',
      maxUsers: 25,
      maxProspects: 500,
      maxStorage: 51200,
      features: {
        aiAnalysis: true,
        videoUpload: true,
        complianceMonitor: true,
        advancedAnalytics: true,
        apiAccess: true,
      },
    },
  });

  console.log('  ✓ Program');

  // ── Users ────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const userRivera = await prisma.user.upsert({
    where: { email: 'coach.rivera@stateu.edu' },
    update: {},
    create: {
      id: 'user-rivera',
      email: 'coach.rivera@stateu.edu',
      name: 'Coach Rivera',
      password: passwordHash,
      roleId: coachRole.id,
      programId: program.id,
      isActive: true,
      lastLoginAt: new Date('2026-06-02T08:15:00Z'),
      mfaEnabled: false,
      preferences: { theme: 'dark', defaultView: 'board', notifications: true },
    },
  });

  const userAdams = await prisma.user.upsert({
    where: { email: 'coach.adams@stateu.edu' },
    update: {},
    create: {
      id: 'user-adams',
      email: 'coach.adams@stateu.edu',
      name: 'Coach Adams',
      password: passwordHash,
      roleId: coachRole.id,
      programId: program.id,
      isActive: true,
      lastLoginAt: new Date('2026-06-02T09:00:00Z'),
      mfaEnabled: false,
      preferences: { theme: 'dark', defaultView: 'table', notifications: true },
    },
  });

  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin@stateu.edu' },
    update: {},
    create: {
      id: 'user-admin',
      email: 'admin@stateu.edu',
      name: 'Admin User',
      password: passwordHash,
      roleId: adminRole.id,
      programId: program.id,
      isActive: true,
      lastLoginAt: new Date('2026-06-01T14:00:00Z'),
      mfaEnabled: true,
      mfaSecret: process.env.SEED_MFA_SECRET ?? '',
      preferences: { theme: 'dark', notifications: true },
    },
  });

  const userMartinez = await prisma.user.upsert({
    where: { email: 'analyst.martinez@stateu.edu' },
    update: {},
    create: {
      id: 'user-martinez',
      email: 'analyst.martinez@stateu.edu',
      name: 'Sofia Martinez',
      password: passwordHash,
      roleId: analystRole.id,
      programId: program.id,
      isActive: true,
      lastLoginAt: new Date('2026-06-02T07:30:00Z'),
      mfaEnabled: false,
      preferences: { theme: 'dark', defaultView: 'table', notifications: true },
    },
  });

  console.log('  ✓ Users (4)');

  // ── Recruiting Stages ────────────────────────────────────────────

  const stageIds = {
    identified: 'stage-1',
    contacted:  'stage-2',
    evaluating: 'stage-3',
    offer:      'stage-4',
    committed:  'stage-5',
  };

  const stageData = [
    { id: stageIds.identified, name: 'Identified',  order: 0, color: '#6B7280' },
    { id: stageIds.contacted,  name: 'Contacted',   order: 1, color: '#3B82F6' },
    { id: stageIds.evaluating, name: 'Evaluating',  order: 2, color: '#F59E0B' },
    { id: stageIds.offer,      name: 'Offer',       order: 3, color: '#8B5CF6' },
    { id: stageIds.committed,  name: 'Committed',   order: 4, color: '#10B981' },
  ];

  for (const s of stageData) {
    await prisma.recruitingStage.upsert({
      where: { programId_order: { programId: program.id, order: s.order } },
      update: {},
      create: { ...s, programId: program.id },
    });
  }

  console.log('  ✓ Recruiting Stages');

  // ── Prospects ────────────────────────────────────────────────────

  const prospectsData = [
    {
      id: 'pr-1', firstName: 'Marcus', lastName: 'Johnson',
      bio: 'Elite dual-threat QB with exceptional pocket awareness and a cannon arm. Led Lincoln Prep to back-to-back state championships.',
      email: 'mjohnson@email.com', phone: '555-0101',
      position: 'QB', secondaryPosition: 'ATH', height: '6\'2"', weight: 205,
      highSchool: 'Lincoln Prep Academy', city: 'Atlanta', state: 'GA', zipCode: '30301',
      hudlUrl: 'https://hudl.com/v/example1',
      tags: ['Priority', 'Official Visit', 'All-State'],
      commitmentScore: 78, classYear: 2027, status: 'active', tier: 'priority',
      stageId: stageIds.evaluating, stageOrder: 0,
      stats: { fortyYard: 4.55, shuttle: 4.12, vertical: 34, bench: 225, squat: 405, broad: 9.8,
        sportMetrics: { passingYards: 3200, touchdowns: 32, interceptions: 6, completionPct: 67.4, rushingYards: 420, qbr: 91.2 } },
      academics: { gpa: 3.6, satScore: 1180, actScore: 25, school: 'Lincoln Prep Academy', gradYear: 2027, intendedMajor: 'Business', ncaaEligible: true, coreGpa: 3.4 },
    },
    {
      id: 'pr-2', firstName: 'Jaylen', lastName: 'Carter',
      bio: 'Physical WR with great route-running ability and reliable hands. Excellent separation at the top of routes.',
      email: 'jcarter@email.com', phone: '555-0102',
      position: 'WR', secondaryPosition: null, height: '6\'0"', weight: 185,
      highSchool: 'Westfield High School', city: 'Houston', state: 'TX', zipCode: '77001',
      hudlUrl: 'https://hudl.com/v/example2',
      tags: ['Sleeper', 'Film Reviewed', 'Top 50 TX'],
      commitmentScore: 62, classYear: 2027, status: 'active', tier: 'target',
      stageId: stageIds.contacted, stageOrder: 0,
      stats: { fortyYard: 4.42, shuttle: 4.05, vertical: 38, bench: 185, squat: 365, broad: 10.2,
        sportMetrics: { receptions: 68, receivingYards: 1100, touchdowns: 14, yardsPerReception: 16.2, drops: 3 } },
      academics: { gpa: 3.2, satScore: 1050, actScore: 22, school: 'Westfield High School', gradYear: 2027, intendedMajor: 'Communications', ncaaEligible: true, coreGpa: 3.0 },
    },
    {
      id: 'pr-3', firstName: 'DeAndre', lastName: 'Williams',
      bio: 'Explosive edge rusher with a relentless motor and elite first step. 14 sacks as a junior on minimal snaps.',
      email: 'dwilliams@email.com', phone: '555-0103',
      position: 'DE', secondaryPosition: 'OLB', height: '6\'3"', weight: 235,
      highSchool: 'North Shore High School', city: 'Chicago', state: 'IL', zipCode: '60601',
      hudlUrl: 'https://hudl.com/v/example3',
      tags: ['High Motor', 'Camp Invite', 'All-Region'],
      commitmentScore: 85, classYear: 2027, status: 'active', tier: 'priority',
      stageId: stageIds.offer, stageOrder: 0,
      stats: { fortyYard: 4.68, shuttle: 4.22, vertical: 32, bench: 275, squat: 455, broad: 9.5,
        sportMetrics: { sacks: 14, tackles: 78, tacklesForLoss: 22, forcedFumbles: 4, qbHits: 18 } },
      academics: { gpa: 3.8, satScore: 1220, actScore: 27, school: 'North Shore High School', gradYear: 2027, intendedMajor: 'Engineering', ncaaEligible: true, coreGpa: 3.6 },
    },
    {
      id: 'pr-4', firstName: 'Khalil', lastName: 'Brown',
      bio: 'Versatile LB with great coverage skills, elite instincts, and natural leadership — 3-year team captain.',
      email: 'kbrown@email.com', phone: '555-0104',
      position: 'LB', secondaryPosition: 'SS', height: '6\'1"', weight: 220,
      highSchool: 'Central Academy', city: 'Nashville', state: 'TN', zipCode: '37201',
      hudlUrl: 'https://hudl.com/v/example4',
      tags: ['Team Captain', 'Multi-Sport', 'Priority', 'Committed'],
      commitmentScore: 97, classYear: 2027, status: 'committed', tier: 'priority',
      stageId: stageIds.committed, stageOrder: 0,
      stats: { fortyYard: 4.58, shuttle: 4.08, vertical: 35, bench: 255, squat: 425, broad: 9.9,
        sportMetrics: { tackles: 112, soloTackles: 78, assistTackles: 34, interceptions: 3, sacks: 6, passBreakups: 8 } },
      academics: { gpa: 3.9, satScore: 1280, actScore: 29, school: 'Central Academy', gradYear: 2027, intendedMajor: 'Pre-Med', ncaaEligible: true, coreGpa: 3.8 },
    },
    {
      id: 'pr-5', firstName: 'Tyrese', lastName: 'Mitchell',
      bio: 'Rangy CB with elite ball skills and 4.3 speed. Two-sport athlete — All-State track in 100m and 200m.',
      email: 'tmitchell@email.com', phone: '555-0105',
      position: 'CB', secondaryPosition: null, height: '5\'11"', weight: 175,
      highSchool: 'Bishop Gorman High School', city: 'Las Vegas', state: 'NV', zipCode: '89101',
      hudlUrl: 'https://hudl.com/v/example5',
      tags: ['Track Star', 'All-Region', 'Early Contact'],
      commitmentScore: 55, classYear: 2028, status: 'active', tier: 'target',
      stageId: stageIds.identified, stageOrder: 0,
      stats: { fortyYard: 4.38, shuttle: 3.98, vertical: 40, bench: 165, squat: 335, broad: 10.5,
        sportMetrics: { interceptions: 8, passBreakups: 16, tackles: 45, forcedFumbles: 2 } },
      academics: { gpa: 3.1, satScore: 1020, actScore: 21, school: 'Bishop Gorman HS', gradYear: 2028, intendedMajor: 'Sports Science', ncaaEligible: true, coreGpa: 2.9 },
    },
    {
      id: 'pr-6', firstName: 'Andre', lastName: 'Davis',
      bio: 'Powerful RB with breakaway speed and exceptional pass-catching ability out of the backfield. Needs academic monitoring.',
      email: 'adavis@email.com', phone: '555-0106',
      position: 'RB', secondaryPosition: null, height: '5\'10"', weight: 200,
      highSchool: 'Mater Dei High School', city: 'Los Angeles', state: 'CA', zipCode: '90001',
      hudlUrl: 'https://hudl.com/v/example6',
      tags: ['Workhorse', 'Needs Academic Check', 'Camp Invite'],
      commitmentScore: 44, classYear: 2027, status: 'active', tier: 'sleeper',
      stageId: stageIds.evaluating, stageOrder: 1,
      stats: { fortyYard: 4.48, shuttle: 4.10, vertical: 36, bench: 245, squat: 445, broad: 10.0,
        sportMetrics: { rushingYards: 1850, touchdowns: 22, yardsPerCarry: 7.2, receptions: 34, receivingYards: 280 } },
      academics: { gpa: 2.7, satScore: 940, actScore: 19, school: 'Mater Dei HS', gradYear: 2027, intendedMajor: 'Undecided', ncaaEligible: null, coreGpa: 2.5 },
    },
    {
      id: 'pr-7', firstName: 'Isaiah', lastName: 'Thompson',
      bio: 'Athletic TE with rare combination of size and speed — blocks with power and runs routes like a WR.',
      email: 'ithompson@email.com', phone: '555-0107',
      position: 'TE', secondaryPosition: null, height: '6\'4"', weight: 230,
      highSchool: 'St. Thomas More Academy', city: 'Philadelphia', state: 'PA', zipCode: '19101',
      hudlUrl: 'https://hudl.com/v/example7',
      tags: ['Matchup Nightmare', 'Priority', 'Official Visit'],
      commitmentScore: 72, classYear: 2027, status: 'active', tier: 'priority',
      stageId: stageIds.contacted, stageOrder: 1,
      stats: { fortyYard: 4.62, shuttle: 4.18, vertical: 33, bench: 235, squat: 405, broad: 9.6,
        sportMetrics: { receptions: 42, receivingYards: 680, touchdowns: 8, yardsPerReception: 16.2, droppedPasses: 2 } },
      academics: { gpa: 3.5, satScore: 1150, actScore: 24, school: 'St. Thomas More Academy', gradYear: 2027, intendedMajor: 'Finance', ncaaEligible: true, coreGpa: 3.3 },
    },
    {
      id: 'pr-8', firstName: 'Cameron', lastName: 'Lee',
      bio: 'Smart, technically-sound OL with dominant run blocking and quick feet for pass protection. All-State selection.',
      email: 'clee@email.com', phone: '555-0108',
      position: 'OL', secondaryPosition: null, height: '6\'5"', weight: 295,
      highSchool: 'Heritage High School', city: 'Dallas', state: 'TX', zipCode: '75201',
      hudlUrl: 'https://hudl.com/v/example8',
      tags: ['Anchor', 'All-State', 'Film Reviewed'],
      commitmentScore: 68, classYear: 2027, status: 'active', tier: 'target',
      stageId: stageIds.offer, stageOrder: 1,
      stats: { fortyYard: 5.15, shuttle: 4.65, vertical: 26, bench: 315, squat: 525, broad: 8.2,
        sportMetrics: { pancakeBlocks: 48, sacksAllowed: 1, penaltiesAllowed: 2 } },
      academics: { gpa: 3.3, satScore: 1100, actScore: 23, school: 'Heritage High School', gradYear: 2027, intendedMajor: 'Construction Mgmt', ncaaEligible: true, coreGpa: 3.1 },
    },
    {
      id: 'pr-9', firstName: 'Darius', lastName: 'Cole',
      bio: 'Freakish safety with sideline-to-sideline range and a bone-crushing hit. Elite blitz packages make him a chess piece.',
      email: 'dcole@email.com', phone: '555-0109',
      position: 'S', secondaryPosition: 'LB', height: '6\'1"', weight: 205,
      highSchool: 'St. John Bosco', city: 'Bellflower', state: 'CA', zipCode: '90706',
      hudlUrl: 'https://hudl.com/v/example9',
      tags: ['Chess Piece', 'All-State', 'Priority'],
      commitmentScore: 81, classYear: 2027, status: 'active', tier: 'priority',
      stageId: stageIds.offer, stageOrder: 2,
      stats: { fortyYard: 4.45, shuttle: 4.10, vertical: 37, bench: 235, squat: 415, broad: 10.1,
        sportMetrics: { tackles: 94, interceptions: 5, passBreakups: 11, sacks: 3, forcedfumbles: 3 } },
      academics: { gpa: 3.4, satScore: 1130, actScore: 24, school: 'St. John Bosco', gradYear: 2027, intendedMajor: 'Criminal Justice', ncaaEligible: true, coreGpa: 3.2 },
    },
    {
      id: 'pr-10', firstName: 'Elijah', lastName: 'Torres',
      bio: 'Fluid, long-striding OT with ideal NFL frame. Still learning the position after moving from TE.',
      email: 'etorres@email.com', phone: '555-0110',
      position: 'OL', secondaryPosition: 'TE', height: '6\'6"', weight: 285,
      highSchool: 'IMG Academy', city: 'Bradenton', state: 'FL', zipCode: '34211',
      hudlUrl: 'https://hudl.com/v/example10',
      tags: ['High Ceiling', 'Developmental', 'IMG'],
      commitmentScore: 60, classYear: 2027, status: 'active', tier: 'target',
      stageId: stageIds.evaluating, stageOrder: 2,
      stats: { fortyYard: 5.05, shuttle: 4.55, vertical: 28, bench: 295, squat: 495, broad: 8.5,
        sportMetrics: { pancakeBlocks: 28, sacksAllowed: 4, penaltiesAllowed: 5 } },
      academics: { gpa: 3.0, satScore: 1000, actScore: 20, school: 'IMG Academy', gradYear: 2027, intendedMajor: 'Sports Management', ncaaEligible: true, coreGpa: 2.8 },
    },
    {
      id: 'pr-11', firstName: 'Jabari', lastName: 'Washington',
      bio: 'Explosive slot WR who wins with quickness in tight spaces. Top-15 WR nationally in class of 2028.',
      email: 'jwashington@email.com', phone: '555-0111',
      position: 'WR', secondaryPosition: null, height: '5\'10"', weight: 170,
      highSchool: 'Oak Ridge High School', city: 'Orlando', state: 'FL', zipCode: '32807',
      hudlUrl: 'https://hudl.com/v/example11',
      tags: ['Slot Specialist', 'Top 15 WR', 'Early Offer'],
      commitmentScore: 48, classYear: 2028, status: 'active', tier: 'target',
      stageId: stageIds.contacted, stageOrder: 2,
      stats: { fortyYard: 4.40, shuttle: 4.00, vertical: 39, bench: 155, squat: 315, broad: 10.4,
        sportMetrics: { receptions: 74, receivingYards: 1050, touchdowns: 11, yardsAfterCatch: 680 } },
      academics: { gpa: 3.3, satScore: 1080, actScore: 22, school: 'Oak Ridge High School', gradYear: 2028, intendedMajor: 'Business', ncaaEligible: true, coreGpa: 3.1 },
    },
    {
      id: 'pr-12', firstName: 'Marcus', lastName: 'Reed',
      bio: 'Three-down DT with rare athleticism for his size. Generates consistent penetration against D1-caliber OLs.',
      email: 'mreed@email.com', phone: '555-0112',
      position: 'DT', secondaryPosition: null, height: '6\'2"', weight: 295,
      highSchool: 'Booker T. Washington HS', city: 'Miami', state: 'FL', zipCode: '33136',
      hudlUrl: 'https://hudl.com/v/example12',
      tags: ['Underrated', 'Late Riser', 'Film Reviewed'],
      commitmentScore: 38, classYear: 2027, status: 'active', tier: 'sleeper',
      stageId: stageIds.identified, stageOrder: 1,
      stats: { fortyYard: 5.10, shuttle: 4.60, vertical: 24, bench: 350, squat: 575, broad: 7.8,
        sportMetrics: { sacks: 8, tackles: 62, tacklesForLoss: 14, qbHurries: 22 } },
      academics: { gpa: 2.9, satScore: 970, actScore: 20, school: 'Booker T. Washington HS', gradYear: 2027, intendedMajor: 'General Studies', ncaaEligible: true, coreGpa: 2.7 },
    },
    {
      id: 'pr-13', firstName: 'Trevor', lastName: 'Banks',
      bio: 'Traditional pro-style QB with excellent footwork, pre-snap IQ, and consistent accuracy in structured offenses.',
      email: 'tbanks@email.com', phone: '555-0113',
      position: 'QB', secondaryPosition: null, height: '6\'3"', weight: 215,
      highSchool: 'Hoover High School', city: 'Fresno', state: 'CA', zipCode: '93704',
      hudlUrl: 'https://hudl.com/v/example13',
      tags: ['Pro Style', 'Camp Invite', 'Film Reviewed'],
      commitmentScore: 55, classYear: 2027, status: 'active', tier: 'target',
      stageId: stageIds.evaluating, stageOrder: 3,
      stats: { fortyYard: 4.75, shuttle: 4.30, vertical: 30, bench: 210, squat: 380, broad: 9.2,
        sportMetrics: { passingYards: 2750, touchdowns: 24, interceptions: 9, completionPct: 61.8 } },
      academics: { gpa: 3.7, satScore: 1210, actScore: 26, school: 'Hoover High School', gradYear: 2027, intendedMajor: 'Computer Science', ncaaEligible: true, coreGpa: 3.5 },
    },
    {
      id: 'pr-14', firstName: 'Keondre', lastName: 'James',
      bio: 'Physical SS with elite zone-read instincts and special teams impact. Named defensive MVP of the all-star game.',
      email: 'kjames@email.com', phone: '555-0114',
      position: 'S', secondaryPosition: 'CB', height: '5\'11"', weight: 195,
      highSchool: 'Edna Karr High School', city: 'New Orleans', state: 'LA', zipCode: '70114',
      hudlUrl: 'https://hudl.com/v/example14',
      tags: ['Special Teams', 'All-State', 'Priority'],
      commitmentScore: 74, classYear: 2027, status: 'active', tier: 'priority',
      stageId: stageIds.offer, stageOrder: 3,
      stats: { fortyYard: 4.50, shuttle: 4.15, vertical: 36, bench: 225, squat: 390, broad: 9.8,
        sportMetrics: { tackles: 88, interceptions: 4, passBreakups: 12, specialTeamsTackles: 18 } },
      academics: { gpa: 3.5, satScore: 1120, actScore: 24, school: 'Edna Karr High School', gradYear: 2027, intendedMajor: 'Kinesiology', ncaaEligible: true, coreGpa: 3.3 },
    },
    {
      id: 'pr-15', firstName: 'Amir', lastName: 'Patel',
      bio: 'Technically refined ILB with a football IQ that belies his age. Already calling pre-snap adjustments as a junior.',
      email: 'apatel@email.com', phone: '555-0115',
      position: 'LB', secondaryPosition: null, height: '6\'0"', weight: 225,
      highSchool: 'Pinnacle High School', city: 'Phoenix', state: 'AZ', zipCode: '85024',
      hudlUrl: 'https://hudl.com/v/example15',
      tags: ['High IQ', 'Film Junkie', 'Academic Star'],
      commitmentScore: 66, classYear: 2027, status: 'active', tier: 'target',
      stageId: stageIds.evaluating, stageOrder: 4,
      stats: { fortyYard: 4.65, shuttle: 4.20, vertical: 31, bench: 265, squat: 430, broad: 9.4,
        sportMetrics: { tackles: 98, soloTackles: 67, sacks: 4, interceptions: 2, passBreakups: 6 } },
      academics: { gpa: 4.0, satScore: 1360, actScore: 31, school: 'Pinnacle High School', gradYear: 2027, intendedMajor: 'Biomedical Engineering', ncaaEligible: true, coreGpa: 3.9 },
    },
    {
      id: 'pr-16', firstName: 'Dante', lastName: 'Morrison',
      bio: 'Ferocious pass-rusher with advanced hand technique — his spin and chop combination is already college-ready.',
      email: 'dmorrison@email.com', phone: '555-0116',
      position: 'DE', secondaryPosition: null, height: '6\'4"', weight: 240,
      highSchool: 'Thompson High School', city: 'Alabaster', state: 'AL', zipCode: '35007',
      hudlUrl: 'https://hudl.com/v/example16',
      tags: ['Pass Rush Specialist', 'All-State', 'Priority'],
      commitmentScore: 79, classYear: 2027, status: 'active', tier: 'priority',
      stageId: stageIds.offer, stageOrder: 4,
      stats: { fortyYard: 4.72, shuttle: 4.25, vertical: 31, bench: 280, squat: 460, broad: 9.3,
        sportMetrics: { sacks: 12, tackles: 69, tacklesForLoss: 19, qbHurries: 24, forcedFumbles: 3 } },
      academics: { gpa: 3.2, satScore: 1060, actScore: 22, school: 'Thompson High School', gradYear: 2027, intendedMajor: 'Business Administration', ncaaEligible: true, coreGpa: 3.0 },
    },
    {
      id: 'pr-17', firstName: 'Ryan', lastName: 'Nguyen',
      bio: 'Shifty, electric RB who thrives in space. Great contact balance and vision to set up blocks.',
      email: 'rnguyen@email.com', phone: '555-0117',
      position: 'RB', secondaryPosition: 'WR', height: '5\'9"', weight: 185,
      highSchool: 'De La Salle High School', city: 'Concord', state: 'CA', zipCode: '94519',
      hudlUrl: 'https://hudl.com/v/example17',
      tags: ['Shifty', 'Multi-Sport', 'Official Visit'],
      commitmentScore: 70, classYear: 2027, status: 'active', tier: 'target',
      stageId: stageIds.evaluating, stageOrder: 5,
      stats: { fortyYard: 4.44, shuttle: 4.02, vertical: 37, bench: 195, squat: 355, broad: 10.3,
        sportMetrics: { rushingYards: 1620, touchdowns: 18, yardsPerCarry: 6.8, receptions: 28, receivingYards: 245 } },
      academics: { gpa: 3.4, satScore: 1140, actScore: 24, school: 'De La Salle HS', gradYear: 2027, intendedMajor: 'Marketing', ncaaEligible: true, coreGpa: 3.2 },
    },
    {
      id: 'pr-18', firstName: 'Myles', lastName: 'Freeman',
      bio: 'Big-bodied boundary CB who uses his wingspan to contest almost every throw. Physical press corner.',
      email: 'mfreeman@email.com', phone: '555-0118',
      position: 'CB', secondaryPosition: 'S', height: '6\'1"', weight: 185,
      highSchool: 'Colquitt County HS', city: 'Moultrie', state: 'GA', zipCode: '31768',
      hudlUrl: 'https://hudl.com/v/example18',
      tags: ['Press Corner', 'All-Region', 'Camp Invite'],
      commitmentScore: 58, classYear: 2027, status: 'active', tier: 'target',
      stageId: stageIds.contacted, stageOrder: 3,
      stats: { fortyYard: 4.50, shuttle: 4.12, vertical: 36, bench: 195, squat: 355, broad: 9.9,
        sportMetrics: { interceptions: 6, passBreakups: 18, tackles: 52, forcedFumbles: 1 } },
      academics: { gpa: 3.0, satScore: 1000, actScore: 21, school: 'Colquitt County HS', gradYear: 2027, intendedMajor: 'Physical Education', ncaaEligible: true, coreGpa: 2.8 },
    },
    {
      id: 'pr-19', firstName: 'Devon', lastName: 'Harris',
      bio: 'True dual-threat FB who can carry the load in short-yardage while serving as a lead blocker in the running game.',
      email: 'dharris@email.com', phone: '555-0119',
      position: 'RB', secondaryPosition: 'FB', height: '6\'0"', weight: 225,
      highSchool: 'Berea High School', city: 'Greenville', state: 'SC', zipCode: '29617',
      hudlUrl: 'https://hudl.com/v/example19',
      tags: ['Power Back', 'Lead Blocker', 'Senior Visit'],
      commitmentScore: 52, classYear: 2026, status: 'active', tier: 'depth',
      stageId: stageIds.identified, stageOrder: 2,
      stats: { fortyYard: 4.70, shuttle: 4.28, vertical: 29, bench: 285, squat: 475, broad: 8.9,
        sportMetrics: { rushingYards: 920, touchdowns: 12, yardsPerCarry: 4.8, downBlockingGrade: 88 } },
      academics: { gpa: 2.8, satScore: 960, actScore: 20, school: 'Berea High School', gradYear: 2026, intendedMajor: 'Education', ncaaEligible: true, coreGpa: 2.6 },
    },
    {
      id: 'pr-20', firstName: 'Caleb', lastName: 'Wilson',
      bio: 'Polished K/P specialist — touchbacks on 78% of kickoffs with a 44.6 punting average. Soccer background adds versatility.',
      email: 'cwilson@email.com', phone: '555-0120',
      position: 'K', secondaryPosition: 'P', height: '6\'0"', weight: 185,
      highSchool: 'Klein High School', city: 'Houston', state: 'TX', zipCode: '77066',
      hudlUrl: 'https://hudl.com/v/example20',
      tags: ['Specialist', 'Soccer Background', 'All-Region'],
      commitmentScore: 84, classYear: 2027, status: 'active', tier: 'target',
      stageId: stageIds.committed, stageOrder: 1,
      stats: { fortyYard: 4.90, shuttle: 4.45, vertical: 28, bench: 175, squat: 295, broad: 8.6,
        sportMetrics: { fgPct: 0.82, longFg: 52, touchbackPct: 0.78, puntAverage: 44.6, insideTwentyPct: 0.62 } },
      academics: { gpa: 3.6, satScore: 1200, actScore: 26, school: 'Klein High School', gradYear: 2027, intendedMajor: 'Engineering', ncaaEligible: true, coreGpa: 3.4 },
    },
  ];

  for (const p of prospectsData) {
    const { stats, academics, ...prospectFields } = p;
    await prisma.prospect.upsert({
      where: { id: p.id },
      update: {},
      create: {
        ...prospectFields,
        programId: program.id,
        stats: stats ? { create: stats } : undefined,
        academics: academics ? { create: academics } : undefined,
      },
    });
  }

  console.log(`  ✓ Prospects (${prospectsData.length})`);

  // ── Notes ────────────────────────────────────────────────────────

  const notesData = [
    { id: 'note-1', content: 'Strong camp showing — arm talent is legit. Elite release mechanics and touch on the deep ball.', isPinned: true, authorId: userRivera.id, prospectId: 'pr-1' },
    { id: 'note-2', content: 'Spoke with HS coach — Marcus is a team leader and a film junkie. First one in, last one out.', isPinned: false, authorId: userAdams.id, prospectId: 'pr-1' },
    { id: 'note-3', content: 'Family visited campus 4/18. Parents are very engaged, asking about academic support programs and tutoring.', isPinned: false, authorId: userRivera.id, prospectId: 'pr-1' },
    { id: 'note-4', content: 'Offered scholarship. Marcus indicated he wants to announce decision by July 4th.', isPinned: true, authorId: userRivera.id, prospectId: 'pr-1' },
    { id: 'note-5', content: 'Great film session — Jaylen\'s route-running fundamentals are ahead of his class. Curl and dig routes elite.', isPinned: false, authorId: userAdams.id, prospectId: 'pr-2' },
    { id: 'note-6', content: 'Called family — interested but needs to see offer before committing fully. Dad played D2.', isPinned: false, authorId: userRivera.id, prospectId: 'pr-2' },
    { id: 'note-7', content: 'DeAndre is the real deal. First step is top-5 nationally for his class. Needs a camp invite for official measurements.', isPinned: true, authorId: userMartinez.id, prospectId: 'pr-3' },
    { id: 'note-8', content: 'Extended offer on 3/12. DeAndre excited — told us we\'re the frontrunner but he wants to take other visits.', isPinned: true, authorId: userRivera.id, prospectId: 'pr-3' },
    { id: 'note-9', content: 'Khalil committed on 4/1. Outstanding character — called both coaches personally to share the news.', isPinned: true, authorId: userRivera.id, prospectId: 'pr-4' },
    { id: 'note-10', content: 'Tyrese is raw but the athleticism is real. 4.38 hand-timed at his school camp. Need to get him on campus.', isPinned: false, authorId: userAdams.id, prospectId: 'pr-5' },
    { id: 'note-11', content: 'Academic concern — Andre\'s core GPA may be below threshold. Request official transcript before extending offer.', isPinned: true, authorId: userRivera.id, prospectId: 'pr-6' },
    { id: 'note-12', content: 'Isaiah is a priority TE. His receiving metrics at the high school level rival D1 players. Set up official visit.', isPinned: true, authorId: userAdams.id, prospectId: 'pr-7' },
    { id: 'note-13', content: 'Cameron\'s film vs. nationally ranked DL is impressive — zero sacks allowed in 3 big games. Offer extended.', isPinned: true, authorId: userRivera.id, prospectId: 'pr-8' },
    { id: 'note-14', content: 'Darius has NFL-caliber range. Tracked him at two games this month — he erases an entire side of the field.', isPinned: true, authorId: userMartinez.id, prospectId: 'pr-9' },
    { id: 'note-15', content: 'Amir\'s academic profile is remarkable — 4.0 GPA with a 31 ACT. Coaches can recruit him on character alone.', isPinned: false, authorId: userAdams.id, prospectId: 'pr-15' },
  ];

  for (const n of notesData) {
    await prisma.note.upsert({
      where: { id: n.id },
      update: {},
      create: { ...n, createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) },
    });
  }

  console.log(`  ✓ Notes (${notesData.length})`);

  // ── Evaluations ──────────────────────────────────────────────────

  const evaluationsData = [
    { id: 'eval-1', overallScore: 9, athleticism: 8, academics: 8, character: 9, skillLevel: 9, comment: 'Top QB target. Elite arm + processing speed. A+ recruit.', authorId: userRivera.id, prospectId: 'pr-1' },
    { id: 'eval-2', overallScore: 8, athleticism: 8, academics: 7, character: 9, skillLevel: 8, comment: 'Great camp showing. Needs strength development entering college.', authorId: userAdams.id, prospectId: 'pr-1' },
    { id: 'eval-3', overallScore: 7, athleticism: 8, academics: 7, character: 8, skillLevel: 7, comment: 'WR1 quality. Route running is refined, hands need work.', authorId: userAdams.id, prospectId: 'pr-2' },
    { id: 'eval-4', overallScore: 9, athleticism: 9, academics: 8, character: 9, skillLevel: 9, comment: 'Elite DE prospect. First step and motor are D1-ready today.', authorId: userRivera.id, prospectId: 'pr-3' },
    { id: 'eval-5', overallScore: 8, athleticism: 9, academics: 8, character: 9, skillLevel: 8, comment: 'Explosive off the line. Power needs to catch up with speed.', authorId: userMartinez.id, prospectId: 'pr-3' },
    { id: 'eval-6', overallScore: 10, athleticism: 9, academics: 10, character: 10, skillLevel: 9, comment: 'Complete player. Khalil is the model recruit — glad he committed.', authorId: userRivera.id, prospectId: 'pr-4' },
    { id: 'eval-7', overallScore: 8, athleticism: 10, academics: 7, character: 9, skillLevel: 7, comment: 'Elite speed — top percentile CB. Needs polish in press technique.', authorId: userAdams.id, prospectId: 'pr-5' },
    { id: 'eval-8', overallScore: 6, athleticism: 8, academics: 5, character: 8, skillLevel: 7, comment: 'Great back, but academic eligibility is a real concern. Monitor closely.', authorId: userRivera.id, prospectId: 'pr-6' },
    { id: 'eval-9', overallScore: 8, athleticism: 8, academics: 8, character: 9, skillLevel: 8, comment: 'Isaiah is our best TE option. Rare combo of size, speed, and hands.', authorId: userAdams.id, prospectId: 'pr-7' },
    { id: 'eval-10', overallScore: 8, athleticism: 7, academics: 8, character: 9, skillLevel: 9, comment: 'Cameron is technically elite at OL. Will start Day 1 if we land him.', authorId: userRivera.id, prospectId: 'pr-8' },
    { id: 'eval-11', overallScore: 9, athleticism: 9, academics: 8, character: 9, skillLevel: 9, comment: 'Darius is a tone-setter on defense. Range and hitting ability = elite.', authorId: userMartinez.id, prospectId: 'pr-9' },
    { id: 'eval-12', overallScore: 9, athleticism: 10, academics: 10, character: 10, skillLevel: 8, comment: 'Amir has the highest football IQ of any LB in our pipeline. Academic star.', authorId: userAdams.id, prospectId: 'pr-15' },
    { id: 'eval-13', overallScore: 8, athleticism: 8, academics: 7, character: 8, skillLevel: 8, comment: 'Ryan is a complete back — yards after contact are elite. Want him for 2027.', authorId: userRivera.id, prospectId: 'pr-17' },
    { id: 'eval-14', overallScore: 9, athleticism: 9, academics: 8, character: 9, skillLevel: 9, comment: 'Dante is our best available DE outside of DeAndre. Needs to get here fast.', authorId: userRivera.id, prospectId: 'pr-16' },
  ];

  for (const e of evaluationsData) {
    await prisma.evaluation.upsert({
      where: { id: e.id },
      update: {},
      create: { ...e, createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000) },
    });
  }

  console.log(`  ✓ Evaluations (${evaluationsData.length})`);

  // ── Compliance Events ────────────────────────────────────────────

  const complianceEventsData = [
    { id: 'ce-1', type: 'dead_period', title: 'Dead Period Violation Attempt', details: 'Coach Adams attempted to schedule a call during NCAA dead period. Action was blocked by the system compliance guard.', severity: 'warning', resolved: true, programId: program.id, userId: userAdams.id, createdAt: new Date('2026-02-20T09:00:00Z') },
    { id: 'ce-2', type: 'contact_period', title: 'Contact Period Started', details: 'NCAA Contact Period begins for Spring 2026. Staff notified via system alert.', severity: 'info', resolved: false, programId: program.id, userId: null, createdAt: new Date('2026-03-01T00:00:00Z') },
    { id: 'ce-3', type: 'visit', title: 'Official Visit Logged — Khalil Brown', details: 'Khalil Brown completed official visit on 2/8. All required forms on file. Meals, lodging, and transportation documented.', severity: 'info', resolved: true, programId: program.id, userId: userRivera.id, createdAt: new Date('2026-02-08T17:00:00Z') },
    { id: 'ce-4', type: 'evaluation', title: 'Evaluation Period Reminder', details: 'Spring evaluation period opens in 5 days. Coaches may attend off-campus events beginning April 1st.', severity: 'info', resolved: false, programId: program.id, userId: null, createdAt: new Date('2026-03-27T08:00:00Z') },
    { id: 'ce-5', type: 'contact_period', title: 'Contact Limit Warning', details: 'Approaching weekly contact limit for Jaylen Carter (5/6 contacts used this week). One contact remaining.', severity: 'warning', resolved: false, programId: program.id, userId: userRivera.id, createdAt: new Date('2026-05-27T14:00:00Z') },
    { id: 'ce-6', type: 'visit', title: 'Official Visit Scheduled — Marcus Johnson', details: 'Official visit for Marcus Johnson scheduled for June 8. Confirmed by prospect and family.', severity: 'info', resolved: false, programId: program.id, userId: userRivera.id, createdAt: new Date('2026-05-15T10:00:00Z') },
    { id: 'ce-7', type: 'dead_period', title: 'Summer Dead Period Upcoming', details: 'NCAA Summer Dead Period begins June 25. No in-person contact with prospects June 25 – July 6.', severity: 'warning', resolved: false, programId: program.id, userId: null, createdAt: new Date('2026-06-01T08:00:00Z') },
    { id: 'ce-8', type: 'evaluation', title: 'Evaluation Period Ends', details: 'Spring evaluation period closed May 31. All evaluation reports must be submitted by June 5.', severity: 'info', resolved: false, programId: program.id, userId: null, createdAt: new Date('2026-05-31T23:59:00Z') },
    { id: 'ce-9', type: 'contact_period', title: 'Phone Call Documentation Missing', details: 'Call with DeAndre Williams on 5/30 was not logged within 24 hours as required. Please log promptly.', severity: 'warning', resolved: false, programId: program.id, userId: userAdams.id, createdAt: new Date('2026-06-01T09:00:00Z') },
    { id: 'ce-10', type: 'visit', title: 'Junior Day Completed', details: 'Junior Day event on April 12 completed successfully. 14 prospects attended. All attendance documented.', severity: 'info', resolved: true, programId: program.id, userId: userRivera.id, createdAt: new Date('2026-04-12T18:00:00Z') },
    { id: 'ce-11', type: 'contact_period', title: 'Quiet Period Begins', details: 'NCAA Quiet Period begins March 1 — coaches may not attend events in-person but may contact prospects via phone/email.', severity: 'info', resolved: false, programId: program.id, userId: null, createdAt: new Date('2026-03-01T00:00:00Z') },
    { id: 'ce-12', type: 'visit', title: 'Unofficial Visit — Isaiah Thompson', details: 'Isaiah Thompson visited campus unofficially on 5/15. Documented per NCAA rules. No expenses paid by program.', severity: 'info', resolved: true, programId: program.id, userId: userAdams.id, createdAt: new Date('2026-05-15T17:00:00Z') },
  ];

  for (const ce of complianceEventsData) {
    await prisma.complianceEvent.upsert({
      where: { id: ce.id },
      update: {},
      create: ce,
    });
  }

  console.log(`  ✓ Compliance Events (${complianceEventsData.length})`);

  // ── Recruiting Periods ───────────────────────────────────────────

  const periodsData = [
    { id: 'rp-1', type: 'contact', sport: 'Football', startDate: new Date('2026-01-15'), endDate: new Date('2026-02-28'), description: 'Winter Contact Period', programId: program.id },
    { id: 'rp-2', type: 'dead', sport: 'Football', startDate: new Date('2026-02-16'), endDate: new Date('2026-02-22'), description: "Presidents Day Dead Period", programId: program.id },
    { id: 'rp-3', type: 'quiet', sport: 'Football', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31'), description: 'Spring Quiet Period', programId: program.id },
    { id: 'rp-4', type: 'evaluation', sport: 'Football', startDate: new Date('2026-04-01'), endDate: new Date('2026-05-31'), description: 'Spring Evaluation Period', programId: program.id },
    { id: 'rp-5', type: 'dead', sport: 'Football', startDate: new Date('2026-06-25'), endDate: new Date('2026-07-06'), description: 'Summer Dead Period', programId: program.id },
    { id: 'rp-6', type: 'contact', sport: 'Football', startDate: new Date('2026-07-07'), endDate: new Date('2026-08-31'), description: 'Summer Contact Period', programId: program.id },
  ];

  for (const rp of periodsData) {
    await prisma.recruitingPeriod.upsert({
      where: { id: rp.id },
      update: {},
      create: rp,
    });
  }

  console.log(`  ✓ Recruiting Periods`);

  // ── Visits ───────────────────────────────────────────────────────

  const visitsData = [
    { id: 'vi-1', type: 'official', date: new Date('2026-06-08T10:00:00Z'), location: 'Main Campus & Athletic Complex', notes: 'Full day official visit — campus tour, academic meeting, facility tour', status: 'scheduled', prospectId: 'pr-1' },
    { id: 'vi-2', type: 'unofficial', date: new Date('2026-06-15T14:00:00Z'), location: 'Athletic Complex', notes: 'Practice observation — Jaylen coming with his father', status: 'scheduled', prospectId: 'pr-2' },
    { id: 'vi-3', type: 'official', date: new Date('2026-02-08T10:00:00Z'), location: 'Main Campus', notes: 'Completed — great visit, family loved campus and staff. Led to commitment.', status: 'completed', prospectId: 'pr-4' },
    { id: 'vi-4', type: 'junior_day', date: new Date('2026-04-12T09:00:00Z'), location: 'Spring Game & Stadium', notes: 'Junior Day — attended spring game, 14 prospects total', status: 'completed', prospectId: 'pr-5' },
    { id: 'vi-5', type: 'unofficial', date: new Date('2026-05-15T13:00:00Z'), location: 'Athletic Complex', notes: 'Isaiah impressed with weight room and film room setup.', status: 'completed', prospectId: 'pr-7' },
    { id: 'vi-6', type: 'official', date: new Date('2026-06-20T10:00:00Z'), location: 'Main Campus', notes: 'DeAndre official visit — confirmed via phone 6/1', status: 'scheduled', prospectId: 'pr-3' },
    { id: 'vi-7', type: 'unofficial', date: new Date('2026-06-12T11:00:00Z'), location: 'Football Facility', notes: 'Cameron coming to campus with his HS OL coach.', status: 'scheduled', prospectId: 'pr-8' },
    { id: 'vi-8', type: 'junior_day', date: new Date('2026-07-15T09:00:00Z'), location: 'Stadium & Athletic Facilities', notes: '7-on-7 summer camp with official junior day portion', status: 'scheduled', prospectId: 'pr-11' },
  ];

  for (const v of visitsData) {
    await prisma.visit.upsert({
      where: { id: v.id },
      update: {},
      create: { ...v, createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) },
    });
  }

  console.log(`  ✓ Visits (${visitsData.length})`);

  // ── Contact Logs ─────────────────────────────────────────────────

  const contactLogsData = [
    { id: 'cl-1', type: 'call', direction: 'outbound', summary: 'Called Marcus to discuss academic programs and scholarship details.', duration: 18, prospectId: 'pr-1', userId: userRivera.id, occurredAt: new Date('2026-05-28T10:00:00Z') },
    { id: 'cl-2', type: 'call', direction: 'outbound', summary: 'Check-in call with Jaylen. He is visiting two other programs next week.', duration: 12, prospectId: 'pr-2', userId: userAdams.id, occurredAt: new Date('2026-05-27T14:00:00Z') },
    { id: 'cl-3', type: 'text', direction: 'outbound', summary: 'Sent camp schedule to DeAndre. He responded positively.', duration: null, prospectId: 'pr-3', userId: userRivera.id, occurredAt: new Date('2026-05-30T09:00:00Z') },
    { id: 'cl-4', type: 'in-person', direction: 'outbound', summary: 'Watched Khalil at spring practice — outstanding effort.', duration: 120, prospectId: 'pr-4', userId: userRivera.id, occurredAt: new Date('2026-04-22T16:00:00Z') },
    { id: 'cl-5', type: 'call', direction: 'outbound', summary: 'Called Cameron to discuss official visit logistics.', duration: 8, prospectId: 'pr-8', userId: userAdams.id, occurredAt: new Date('2026-06-01T11:00:00Z') },
    { id: 'cl-6', type: 'social', direction: 'outbound', summary: 'Engaged with Tyrese\'s Twitter highlights post.', duration: null, prospectId: 'pr-5', userId: userMartinez.id, occurredAt: new Date('2026-05-25T15:00:00Z') },
    { id: 'cl-7', type: 'call', direction: 'inbound', summary: 'Isaiah\'s father called to ask about transfer portal and starting timeline.', duration: 22, prospectId: 'pr-7', userId: userRivera.id, occurredAt: new Date('2026-05-29T13:00:00Z') },
    { id: 'cl-8', type: 'text', direction: 'outbound', summary: 'Sent highlight-reel follow-up to Darius with personalized analysis note.', duration: null, prospectId: 'pr-9', userId: userMartinez.id, occurredAt: new Date('2026-06-02T08:30:00Z') },
  ];

  for (const cl of contactLogsData) {
    await prisma.contactLog.upsert({
      where: { id: cl.id },
      update: {},
      create: { ...cl, createdAt: cl.occurredAt },
    });
  }

  console.log(`  ✓ Contact Logs (${contactLogsData.length})`);

  // ── Pipeline Metrics ─────────────────────────────────────────────

  const metricsData = [
    // Conversion rates
    { id: 'pm-1', type: 'conversion_rate', dimension: 'Identified→Contacted', value: 72, metadata: null, programId: program.id, period: '2025-2026' },
    { id: 'pm-2', type: 'conversion_rate', dimension: 'Contacted→Evaluating', value: 55, metadata: null, programId: program.id, period: '2025-2026' },
    { id: 'pm-3', type: 'conversion_rate', dimension: 'Evaluating→Offer', value: 42, metadata: null, programId: program.id, period: '2025-2026' },
    { id: 'pm-4', type: 'conversion_rate', dimension: 'Offer→Commit', value: 48, metadata: null, programId: program.id, period: '2025-2026' },
    // Regional yield
    { id: 'pm-5', type: 'regional_yield', dimension: 'Southeast', value: 38, metadata: { states: ['GA', 'FL', 'SC', 'NC', 'TN', 'AL'] }, programId: program.id, period: '2025-2026' },
    { id: 'pm-6', type: 'regional_yield', dimension: 'Southwest', value: 24, metadata: { states: ['TX', 'OK', 'AZ', 'NM'] }, programId: program.id, period: '2025-2026' },
    { id: 'pm-7', type: 'regional_yield', dimension: 'Northeast', value: 14, metadata: { states: ['PA', 'NJ', 'NY', 'CT', 'MA'] }, programId: program.id, period: '2025-2026' },
    { id: 'pm-8', type: 'regional_yield', dimension: 'Midwest', value: 12, metadata: { states: ['OH', 'IL', 'MI', 'IN', 'WI'] }, programId: program.id, period: '2025-2026' },
    { id: 'pm-9', type: 'regional_yield', dimension: 'West', value: 12, metadata: { states: ['CA', 'NV', 'OR', 'WA', 'CO'] }, programId: program.id, period: '2025-2026' },
    // Position fill rates — 2027 class
    { id: 'pm-10', type: 'position_fill', dimension: 'QB', value: 1, metadata: { target: 2 }, programId: program.id, period: '2027' },
    { id: 'pm-11', type: 'position_fill', dimension: 'WR', value: 2, metadata: { target: 4 }, programId: program.id, period: '2027' },
    { id: 'pm-12', type: 'position_fill', dimension: 'RB', value: 1, metadata: { target: 2 }, programId: program.id, period: '2027' },
    { id: 'pm-13', type: 'position_fill', dimension: 'TE', value: 1, metadata: { target: 1 }, programId: program.id, period: '2027' },
    { id: 'pm-14', type: 'position_fill', dimension: 'OL', value: 2, metadata: { target: 4 }, programId: program.id, period: '2027' },
    { id: 'pm-15', type: 'position_fill', dimension: 'DE', value: 1, metadata: { target: 2 }, programId: program.id, period: '2027' },
    { id: 'pm-16', type: 'position_fill', dimension: 'LB', value: 1, metadata: { target: 3 }, programId: program.id, period: '2027' },
    { id: 'pm-17', type: 'position_fill', dimension: 'CB', value: 1, metadata: { target: 2 }, programId: program.id, period: '2027' },
    { id: 'pm-18', type: 'position_fill', dimension: 'S', value: 1, metadata: { target: 2 }, programId: program.id, period: '2027' },
    { id: 'pm-19', type: 'position_fill', dimension: 'K/P', value: 1, metadata: { target: 1 }, programId: program.id, period: '2027' },
  ];

  for (const m of metricsData) {
    await prisma.pipelineMetric.upsert({
      where: { id: m.id },
      update: {},
      create: { ...m, createdAt: new Date('2026-06-01T00:00:00Z') },
    });
  }

  console.log(`  ✓ Pipeline Metrics (${metricsData.length})`);

  // ── AI Reports ───────────────────────────────────────────────────

  const aiReportsData = [
    {
      id: 'air-1',
      prospectId: 'pr-1',
      sport: 'football',
      overallGrade: 'A',
      summary: 'Marcus Johnson is a franchise-caliber QB prospect with elite arm talent, rare processing speed, and proven leadership credentials. His ability to extend plays with his legs while maintaining accuracy downfield separates him from peers.',
      strengths: ['Elite arm strength — consistent deep ball to 55+ yards', 'Pre-snap read progression is college-ready', 'High completion percentage under pressure', 'Natural leadership and accountability'],
      weaknesses: ['Below-average weight room numbers for the position', 'Limited experience against elite defensive fronts', 'Could improve footwork in the pocket under duress'],
      projections: [
        { category: 'Arm Strength', current: 82, projected: 91, confidence: 87 },
        { category: 'Accuracy', current: 79, projected: 88, confidence: 84 },
        { category: 'Mobility', current: 74, projected: 80, confidence: 80 },
        { category: 'Leadership', current: 88, projected: 92, confidence: 90 },
      ],
      comparisons: [
        { playerName: 'Sam Howell (UNC 2020)', similarity: 81, reason: 'Similar dual-threat profile, processing speed, and completion % trajectory' },
        { playerName: 'Grayson McCall (Coastal Carolina)', similarity: 74, reason: 'Similar decision-making speed and clutch performance metrics' },
      ],
      recommendation: 'Extend scholarship offer immediately. Marcus is a top-10 QB in the 2027 class and will have multiple P5 offers. Move quickly.',
      fitScore: 91,
      recruitingPriority: 'must-have',
    },
    {
      id: 'air-2',
      prospectId: 'pr-3',
      sport: 'football',
      overallGrade: 'A-',
      summary: 'DeAndre Williams is an elite edge-rushing prospect with a first step that ranks in the 98th percentile nationally. His non-stop motor and developing hand technique project him as a Day 2–3 NFL Draft pick within 3 years.',
      strengths: ['98th-percentile first step quickness', 'Elite sack production (14 as a junior)', 'High motor — maximum effort every snap', 'Strong academic profile (3.8 GPA) reduces roster risk'],
      weaknesses: ['Point-of-attack strength is developmental', 'Limited counter moves beyond swim and rip', 'Against elite OL, gaps emerge in pass-rush plan'],
      projections: [
        { category: 'Pass Rush', current: 89, projected: 95, confidence: 88 },
        { category: 'Run Defense', current: 71, projected: 83, confidence: 82 },
        { category: 'Athleticism', current: 91, projected: 93, confidence: 92 },
        { category: 'Hand Technique', current: 68, projected: 82, confidence: 78 },
      ],
      comparisons: [
        { playerName: 'Myles Murphy (Clemson 2019)', similarity: 78, reason: 'Similar motor, first step, and production trajectory from HS' },
        { playerName: 'Dallas Turner (Alabama)', similarity: 72, reason: 'Comparable measurables and sack production relative to level of competition' },
      ],
      recommendation: 'Top defensive priority in the 2027 class. Offer already extended — push for commitment by July.',
      fitScore: 88,
      recruitingPriority: 'must-have',
    },
    {
      id: 'air-3',
      prospectId: 'pr-4',
      sport: 'football',
      overallGrade: 'A+',
      summary: 'Khalil Brown is a complete linebacker prospect who brings elite instincts, coverage versatility, and irreplaceable locker-room leadership. His commitment is our top win of the 2027 cycle.',
      strengths: ['All-world instincts — rarely out of position', 'Coverage in man and zone at elite level', 'Consistent tackler — 112 tackles with 6 sacks as LB', 'Team captain 3 consecutive years — character A+'],
      weaknesses: ['Weight will need to add 5–10 lbs before college', 'Zone drops could improve vs. 4-verticals concepts'],
      projections: [
        { category: 'Coverage', current: 87, projected: 94, confidence: 90 },
        { category: 'Run Stopping', current: 85, projected: 90, confidence: 88 },
        { category: 'Pass Rush', current: 76, projected: 84, confidence: 82 },
        { category: 'Leadership', current: 97, projected: 98, confidence: 97 },
      ],
      comparisons: [
        { playerName: 'Deion Jones (LSU 2016)', similarity: 84, reason: 'Matched on coverage athleticism, zone instincts, and leadership metrics' },
        { playerName: 'Roquan Smith (Georgia)', similarity: 79, reason: 'Similar tackle efficiency and sideline-to-sideline range for the position' },
      ],
      recommendation: 'Committed. Lock him in and get him on campus for orientation planning as soon as possible.',
      fitScore: 97,
      recruitingPriority: 'must-have',
    },
    {
      id: 'air-4',
      prospectId: 'pr-9',
      sport: 'football',
      overallGrade: 'A-',
      summary: 'Darius Cole is an impact safety with sideline-to-sideline range that would immediately address our secondary depth needs. His blitz packages add scheme versatility and he has the athleticism to play both SS and FS.',
      strengths: ['Sideline-to-sideline range is 99th percentile', 'Bone-crushing hitter — 5 TFLs from safety position', 'Scheme versatility — plays SS, FS, LB hybrid', 'Elite special teams contributor'],
      weaknesses: ['Press coverage technique needs refinement', 'Occasional overpursuit in gap runs'],
      projections: [
        { category: 'Range', current: 93, projected: 95, confidence: 93 },
        { category: 'Coverage', current: 79, projected: 88, confidence: 82 },
        { category: 'Run Support', current: 88, projected: 91, confidence: 89 },
        { category: 'Blitz Package', current: 84, projected: 90, confidence: 86 },
      ],
      comparisons: [
        { playerName: 'Jevon Holland (Oregon)', similarity: 76, reason: 'Similar range, versatility, and special teams impact profile' },
        { playerName: 'Daxton Hill (Michigan)', similarity: 71, reason: 'Comparable hybrid safety/LB athleticism metrics' },
      ],
      recommendation: 'High priority. Extend offer this week — other programs are ramping up contact.',
      fitScore: 86,
      recruitingPriority: 'high',
    },
  ];

  for (const r of aiReportsData) {
    const { comparisons, ...rest } = r;
    await prisma.aIReport.upsert({
      where: { id: r.id },
      update: {},
      create: {
        ...rest,
        comparisons,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`  ✓ AI Reports (${aiReportsData.length})`);

  console.log('\n✅  Seed complete!');
  console.log(`   Program: ${program.name}`);
  console.log(`   Prospects: ${prospectsData.length}`);
  console.log(`   Users: 4`);
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
