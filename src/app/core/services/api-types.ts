/**
 * Alarm Management API - Frontend Type Definitions
 *
 * This file contains all TypeScript types for integrating with the Alarm Management API.
 * Import these types in your frontend project for type-safe API calls.
 *
 * Base URL: /alarm-management-api
 *
 * Available Endpoints:
 *   GET    /disciplines                     - List all disciplines with types
 *   GET    /alarm-flows                     - Get alarm flows by discipline
 *   GET    /alarm-patterns/:key             - Get single alarm pattern
 *   POST   /alarm-patterns                  - Create new alarm pattern
 *   PUT    /alarm-patterns/:key             - Update alarm pattern
 *   DELETE /alarm-patterns/:key             - Delete alarm pattern
 *   GET    /alarm-patterns/:key/versions    - Get version history
 *   POST   /alarm-patterns/:key/rollback    - Rollback to version
 *   GET    /classes                         - Get classes by discipline type
 *   PUT    /classes/:id                     - Update class configuration
 *   POST   /import                          - Import configuration JSON
 */

// ============================================================================
// STANDARD API RESPONSE WRAPPER
// ============================================================================

/**
 * Standard API response wrapper for all endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// ============================================================================
// PROGRAM MODULE TYPES
// ============================================================================

/**
 * Program module type enum (0-39)
 * Used in visual alarm flow programming
 */
export enum ProgramModuleType {
  LABEL = 0,     // Input/Output node
  OVER = 1,      // > (Over threshold)
  UNDER = 2,     // < (Under threshold)
  AVG = 3,       // Average over time
  MIN = 7,       // Minimum of inputs
  MAX = 8,       // Maximum of inputs
  SUBTRACT = 12, // Subtraction
  CMP = 15,      // Compare with false/true values
  CHG = 16,      // Change detection
  IFNUL = 17,    // If null fallback
  SEV = 18,      // Severity output (0-6)
  TD = 19,       // Time difference
  COUNT = 26,    // Count threshold events
}

/**
 * Program module - represents a node in the visual flow editor
 */
export interface ProgramModule {
  /** Module type (0-39) */
  type: number;
  /** X coordinate in the flow editor */
  x: number;
  /** Y coordinate in the flow editor */
  y: number;
  /** Module name (e.g., $variable_name or %output_name for labels) */
  name: string;
  /** Input connections */
  inputs?: string[];
  /** Referenced class IDs for threshold lookups */
  classes?: string[];
  /** Additional parameters (e.g., time period, thresholds) */
  parameters?: string[];
}

// ============================================================================
// CORE DATA TYPES (DTOs)
// ============================================================================

/**
 * Discipline type within a discipline
 */
export interface DisciplineTypeDTO {
  id: string;
  disciplineId: string;
  name: string;
  createdAt: string;
  discipline?: {
    id: string;
    name: string;
  };
}

/**
 * Discipline - top-level organizational unit
 */
export interface DisciplineDTO {
  id: string;
  name: string;
  enterpriseName: string;
  enterpriseVersion: number;
  createdAt: string;
  updatedAt: string;
  /** Associated discipline types */
  types?: DisciplineTypeDTO[];
}

/**
 * Severity threshold configuration for a class
 */
export interface SeverityThreshold {
  ok?: [number | null, string | null];
  recovering?: [number | null, string | null];
  warning?: [number | null, string | null];
  minor?: [number | null, string | null];
  major?: [number | null, string | null];
  critical?: [number | null, string | null];
  terminal?: [number | null, string | null];
}

/**
 * Class pattern configuration
 */
export interface ClassPattern {
  pattern: string;
  flags: number;
}

/**
 * Class configuration DTO
 */
export interface ClassDTO {
  id: string;
  disciplineTypeId: string;
  classId: string;
  description: string;
  defaultFlag: number;
  data: SeverityThreshold | null;
  patterns: ClassPattern[] | null;
  createdAt: string;
}

/**
 * Field DTO
 */
export interface FieldDTO {
  id: string;
  disciplineTypeId: string;
  name: string;
  arrayType: string | null;
  arraySize: number | null;
  fieldType1: string | null;
  fieldType2: string | null;
  createdAt: string;
}

/**
 * Alarm pattern DTO
 */
export interface AlarmPatternDTO {
  id: string;
  disciplineTypeId: string;
  alarmPatternKey: string;
  version: number;
  isLatest: boolean;
  no: number;
  alarmId: string;
  textExpr: string;
  genericFamily: string;
  genericId: string;
  trapPdu1: string;
  trapFlag: number;
  suppressionPeriod: number;
  programModules: ProgramModule[];
  createdAt: string;
  createdBy: string | null;
  changeDescription: string | null;
}

/**
 * Alarm version DTO - for version history
 */
export interface AlarmVersionDTO {
  version: number;
  createdAt: string;
  createdBy: string | null;
  changeDescription: string | null;
  isLatest: boolean;
  alarm: AlarmPatternDTO;
}

/**
 * Alarm flows grouped by discipline
 */
export interface AlarmFlowsByDisciplineDTO {
  discipline: {
    id: string;
    name: string;
  };
  disciplineTypes: Array<{
    disciplineType: {
      id: string;
      name: string;
    };
    alarms: AlarmPatternDTO[];
    classes: ClassDTO[];
  }>;
}

/**
 * Import error detail
 */
export interface ImportErrorDetail {
  type: 'discipline' | 'disciplineType' | 'alarmPattern' | 'class' | 'field';
  name: string;
  message: string;
}

/**
 * Import summary result
 */
export interface ImportSummaryDTO {
  disciplinesCreated: number;
  disciplineTypesCreated: number;
  alarmPatternsCreated: number;
  classesCreated: number;
  fieldsCreated: number;
  errors: ImportErrorDetail[];
}

/**
 * Audit information for change tracking
 */
export interface AuditInfo {
  totalChanges: number;
  lastModified: string;
  lastModifiedBy: string | null;
  changeHistory: Array<{
    version: number;
    changeDescription: string | null;
    createdBy: string | null;
    createdAt: string;
  }>;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * POST /alarm-patterns - Create a new alarm pattern
 */
export interface CreateAlarmPatternRequest {
  /** Discipline type ID (required) */
  disciplineTypeId: string;
  /** Alarm number (positive integer) */
  no: number;
  /** Alarm identifier (max 128 chars) */
  alarmId: string;
  /** Text expression (max 512 chars) */
  textExpr: string;
  /** Generic family (max 64 chars) */
  genericFamily: string;
  /** Generic ID (max 128 chars) */
  genericId: string;
  /** Trap PDU (max 128 chars) */
  trapPdu1: string;
  /** Trap flag (0 or 1) */
  trapFlag: number;
  /** Suppression period in seconds (min 0) */
  suppressionPeriod: number;
  /** Visual flow program modules */
  programModules?: ProgramModule[];
}

/**
 * PUT /alarm-patterns/:key - Update an alarm pattern
 */
export interface UpdateAlarmPatternRequest {
  /** Text expression (max 512 chars) */
  textExpr?: string;
  /** Generic family (max 64 chars) */
  genericFamily?: string;
  /** Generic ID (max 128 chars) */
  genericId?: string;
  /** Trap PDU (max 128 chars) */
  trapPdu1?: string;
  /** Trap flag (0 or 1) */
  trapFlag?: number;
  /** Suppression period in seconds (min 0) */
  suppressionPeriod?: number;
  /** Visual flow program modules */
  programModules?: ProgramModule[];
  /** Description of changes (max 512 chars) - auto-generated if not provided */
  changeDescription?: string;
}

/**
 * POST /alarm-patterns/:key/rollback - Rollback to a previous version
 */
export interface RollbackRequest {
  /** Target version number to rollback to (positive integer) */
  targetVersion: number;
  /** Reason for rollback (max 512 chars) */
  reason?: string;
}

/**
 * PUT /classes/:id - Update a class configuration
 */
export interface UpdateClassRequest {
  /** Class description (max 256 chars) */
  description?: string;
  /** Default flag value */
  defaultFlag?: number;
  /** Severity threshold data */
  data?: unknown[];
  /** Pattern configurations */
  patterns?: Array<{
    pattern: string;
    flags: number;
  }>;
}

/**
 * POST /import - Import configuration from JSON
 */
export interface ImportRequest {
  /** Array of JSON configuration strings */
  configs: string[];
  /** Whether to overwrite existing configurations (default: false) */
  overwriteExisting?: boolean;
}

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

/**
 * GET /alarm-flows - Query parameters
 */
export interface AlarmFlowsQueryParams {
  /** Filter by discipline ID (optional) */
  disciplineId?: string;
}

/**
 * GET /alarm-patterns/:key - Query parameters
 */
export interface GetAlarmPatternQueryParams {
  /** Specific version number (optional - defaults to latest) */
  version?: number;
}

/**
 * GET /alarm-patterns/:key/versions - Query parameters
 */
export interface GetVersionsQueryParams {
  /** Include audit information (default: false) */
  includeAudit?: boolean;
}

/**
 * GET /classes - Query parameters
 */
export interface GetClassesQueryParams {
  /** Discipline type ID (required) */
  disciplineTypeId: string;
  /** Include fields in response (default: false) */
  includeFields?: boolean;
}

// ============================================================================
// RESPONSE TYPES (Per Endpoint)
// ============================================================================

/**
 * GET /disciplines - Response
 */
export type GetDisciplinesResponse = ApiResponse<{
  disciplines: DisciplineDTO[];
}>;

/**
 * GET /alarm-flows - Response
 */
export type GetAlarmFlowsResponse = ApiResponse<AlarmFlowsByDisciplineDTO[]>;

/**
 * GET /alarm-patterns/:key - Response
 */
export type GetAlarmPatternResponse = ApiResponse<{
  alarmPattern: AlarmPatternDTO;
}>;

/**
 * POST /alarm-patterns - Response (201 Created)
 */
export type CreateAlarmPatternResponse = ApiResponse<{
  alarmPattern: AlarmPatternDTO;
}>;

/**
 * PUT /alarm-patterns/:key - Response
 */
export type UpdateAlarmPatternResponse = ApiResponse<{
  alarmPattern: AlarmPatternDTO;
  previousVersion: number;
}>;

/**
 * DELETE /alarm-patterns/:key - Response
 */
export type DeleteAlarmPatternResponse = ApiResponse<{
  message: string;
  alarmPatternKey: string;
}>;

/**
 * GET /alarm-patterns/:key/versions - Response
 */
export type GetVersionsResponse = ApiResponse<{
  alarmPatternKey: string;
  currentVersion: number;
  versions: AlarmVersionDTO[];
  audit?: AuditInfo;
}>;

/**
 * POST /alarm-patterns/:key/rollback - Response
 */
export type RollbackResponse = ApiResponse<{
  alarmPattern: AlarmPatternDTO;
  rolledBackFrom: number;
  rolledBackTo: number;
}>;

/**
 * GET /classes - Response
 */
export type GetClassesResponse = ApiResponse<{
  classes: ClassDTO[];
  fields?: FieldDTO[];
}>;

/**
 * PUT /classes/:id - Response
 */
export type UpdateClassResponse = ApiResponse<{
  class: ClassDTO;
}>;

/**
 * POST /import - Response
 */
export type ImportResponse = ApiResponse<ImportSummaryDTO>;

// ============================================================================
// API ENDPOINTS REFERENCE
// ============================================================================

/**
 * API Endpoints namespace for reference
 *
 * Usage example with fetch:
 * ```typescript
 * const response = await fetch(`${API_BASE}/disciplines`);
 * const data: GetDisciplinesResponse = await response.json();
 * ```
 */
export const API_ENDPOINTS = {
  /** GET - List all disciplines with types */
  DISCIPLINES: '/disciplines',

  /** GET - Get alarm flows (query: disciplineId?) */
  ALARM_FLOWS: '/alarm-flows',

  /** GET - Get alarm pattern by key (query: version?) */
  ALARM_PATTERN: (key: string) => `/alarm-patterns/${key}`,

  /** POST - Create new alarm pattern */
  CREATE_ALARM_PATTERN: '/alarm-patterns',

  /** PUT - Update alarm pattern by key */
  UPDATE_ALARM_PATTERN: (key: string) => `/alarm-patterns/${key}`,

  /** DELETE - Delete alarm pattern by key */
  DELETE_ALARM_PATTERN: (key: string) => `/alarm-patterns/${key}`,

  /** GET - Get version history for alarm pattern (query: includeAudit?) */
  ALARM_VERSIONS: (key: string) => `/alarm-patterns/${key}/versions`,

  /** POST - Rollback alarm pattern to specific version */
  ROLLBACK_ALARM: (key: string) => `/alarm-patterns/${key}/rollback`,

  /** GET - Get classes by discipline type (query: disciplineTypeId, includeFields?) */
  CLASSES: '/classes',

  /** PUT - Update class by ID */
  UPDATE_CLASS: (id: string) => `/classes/${id}`,

  /** POST - Import configuration JSON */
  IMPORT: '/import',
} as const;

// ============================================================================
// HTTP HEADERS
// ============================================================================

/**
 * Required/optional HTTP headers for API requests
 */
export interface ApiHeaders {
  'Content-Type': 'application/json';
  /** User ID for audit trail (optional but recommended) */
  'x-user-id'?: string;
  /** Appwrite user ID (alternative to x-user-id) */
  'x-appwrite-user-id'?: string;
}
