export interface User {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  prefs: Record<string, unknown>;
  $createdAt: string;
  $updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}
