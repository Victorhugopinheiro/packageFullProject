import "server-only";

import { cookies } from "next/headers";
import apiPrivate from "../apiPrivate";


import { AuthApiResponse, AuthUser } from "../auth/types";
import { redirect } from "next/navigation";
import { authApiConfig, buildAuthUrl } from "@/lib/auth/config";
import { headers } from "next/headers";

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


async function IsAdmin() {
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

        const me = await apiPrivate.get<AuthApiResponse>(requestUrl, {
            headers: {
                Cookie: authCookies,
            },
        });

        console.log("User data:", me.data.user);

        console.log("User dataaaaaaaa:", me.data.user.role);


        return me.data.user.role === "ADMIN";


    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}


export async function IsUserAdmin() {

    const role = await IsAdmin();

    if (!role) {
        redirect("/dashboard/employeeMetrics")
    }

}