export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  email: string;
  name?: string;
  role?: string;
}

export interface AuthApiResponse {
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthApiConfig {
  apiBaseUrl: string;
  mePath: string;
}
