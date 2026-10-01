import { LoginPayload } from "@/lib/auth/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";


export const meQueryKey = ["auth", "me"] as const;

export function useLoginMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: LoginPayload) => {
            const result = await api.post("/api/user/login", payload)
            return {
                data: result.data,
            }
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: meQueryKey });
        },
    });
}