import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap, take, shareReplay, finalize } from 'rxjs/operators';
import { Client, Storage, ID } from 'appwrite';
import { AppwriteService } from './appwrite.service';
import { environment } from '../../../environments/environment';
import {
  Chat,
  Message,
  CreateChatRequest,
  SendMessageRequest,
  CreateChatResponse,
  ListChatsResponse,
  GetChatResponse,
  DeleteChatResponse,
  SendMessageResponse,
  ListMessagesResponse,
  UploadFileResponse,
  CHAT_API_ENDPOINTS,
} from './chat-api-types';

/**
 * Chat API Service
 * Handles all API calls to the chat backend via Appwrite functions
 */
@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private appwrite = inject(AppwriteService);
  private storage!: Storage;

  // Appwrite function ID for chat API
  private readonly FUNCTION_ID = 'fn-chat-api';

  // Storage bucket ID for refrigeration files
  private readonly BUCKET_ID = 'refrigeration-files';

  constructor() {
    console.log('ChatApiService constructor called');
    try {
      // Initialize storage client
      const client = new Client()
        .setEndpoint(environment.appwrite.endpoint)
        .setProject(environment.appwrite.projectId);

      this.storage = new Storage(client);
      console.log('ChatApiService initialized successfully');
    } catch (error) {
      console.error('ChatApiService initialization error:', error);
    }
  }

  // ============ File Upload ============

  /**
   * Upload a CSV file to Appwrite storage
   * @param file - The file to upload
   */
  private pendingUpload: Observable<{ fileId: string; fileName: string; fileSize: number }> | null = null;
  private lastUploadFileName: string | null = null;

  uploadFile(file: File): Observable<{ fileId: string; fileName: string; fileSize: number }> {
    console.log('ChatApiService.uploadFile called with:', file.name);

    // If there's already a pending upload for the same file, return it
    if (this.pendingUpload && this.lastUploadFileName === file.name) {
      console.log('Returning existing pending upload for:', file.name);
      return this.pendingUpload;
    }

    this.lastUploadFileName = file.name;
    this.pendingUpload = from(
      this.storage.createFile(this.BUCKET_ID, ID.unique(), file)
    ).pipe(
      take(1),
      map((response) => {
        console.log('File upload response:', response);
        return {
          fileId: response.$id,
          fileName: response.name,
          fileSize: response.sizeOriginal,
        };
      }),
      catchError((error) => {
        console.error('File upload error:', error);
        return throwError(() => ({
          message: error.message || 'Failed to upload file',
          code: error.code || 500,
        }));
      }),
      finalize(() => {
        // Clear pending upload after completion or error
        this.pendingUpload = null;
        this.lastUploadFileName = null;
      }),
      shareReplay(1) // Cache the result for multiple subscribers
    );

    return this.pendingUpload;
  }

  // ============ Chat Operations ============

  /**
   * POST /chats - Create a new chat session
   * @param request - Create chat request
   */
  createChat(request: CreateChatRequest): Observable<Chat> {
    console.log('ChatApiService.createChat called with:', request);

    return this.appwrite
      .executeApiFunction<CreateChatResponse>(
        this.FUNCTION_ID,
        CHAT_API_ENDPOINTS.CREATE_CHAT,
        'POST',
        request
      )
      .pipe(
        map((response) => {
          console.log('Create chat response:', response);
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to create chat');
          }
          // API returns data directly, not data.chat
          const data = response.data as any;
          return {
            chatId: data.id || data.chatId || data.$id,
            title: data.title,
            status: data.status,
            csvFileName: data.csvFileName,
            deviceType: data.deviceType,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt || data.createdAt,
            userId: data.userId || '',
            messageCount: data.messageCount || 0,
          } as Chat;
        })
      );
  }

  /**
   * GET /chats - List all chats for the current user
   * @param limit - Number of chats to return (default 20)
   */
  listChats(limit: number = 20): Observable<{ chats: Chat[]; total: number }> {
    console.log('ChatApiService.listChats called with limit:', limit);
    console.log('Function ID:', this.FUNCTION_ID);
    console.log('Endpoint:', `${CHAT_API_ENDPOINTS.LIST_CHATS}?limit=${limit}`);

    return this.appwrite
      .executeApiFunction<ListChatsResponse>(
        this.FUNCTION_ID,
        `${CHAT_API_ENDPOINTS.LIST_CHATS}?limit=${limit}`,
        'GET'
      )
      .pipe(
        map((response) => {
          console.log('List chats raw response:', response);
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to list chats');
          }
          // Handle both response formats: { chats: [...] } or direct array
          const data = response.data as any;
          const chats = Array.isArray(data) ? data : (data.chats || []);
          console.log('Parsed chats:', chats);
          return {
            chats: chats.map((chat: any) => ({
              chatId: chat.id || chat.chatId || chat.$id,
              id: chat.id,
              title: chat.title,
              status: chat.status,
              csvFileName: chat.csvFileName,
              deviceType: chat.deviceType,
              messageCount: chat.messageCount || 0,
              lastMessageAt: chat.lastMessageAt,
              createdAt: chat.createdAt,
              updatedAt: chat.updatedAt || chat.createdAt,
              userId: chat.userId || '',
            } as Chat)),
            total: data.total || chats.length
          };
        })
      );
  }

  /**
   * GET /chats/:chatId - Get a single chat with messages
   * @param chatId - The chat ID
   */
  getChat(chatId: string): Observable<{ chat: Chat; messages: Message[] }> {
    console.log('=== GET CHAT API ===');
    console.log('Chat ID:', chatId);
    console.log('Endpoint:', CHAT_API_ENDPOINTS.GET_CHAT(chatId));

    return this.appwrite
      .executeApiFunction<GetChatResponse>(
        this.FUNCTION_ID,
        CHAT_API_ENDPOINTS.GET_CHAT(chatId),
        'GET'
      )
      .pipe(
        map((response) => {
          console.log('=== GET CHAT RESPONSE ===');
          console.log('Raw response:', response);
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to get chat');
          }
          // Handle response structure - data might contain chat directly or nested
          const data = response.data as any;
          console.log('Response data:', data);
          const chat = data.chat || {
            chatId: data.id || data.chatId || data.$id,
            title: data.title,
            status: data.status,
            csvFileName: data.csvFileName,
            deviceType: data.deviceType,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            userId: data.userId || '',
            messageCount: data.messageCount || 0,
          };
          const messages = data.messages || [];
          console.log('Parsed chat:', chat);
          console.log('Parsed messages:', messages);
          return { chat, messages };
        })
      );
  }

  /**
   * DELETE /chats/:chatId - Delete a chat and all its resources
   * @param chatId - The chat ID
   */
  deleteChat(chatId: string): Observable<{ message: string; chatId: string }> {
    console.log('ChatApiService.deleteChat called with:', chatId);

    return this.appwrite
      .executeApiFunction<DeleteChatResponse>(
        this.FUNCTION_ID,
        CHAT_API_ENDPOINTS.DELETE_CHAT(chatId),
        'DELETE'
      )
      .pipe(
        map((response) => {
          console.log('Delete chat response:', response);
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to delete chat');
          }
          return response.data;
        })
      );
  }

  // ============ Message Operations ============

  /**
   * POST /chats/:chatId/messages - Send a message (main endpoint)
   * This is the primary endpoint that handles all chat interactions.
   * Returns HTTP 202 Accepted with placeholder - subscribe to Realtime for complete response.
   * @param chatId - The chat ID
   * @param request - Send message request
   */
  sendMessage(
    chatId: string,
    request: SendMessageRequest
  ): Observable<{ userMessage: Message; assistantMessage: Message; status: string; processingTime?: number }> {
    console.log('ChatApiService.sendMessage called with:', { chatId, request });

    return this.appwrite
      .executeApiFunction<SendMessageResponse>(
        this.FUNCTION_ID,
        CHAT_API_ENDPOINTS.SEND_MESSAGE(chatId),
        'POST',
        request
      )
      .pipe(
        map((response) => {
          console.log('Send message response:', response);
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to send message');
          }
          const data = response.data as any;
          return {
            userMessage: {
              id: data.userMessage?.id || data.userMessage?.$id,
              $id: data.userMessage?.$id || data.userMessage?.id,
              chatId: data.userMessage?.chatId,
              role: data.userMessage?.role || 'user',
              content: data.userMessage?.content || '',
              contentType: data.userMessage?.contentType || 'text',
              createdAt: data.userMessage?.createdAt,
            } as Message,
            assistantMessage: {
              id: data.assistantMessage?.id || data.assistantMessage?.$id,
              $id: data.assistantMessage?.$id || data.assistantMessage?.id,
              chatId: data.assistantMessage?.chatId,
              role: data.assistantMessage?.role || 'assistant',
              content: data.assistantMessage?.content || '',
              contentType: data.assistantMessage?.contentType || 'text',
              summaryData: data.assistantMessage?.summaryData,
              graphImageId: data.assistantMessage?.graphImageId,
              graphUrl: data.assistantMessage?.graphUrl,
              processingTime: data.assistantMessage?.processingTime,
              createdAt: data.assistantMessage?.createdAt,
            } as Message,
            status: data.status || 'processing',
            processingTime: data.processingTime,
          };
        })
      );
  }

  /**
   * GET /chats/:chatId/messages - List messages in a chat
   * @param chatId - The chat ID
   */
  listMessages(chatId: string): Observable<{ messages: Message[]; total: number }> {
    console.log('ChatApiService.listMessages called with:', chatId);

    return this.appwrite
      .executeApiFunction<ListMessagesResponse>(
        this.FUNCTION_ID,
        CHAT_API_ENDPOINTS.LIST_MESSAGES(chatId),
        'GET'
      )
      .pipe(
        map((response) => {
          console.log('List messages raw response:', response);
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to list messages');
          }
          // Handle both response formats: { messages: [...] } or direct array
          const data = response.data as any;
          const messages = Array.isArray(data) ? data : (data.messages || []);
          console.log('Parsed messages:', messages);
          return {
            messages: messages.map((msg: any) => ({
              id: msg.id || msg.$id,
              $id: msg.$id || msg.id,
              chatId: msg.chatId,
              role: msg.role,
              content: msg.content || '',
              contentType: msg.contentType || 'text',
              summaryData: msg.summaryData,
              graphImageId: msg.graphImageId,
              graphUrl: msg.graphUrl,
              processingTime: msg.processingTime,
              createdAt: msg.createdAt,
            } as Message)),
            total: data.total || messages.length
          };
        })
      );
  }

  // ============ Combined Operations ============

  /**
   * Upload file and create a new chat in one operation
   * @param file - The CSV file to upload
   * @param title - Chat title (defaults to 'New Analysis')
   */
  uploadAndCreateChat(
    file: File,
    title: string = 'New Analysis'
  ): Observable<{ chat: Chat; fileId: string }> {
    console.log('ChatApiService.uploadAndCreateChat called');

    return this.uploadFile(file).pipe(
      switchMap((uploadResult) => {
        console.log('File uploaded, creating chat...');
        return this.createChat({
          title,
          csvFileId: uploadResult.fileId,
          csvFileName: uploadResult.fileName,
        }).pipe(
          map((chat) => ({
            chat,
            fileId: uploadResult.fileId,
          }))
        );
      })
    );
  }

  /**
   * Send message with optional file upload
   * If a file is provided and no chatId exists, creates a new chat first
   * @param chatId - Optional existing chat ID
   * @param content - Message content
   * @param file - Optional CSV file
   */
  sendMessageWithFile(
    chatId: string | null,
    content: string,
    file?: File
  ): Observable<{
    chatId: string;
    userMessage: Message;
    assistantMessage: Message;
    status: string;
    processingTime?: number;
  }> {
    console.log('ChatApiService.sendMessageWithFile called with:', { chatId, content, file: file?.name });

    // If we have a file but no chat, upload and create chat first
    if (file && !chatId) {
      return this.uploadAndCreateChat(file).pipe(
        take(1),
        switchMap(({ chat, fileId }) => {
          const chatIdValue = chat.chatId || chat.$id || '';
          return this.sendMessage(chatIdValue, {
            content,
            csvFileId: fileId,
            csvFileName: file.name,
            csvFileSize: file.size,
          }).pipe(
            map((result) => ({
              chatId: chatIdValue,
              ...result,
            }))
          );
        })
      );
    }

    // If we have a file and existing chat, upload file then send message
    if (file && chatId) {
      return this.uploadFile(file).pipe(
        take(1),
        switchMap((uploadResult) => {
          return this.sendMessage(chatId, {
            content,
            csvFileId: uploadResult.fileId,
            csvFileName: uploadResult.fileName,
            csvFileSize: uploadResult.fileSize,
          }).pipe(
            map((result) => ({
              chatId,
              ...result,
            }))
          );
        })
      );
    }

    // No file, just send message to existing chat
    if (chatId) {
      return this.sendMessage(chatId, { content }).pipe(
        take(1),
        map((result) => ({
          chatId,
          ...result,
        }))
      );
    }

    // No file and no chat - create a new chat first
    return this.createChat({ title: 'New Analysis' }).pipe(
      take(1),
      switchMap((chat) => {
        const chatIdValue = chat.chatId || chat.$id || '';
        return this.sendMessage(chatIdValue, { content }).pipe(
          map((result) => ({
            chatId: chatIdValue,
            ...result,
          }))
        );
      })
    );
  }
}
