// ─── Validation Schemas ─────────────────────────────────────────────
// Zod-like validation without the dependency. 
// For production, swap with `zod` for full schema validation.

export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

// ─── Common Validators ──────────────────────────────────────────────

export const validators = {
  required: (field: string): ValidationRule<unknown> => ({
    validate: (v) => v !== null && v !== undefined && v !== '',
    message: `${field} is required`,
  }),

  email: (): ValidationRule<string> => ({
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: 'Must be a valid email address',
  }),

  minLength: (field: string, min: number): ValidationRule<string> => ({
    validate: (v) => v.length >= min,
    message: `${field} must be at least ${min} characters`,
  }),

  maxLength: (field: string, max: number): ValidationRule<string> => ({
    validate: (v) => v.length <= max,
    message: `${field} must be at most ${max} characters`,
  }),

  minValue: (field: string, min: number): ValidationRule<number> => ({
    validate: (v) => v >= min,
    message: `${field} must be at least ${min}`,
  }),

  maxValue: (field: string, max: number): ValidationRule<number> => ({
    validate: (v) => v <= max,
    message: `${field} must be at most ${max}`,
  }),

  pattern: (field: string, regex: RegExp, desc: string): ValidationRule<string> => ({
    validate: (v) => regex.test(v),
    message: `${field} ${desc}`,
  }),

  oneOf: <T>(field: string, options: T[]): ValidationRule<T> => ({
    validate: (v) => options.includes(v),
    message: `${field} must be one of: ${options.join(', ')}`,
  }),

  url: (field: string): ValidationRule<string> => ({
    validate: (v) => {
      try { new URL(v); return true; } catch { return false; }
    },
    message: `${field} must be a valid URL`,
  }),

  phone: (): ValidationRule<string> => ({
    validate: (v) => /^[\d\s\-\+\(\)]{7,20}$/.test(v),
    message: 'Must be a valid phone number',
  }),

  gpa: (): ValidationRule<number> => ({
    validate: (v) => v >= 0 && v <= 5.0,
    message: 'GPA must be between 0 and 5.0',
  }),

  classYear: (): ValidationRule<number> => ({
    validate: (v) => v >= 2024 && v <= 2035,
    message: 'Class year must be between 2024 and 2035',
  }),
};

// ─── Prospect Validation ────────────────────────────────────────────

export interface ProspectInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position: string;
  classYear: number;
  highSchool?: string;
  city?: string;
  state?: string;
  gpa?: number;
}

export function validateProspect(input: Partial<ProspectInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.firstName || input.firstName.trim().length < 1) errors.firstName = 'First name is required';
  if (!input.lastName || input.lastName.trim().length < 1) errors.lastName = 'Last name is required';
  if (!input.position || input.position.trim().length < 1) errors.position = 'Position is required';

  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = 'Must be a valid email address';
  }

  if (input.phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(input.phone)) {
    errors.phone = 'Must be a valid phone number';
  }

  if (input.classYear && (input.classYear < 2024 || input.classYear > 2035)) {
    errors.classYear = 'Class year must be between 2024 and 2035';
  }

  if (input.gpa !== undefined && (input.gpa < 0 || input.gpa > 5.0)) {
    errors.gpa = 'GPA must be between 0 and 5.0';
  }

  if (input.state && input.state.length !== 2) {
    errors.state = 'State must be a 2-letter code';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ─── Evaluation Validation ──────────────────────────────────────────

export interface EvaluationInput {
  overallScore: number;
  athleticism: number;
  academics: number;
  character: number;
  skillLevel: number;
  comment?: string;
  prospectId: string;
}

export function validateEvaluation(input: Partial<EvaluationInput>): ValidationResult {
  const errors: Record<string, string> = {};

  const scoreFields = ['overallScore', 'athleticism', 'academics', 'character', 'skillLevel'] as const;
  for (const field of scoreFields) {
    const val = input[field];
    if (val === undefined || val === null) {
      errors[field] = `${field} is required`;
    } else if (val < 1 || val > 10) {
      errors[field] = `${field} must be between 1 and 10`;
    }
  }

  if (!input.prospectId) errors.prospectId = 'Prospect ID is required';

  if (input.comment && input.comment.length > 2000) {
    errors.comment = 'Comment must be 2000 characters or less';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ─── Upload Validation ──────────────────────────────────────────────

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export function validateUpload(file: { type: string; size: number; name: string }): ValidationResult {
  const errors: Record<string, string> = {};

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    errors.type = `File type ${file.type} is not supported. Allowed: MP4, MOV, AVI, WebM`;
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.size = `File size exceeds maximum of 500MB`;
  }

  if (!file.name || file.name.length > 255) {
    errors.name = 'File name is invalid or too long';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
