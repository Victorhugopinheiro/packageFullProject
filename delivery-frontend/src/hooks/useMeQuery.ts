
import { AuthApiResponse, AuthUser } from "@/lib/auth/types";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import { ApiError } from "next/dist/server/api-utils";

export const meQueryKey = ["auth", "me"] as const;

export function useMeQuery(): UseQueryResult<AuthApiResponse | null, Error> {
    return useQuery({
        queryKey: meQueryKey,
        queryFn: async () => {

            const result = await api.get<AuthApiResponse | null>("/api/user/me");

            return result.data;
        },
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
            if (error instanceof ApiError && error.statusCode === 401) {
                return false;
            }
            return failureCount < 1;
        },
    })
}