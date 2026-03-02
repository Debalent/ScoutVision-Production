// ─── ScoutVision Core Types ─────────────────────────────────────────
// Shared types matching the Prisma schema for frontend use

export type UserRole = 'Admin' | 'Coach' | 'Assistant' | 'Analyst';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: { id: string; name: UserRole };
  roleId: string;
  programId: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Program {
  id: string;
  name: string;
  sport: string;
  division: string;
  conference: string | null;
  logoUrl: string | null;
  state: string | null;
  subscriptionTier: 'starter' | 'growth' | 'elite';
}

// ─── Prospect ───────────────────────────────────────────────────────

export interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  email: string | null;
  phone: string | null;
  imageUrl: string | null;
  position: string | null;
  height: string | null;
  weight: number | null;
  highSchool: string | null;
  clubTeam: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  hudlUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  tags: string[];
  commitmentScore: number | null;
  classYear: number | null;
  status: 'active' | 'archived' | 'committed' | 'enrolled';
  stats: ProspectStats | null;
  academics: ProspectAcademics | null;
  stage: RecruitingStage | null;
  stageId: string | null;
  stageOrder: number;
  notes: Note[];
  evaluations: Evaluation[];
  videos: Video[];
  visits: Visit[];
  contactLogs: ContactLog[];
  emails: Email[];
  programId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectStats {
  id: string;
  fortyYard: number | null;
  shuttle: number | null;
  vertical: number | null;
  bench: number | null;
  squat: number | null;
  broad: number | null;
  sportMetrics: Record<string, unknown> | null;
}

export interface ProspectAcademics {
  id: string;
  gpa: number | null;
  satScore: number | null;
  actScore: number | null;
  school: string | null;
  gradYear: number | null;
  intendedMajor: string | null;
  ncaaEligible: boolean | null;
  coreGpa: number | null;
}

// ─── Recruiting Pipeline ────────────────────────────────────────────

export interface RecruitingStage {
  id: string;
  name: string;
  order: number;
  color: string;
  programId: string;
}

// ─── Communication ──────────────────────────────────────────────────

export interface Email {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  templateId: string | null;
  sentAt: string;
  openedAt: string | null;
  clickedAt: string | null;
  opened: boolean;
  clicked: boolean;
  bounced: boolean;
  prospectId: string | null;
  senderId: string | null;
}

export interface ContactLog {
  id: string;
  type: 'call' | 'text' | 'in-person' | 'social' | 'mail';
  direction: 'inbound' | 'outbound';
  summary: string | null;
  duration: number | null;
  prospectId: string;
  userId: string;
  occurredAt: string;
}

// ─── Evaluations & Notes ────────────────────────────────────────────

export interface Note {
  id: string;
  content: string;
  isPinned: boolean;
  authorId: string | null;
  authorName?: string;
  prospectId: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  overallScore: number;
  athleticism: number | null;
  academics: number | null;
  character: number | null;
  skillLevel: number | null;
  comment: string | null;
  authorId: string | null;
  authorName?: string;
  prospectId: string;
  createdAt: string;
}

// ─── Compliance ─────────────────────────────────────────────────────

export type ComplianceSeverity = 'info' | 'warning' | 'violation';

export interface ComplianceEvent {
  id: string;
  type: string;
  title: string | null;
  details: string | null;
  severity: ComplianceSeverity;
  resolved: boolean;
  programId: string | null;
  userId: string | null;
  createdAt: string;
}

export type RecruitingPeriodType = 'contact' | 'quiet' | 'dead' | 'evaluation';

export interface RecruitingPeriod {
  id: string;
  type: RecruitingPeriodType;
  sport: string;
  startDate: string;
  endDate: string;
  description: string | null;
  programId: string;
}

export interface Visit {
  id: string;
  type: 'official' | 'unofficial' | 'junior_day';
  date: string;
  location: string | null;
  notes: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  prospectId: string;
  createdAt: string;
}

// ─── Video Scouting ─────────────────────────────────────────────────

export interface Video {
  id: string;
  title: string | null;
  url: string;
  type: string | null;
  sourceType: 'link' | 'upload';
  sourceUrl?: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  status: 'processing' | 'ready' | 'failed' | 'analyzed';
  aiTags: string[] | null;
  aiMetrics: Record<string, unknown> | null;
  prospectId: string | null;
  clips: VideoClip[];
  createdAt: string;
}

export interface VideoClip {
  id: string;
  title: string | null;
  label: string;
  videoId: string;
  startTime: number;
  endTime: number;
  rating: number | null;
  tags: string[];
  notes: string | null;
  shareToken: string;
  createdAt: string;
}

// ─── Analytics ──────────────────────────────────────────────────────

export interface PipelineMetric {
  id: string;
  type: string;
  dimension: string | null;
  value: number;
  metadata: Record<string, unknown> | null;
  programId: string | null;
  period: string | null;
  createdAt: string;
}

// ─── Audit ──────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  userId: string | null;
  createdAt: string;
}

// ─── Dashboard ──────────────────────────────────────────────────────

export interface DashboardStats {
  totalProspects: number;
  activeProspects: number;
  committed: number;
  conversionRate: number;
  upcomingVisits: number;
  complianceAlerts: number;
  emailsSentThisWeek: number;
  avgEvalScore: number;
}

export interface ActivityItem {
  id: string;
  type: 'note' | 'email' | 'evaluation' | 'visit' | 'stage_change' | 'compliance';
  title: string;
  description: string;
  timestamp: string;
  prospectName?: string;
  userName?: string;
}
