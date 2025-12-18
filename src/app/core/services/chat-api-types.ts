/**
 * Chat API - Frontend Type Definitions
 *
 * This file contains all TypeScript types for integrating with the Chat API.
 * Based on the IoT Refrigeration AI Chat Architecture v2.0
 *
 * Available Endpoints:
 *   POST   /upload                    - Upload CSV file
 *   POST   /chats                     - Create new chat session
 *   GET    /chats                     - List user's chats
 *   GET    /chats/:chatId             - Get chat with messages
 *   DELETE /chats/:chatId             - Delete chat + all resources
 *   POST   /chats/:chatId/messages    - Send message (main endpoint)
 *   GET    /chats/:chatId/messages    - List messages in chat
 */

// ============================================================================
// STANDARD API RESPONSE WRAPPER
// ============================================================================

export interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    suggestion?: string;
    details?: unknown;
  };
}

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface Chat {
  $id?: string;
  id?: string;
  chatId?: string;
  userId?: string;
  title: string;
  status: 'active' | 'processing' | 'completed' | 'error';
  csvFileId?: string;
  csvFileName?: string;
  deviceType?: 'pack' | 'case' | 'mixed' | null;
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface Message {
  $id: string;
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  contentType: 'text' | 'analysis' | 'error';
  summaryData?: SummaryData;
  graphImageId?: string;
  graphUrl?: string;
  processingTime?: number;
  createdAt: string;
}

export interface SummaryData {
  summary: string;
  recommendations: Recommendation[];
  datapoints: Datapoint[];
  graphConfig?: GraphConfig;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'maintenance' | 'configuration' | 'monitoring' | 'immediate';
  actionLabel: string;
}

export interface Datapoint {
  label: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
}

export interface GraphConfig {
  type: 'line' | 'bar' | 'scatter';
  title: string;
  xColumn: string;
  yColumns: string[];
  xLabel?: string;
  yLabel?: string;
  showAnomalies: boolean;
  timeRange?: {
    start: string;
    end: string;
  };
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * POST /chats - Create a new chat session
 */
export interface CreateChatRequest {
  title: string;
  csvFileId?: string;
  csvFileName?: string;
}

/**
 * POST /chats/:chatId/messages - Send a message
 */
export interface SendMessageRequest {
  content: string;
  csvFileId?: string;
  csvFileName?: string;
  csvFileSize?: number;
}

/**
 * POST /upload - Upload CSV file (multipart/form-data)
 */
export interface UploadFileRequest {
  file: File;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * POST /upload - Response
 */
export type UploadFileResponse = ChatApiResponse<{
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}>;

/**
 * POST /chats - Response
 */
export type CreateChatResponse = ChatApiResponse<{
  chat: Chat;
}>;

/**
 * GET /chats - Response
 */
export type ListChatsResponse = ChatApiResponse<{
  chats: Chat[];
  total: number;
}>;

/**
 * GET /chats/:chatId - Response
 */
export type GetChatResponse = ChatApiResponse<{
  chat: Chat;
  messages: Message[];
}>;

/**
 * DELETE /chats/:chatId - Response
 */
export type DeleteChatResponse = ChatApiResponse<{
  message: string;
  chatId: string;
}>;

/**
 * POST /chats/:chatId/messages - Response (main endpoint)
 * Returns HTTP 202 Accepted with placeholder - subscribe to Realtime for complete response
 */
export type SendMessageResponse = ChatApiResponse<{
  userMessage: Message;
  assistantMessage: Message;
  status: 'processing' | 'completed' | 'error';
  processingTime?: number;
}>;

/**
 * GET /chats/:chatId/messages - Response
 */
export type ListMessagesResponse = ChatApiResponse<{
  messages: Message[];
  total: number;
}>;

// ============================================================================
// API ENDPOINTS REFERENCE
// ============================================================================

export const CHAT_API_ENDPOINTS = {
  /** POST - Upload CSV file */
  UPLOAD: '/upload',

  /** POST - Create new chat session */
  CREATE_CHAT: '/chats',

  /** GET - List user's chats */
  LIST_CHATS: '/chats',

  /** GET - Get chat with messages */
  GET_CHAT: (chatId: string) => `/chats/${chatId}`,

  /** DELETE - Delete chat */
  DELETE_CHAT: (chatId: string) => `/chats/${chatId}`,

  /** POST - Send message (main endpoint) */
  SEND_MESSAGE: (chatId: string) => `/chats/${chatId}/messages`,

  /** GET - List messages in chat */
  LIST_MESSAGES: (chatId: string) => `/chats/${chatId}/messages`,
} as const;
