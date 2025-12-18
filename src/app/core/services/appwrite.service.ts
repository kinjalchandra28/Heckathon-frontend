import { Injectable, OnDestroy } from '@angular/core';
import { Client, Account, Databases, Functions, ID, Query, Models, RealtimeResponseEvent } from 'appwrite';
import { from, Observable, throwError, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AppwriteDocument,
  AppwriteListResponse,
  AppwriteError,
  FunctionExecutionResult,
} from '../models/appwrite.model';

@Injectable({ providedIn: 'root' })
export class AppwriteService implements OnDestroy {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private functions: Functions;
  private activeSubscriptions: Map<string, () => void> = new Map();

  constructor() {
    this.client = new Client()
      .setEndpoint(environment.appwrite.endpoint)
      .setProject(environment.appwrite.projectId);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.functions = new Functions(this.client);
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.activeSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.activeSubscriptions.clear();
  }

  // ============ Realtime Methods ============

  /**
   * Subscribe to a specific document for real-time updates
   * @param collectionId - Collection ID
   * @param documentId - Document ID to subscribe to
   * @param databaseId - Database ID (defaults to environment config)
   * @returns Observable that emits when document is updated
   */
  subscribeToDocument<T>(
    collectionId: string,
    documentId: string,
    databaseId: string = environment.appwrite.databaseId
  ): Observable<T> {
    const subject = new Subject<T>();
    const channel = `databases.${databaseId}.collections.${collectionId}.documents.${documentId}`;

    console.log('AppwriteService: Subscribing to channel:', channel);

    const unsubscribe = this.client.subscribe(channel, (response: RealtimeResponseEvent<T>) => {
      console.log('AppwriteService: Realtime event received:', response);
      if (response.events.some(e => e.includes('.update') || e.includes('.create'))) {
        subject.next(response.payload);
      }
    });

    // Store subscription for cleanup
    this.activeSubscriptions.set(channel, unsubscribe);

    return subject.asObservable();
  }

  /**
   * Subscribe to all documents in a collection
   * @param collectionId - Collection ID
   * @param databaseId - Database ID (defaults to environment config)
   * @returns Observable that emits when any document in collection changes
   */
  subscribeToCollection<T>(
    collectionId: string,
    databaseId: string = environment.appwrite.databaseId
  ): Observable<{ event: string; payload: T }> {
    const subject = new Subject<{ event: string; payload: T }>();
    const channel = `databases.${databaseId}.collections.${collectionId}.documents`;

    console.log('AppwriteService: Subscribing to collection channel:', channel);

    const unsubscribe = this.client.subscribe(channel, (response: RealtimeResponseEvent<T>) => {
      console.log('AppwriteService: Collection event received:', response);
      const eventType = response.events[0]?.split('.').pop() || 'unknown';
      subject.next({ event: eventType, payload: response.payload });
    });

    // Store subscription for cleanup
    this.activeSubscriptions.set(channel, unsubscribe);

    return subject.asObservable();
  }

  /**
   * Unsubscribe from a specific channel
   * @param channel - Channel to unsubscribe from
   */
  unsubscribe(channel: string): void {
    const unsubscribe = this.activeSubscriptions.get(channel);
    if (unsubscribe) {
      console.log('AppwriteService: Unsubscribing from channel:', channel);
      unsubscribe();
      this.activeSubscriptions.delete(channel);
    }
  }

  /**
   * Unsubscribe from a document subscription
   * @param collectionId - Collection ID
   * @param documentId - Document ID
   * @param databaseId - Database ID
   */
  unsubscribeFromDocument(
    collectionId: string,
    documentId: string,
    databaseId: string = environment.appwrite.databaseId
  ): void {
    const channel = `databases.${databaseId}.collections.${collectionId}.documents.${documentId}`;
    this.unsubscribe(channel);
  }

  /**
   * Get the Appwrite client for direct access if needed
   */
  getClient(): Client {
    return this.client;
  }

  // ============ Account Methods ============

  createEmailSession(email: string, password: string): Observable<Models.Session> {
    return from(this.account.createEmailPasswordSession(email, password)).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  getCurrentUser(): Observable<Models.User<Models.Preferences>> {
    return from(this.account.get()).pipe(catchError((error) => this.handleError(error)));
  }

  createAccount(
    email: string,
    password: string,
    name: string
  ): Observable<Models.User<Models.Preferences>> {
    return from(this.account.create(ID.unique(), email, password, name)).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  deleteSession(sessionId: string = 'current'): Observable<void> {
    return from(this.account.deleteSession(sessionId)).pipe(
      map(() => undefined),
      catchError((error) => this.handleError(error))
    );
  }

  getSession(sessionId: string = 'current'): Observable<Models.Session> {
    return from(this.account.getSession(sessionId)).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  // ============ Database Methods ============

  listDocuments<T>(
    collectionId: string,
    queries: string[] = [],
    databaseId: string = environment.appwrite.databaseId
  ): Observable<AppwriteListResponse<AppwriteDocument<T>>> {
    return from(this.databases.listDocuments(databaseId, collectionId, queries)).pipe(
      map((response) => ({
        total: response.total,
        documents: response.documents as unknown as AppwriteDocument<T>[],
      })),
      catchError((error) => this.handleError(error))
    );
  }

  getDocument<T>(
    collectionId: string,
    documentId: string,
    databaseId: string = environment.appwrite.databaseId
  ): Observable<AppwriteDocument<T>> {
    return from(this.databases.getDocument(databaseId, collectionId, documentId)).pipe(
      map((doc) => doc as unknown as AppwriteDocument<T>),
      catchError((error) => this.handleError(error))
    );
  }

  createDocument<T>(
    collectionId: string,
    data: Partial<T>,
    documentId: string = ID.unique(),
    permissions: string[] = [],
    databaseId: string = environment.appwrite.databaseId
  ): Observable<AppwriteDocument<T>> {
    return from(
      this.databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        data as object,
        permissions
      )
    ).pipe(
      map((doc) => doc as unknown as AppwriteDocument<T>),
      catchError((error) => this.handleError(error))
    );
  }

  updateDocument<T>(
    collectionId: string,
    documentId: string,
    data: Partial<T>,
    databaseId: string = environment.appwrite.databaseId
  ): Observable<AppwriteDocument<T>> {
    return from(
      this.databases.updateDocument(databaseId, collectionId, documentId, data as object)
    ).pipe(
      map((doc) => doc as unknown as AppwriteDocument<T>),
      catchError((error) => this.handleError(error))
    );
  }

  deleteDocument(
    collectionId: string,
    documentId: string,
    databaseId: string = environment.appwrite.databaseId
  ): Observable<void> {
    return from(this.databases.deleteDocument(databaseId, collectionId, documentId)).pipe(
      map(() => undefined),
      catchError((error) => this.handleError(error))
    );
  }

  // ============ Functions Methods ============

  executeFunction<T = unknown>(
    functionId: string,
    body?: string,
    async: boolean = false
  ): Observable<FunctionExecutionResult<T>> {
    return from(this.functions.createExecution(functionId, body, async)).pipe(
      map((execution) => ({
        responseStatusCode: execution.responseStatusCode,
        responseBody: execution.responseBody,
        logs: execution.logs,
        errors: execution.errors,
        duration: execution.duration,
        parsedResponse: execution.responseBody
          ? (JSON.parse(execution.responseBody) as T)
          : undefined,
      })),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Execute API function with HTTP-like request
   * Matches the React implementation pattern
   * @param functionId - Appwrite function ID
   * @param path - API path (e.g., '/alarm-flows')
   * @param method - HTTP method (GET, POST, PUT, DELETE)
   * @param data - Request body or query params
   */
  executeApiFunction<T = unknown>(
    functionId: string,
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown
  ): Observable<T> {
    // Stringify the body data (query params for GET, request body for POST/PUT/DELETE)
    const bodyContent = data ? JSON.stringify(data) : '';

    console.log('AppwriteService.executeApiFunction called');
    console.log('Function ID:', functionId);
    console.log('Path:', path);
    console.log('Method:', method);
    console.log('Body:', bodyContent);

    // Call createExecution with path and method as separate parameters
    // Signature: createExecution(functionId, body, async, path, method, headers, scheduledAt)
    return from(
      this.functions.createExecution(
        functionId,
        bodyContent,
        false, // async = false (wait for response)
        path,
        method as any // Cast to match Appwrite's ExecutionMethod type
      )
    ).pipe(
      map((execution) => {
        console.log('Function execution result:', execution);

        const parsedResponse = execution.responseBody
          ? (JSON.parse(execution.responseBody) as T)
          : undefined;

        if (execution.responseStatusCode >= 400) {
          throw {
            code: execution.responseStatusCode,
            message: execution.errors || 'API request failed',
            type: 'api_error',
          };
        }

        return parsedResponse as T;
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // ============ Query Helpers ============

  static query = {
    equal: (attribute: string, value: string | number | boolean | string[]) =>
      Query.equal(attribute, value),
    notEqual: (attribute: string, value: string | number | boolean | string[]) =>
      Query.notEqual(attribute, value),
    greaterThan: (attribute: string, value: string | number) => Query.greaterThan(attribute, value),
    greaterThanEqual: (attribute: string, value: string | number) =>
      Query.greaterThanEqual(attribute, value),
    lessThan: (attribute: string, value: string | number) => Query.lessThan(attribute, value),
    lessThanEqual: (attribute: string, value: string | number) =>
      Query.lessThanEqual(attribute, value),
    search: (attribute: string, value: string) => Query.search(attribute, value),
    orderAsc: (attribute: string) => Query.orderAsc(attribute),
    orderDesc: (attribute: string) => Query.orderDesc(attribute),
    limit: (limit: number) => Query.limit(limit),
    offset: (offset: number) => Query.offset(offset),
    cursorAfter: (documentId: string) => Query.cursorAfter(documentId),
    cursorBefore: (documentId: string) => Query.cursorBefore(documentId),
    isNull: (attribute: string) => Query.isNull(attribute),
    isNotNull: (attribute: string) => Query.isNotNull(attribute),
    between: (attribute: string, start: string | number, end: string | number) =>
      Query.between(attribute, start, end),
    startsWith: (attribute: string, value: string) => Query.startsWith(attribute, value),
    endsWith: (attribute: string, value: string) => Query.endsWith(attribute, value),
    contains: (attribute: string, value: string | string[]) => Query.contains(attribute, value),
    select: (attributes: string[]) => Query.select(attributes),
  };

  // ============ Error Handling ============

  private handleError(error: unknown): Observable<never> {
    const appwriteError = error as { message?: string; code?: number; type?: string };
    console.error('Appwrite Error:', appwriteError);

    const errorMessage = appwriteError.message || 'An unexpected error occurred';
    const errorCode = appwriteError.code || 500;

    return throwError(() => ({
      message: errorMessage,
      code: errorCode,
      type: appwriteError.type || 'unknown_error',
    }));
  }
}
