import "server-only";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authApiConfig, buildAuthUrl } from "@/lib/auth/config";
import api from "../apiClient";
import apiPrivate from "../apiPrivate";

function normalizeUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

async function resolveServerBaseUrl(): Promise<string> {
  if (authApiConfig.apiBaseUrl) {
    return normalizeUrl(authApiConfig.apiBaseUrl);
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return authApiConfig.apiBaseUrl;
  }

  return `${protocol}://${host}`;
}

export async function hasAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(
    cookieStore.get("accessToken")?.value ||
    cookieStore.get("refreshToken")?.value
  );
}

async function hasValidSessionPublic(): Promise<boolean> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;


  if (!accessToken && !refreshToken) {
    return false;
  }

  // Build a minimal Cookie header with only auth cookies
  const authCookies = [
    accessToken ? `accessToken=${encodeURIComponent(accessToken)}` : null,
    refreshToken ? `refreshToken=${encodeURIComponent(refreshToken)}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  const baseUrl = await resolveServerBaseUrl();
  const meUrl = buildAuthUrl(authApiConfig.mePath);
  const requestUrl =
    meUrl.startsWith("http://") || meUrl.startsWith("https://")
      ? meUrl
      : `${baseUrl}${meUrl}`;


  try {
    const response = await api.get(requestUrl, {
      headers: {
        Cookie: authCookies,
      },
      validateStatus: () => true,
    });


    return response.status === 200;
  } catch {
    return false;
  }
}




async function hasValidSessionPrivate(): Promise<boolean> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;


  if (!accessToken && !refreshToken) {
    return false;
  }

  // Build a minimal Cookie header with only auth cookies
  const authCookies = [
    accessToken ? `accessToken=${encodeURIComponent(accessToken)}` : null,
    refreshToken ? `refreshToken=${encodeURIComponent(refreshToken)}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  const baseUrl = await resolveServerBaseUrl();
  const meUrl = buildAuthUrl(authApiConfig.mePath);
  const requestUrl =
    meUrl.startsWith("http://") || meUrl.startsWith("https://")
      ? meUrl
      : `${baseUrl}${meUrl}`;


  try {
  
    const response = await apiPrivate.get(requestUrl, {
      headers: {
        Cookie: authCookies,
      },
      validateStatus: () => true,
    });


    return response.status === 200;
  } catch {
    return false;
  }
}



export async function requireAuth(): Promise<void> {
  const authenticated = await hasValidSessionPrivate();

  if (!authenticated) {
    redirect("/login");
  }
}

export async function redirectIfAuthenticated(): Promise<void> {
  const authenticated = await hasValidSessionPublic();

  if (authenticated) {
    redirect("/dashboard");
  }
}
