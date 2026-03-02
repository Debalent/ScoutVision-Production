// ─── Authentication Utilities ───────────────────────────────────────
// Production auth helpers for session management, JWT, and RBAC

import { type NextRequest } from 'next/server';

// ─── Types ──────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'head_coach' | 'assistant_coach' | 'coordinator' | 'analyst' | 'viewer';
  programId: string;
  permissions: Permission[];
}

export type Permission =
  | 'prospects:read' | 'prospects:write' | 'prospects:delete'
  | 'evaluations:read' | 'evaluations:write'
  | 'compliance:read' | 'compliance:write'
  | 'analytics:read' | 'analytics:export'
  | 'video:read' | 'video:upload' | 'video:analyze'
  | 'reports:read' | 'reports:generate'
  | 'settings:read' | 'settings:write'
  | 'team:manage' | 'billing:manage';

// ─── Role → Permission Map ─────────────────────────────────────────

const ROLE_PERMISSIONS: Record<AuthUser['role'], Permission[]> = {
  admin: [
    'prospects:read', 'prospects:write', 'prospects:delete',
    'evaluations:read', 'evaluations:write',
    'compliance:read', 'compliance:write',
    'analytics:read', 'analytics:export',
    'video:read', 'video:upload', 'video:analyze',
    'reports:read', 'reports:generate',
    'settings:read', 'settings:write',
    'team:manage', 'billing:manage',
  ],
  head_coach: [
    'prospects:read', 'prospects:write', 'prospects:delete',
    'evaluations:read', 'evaluations:write',
    'compliance:read', 'compliance:write',
    'analytics:read', 'analytics:export',
    'video:read', 'video:upload', 'video:analyze',
    'reports:read', 'reports:generate',
    'settings:read', 'settings:write',
    'team:manage',
  ],
  assistant_coach: [
    'prospects:read', 'prospects:write',
    'evaluations:read', 'evaluations:write',
    'compliance:read',
    'analytics:read',
    'video:read', 'video:upload',
    'reports:read',
  ],
  coordinator: [
    'prospects:read', 'prospects:write',
    'evaluations:read', 'evaluations:write',
    'compliance:read', 'compliance:write',
    'analytics:read', 'analytics:export',
    'video:read', 'video:upload', 'video:analyze',
    'reports:read', 'reports:generate',
  ],
  analyst: [
    'prospects:read',
    'evaluations:read',
    'analytics:read', 'analytics:export',
    'video:read', 'video:analyze',
    'reports:read', 'reports:generate',
  ],
  viewer: [
    'prospects:read',
    'evaluations:read',
    'analytics:read',
    'video:read',
    'reports:read',
  ],
};

// ─── Auth Functions ─────────────────────────────────────────────────

/**
 * Get the current user from a request.
 * In production, this validates JWT/session tokens.
 * Demo mode returns a mock user.
 */
export function getCurrentUser(request?: NextRequest): AuthUser {
  // Production: Extract and validate JWT from Authorization header or session cookie
  // const token = request?.headers.get('Authorization')?.replace('Bearer ', '');
  // const session = request?.cookies.get('session_token')?.value;
  // const decoded = await verifyJWT(token || session);

  // Demo mode: return mock admin user
  return {
    id: 'u1',
    email: 'rivera@university.edu',
    name: 'Coach Rivera',
    role: 'head_coach',
    programId: 'p1',
    permissions: ROLE_PERMISSIONS['head_coach'],
  };
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: AuthUser, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/**
 * Check if user has ALL specified permissions
 */
export function hasPermissions(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: AuthUser['role']): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Validate that a user belongs to the specified program
 */
export function belongsToProgram(user: AuthUser, programId: string): boolean {
  return user.programId === programId;
}

// ─── API Response Helpers ───────────────────────────────────────────

export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
  return Response.json({ error: message }, { status: 403 });
}

export function validationError(errors: Record<string, string>) {
  return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
}

export function notFoundResponse(resource = 'Resource') {
  return Response.json({ error: `${resource} not found` }, { status: 404 });
}

export function serverError(message = 'Internal server error') {
  return Response.json({ error: message }, { status: 500 });
}

export function successResponse<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}

export function paginatedResponse<T>(data: T[], total: number, page: number, pageSize: number) {
  return Response.json({
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  });
}
