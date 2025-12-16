export interface AppwriteDocument<T = Record<string, unknown>> {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  data: T;
}

export interface AppwriteListResponse<T> {
  total: number;
  documents: T[];
}

export interface AppwriteError {
  message: string;
  code: number;
  type: string;
}

export interface FunctionExecutionResult<T = unknown> {
  responseStatusCode: number;
  responseBody: string;
  logs: string;
  errors: string;
  duration: number;
  parsedResponse?: T;
}
