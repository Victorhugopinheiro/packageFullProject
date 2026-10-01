import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export const meQueryKey = ["auth", "me"] as const;



export function useLogoutMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => api.post("/api/user/logout"),
        onSuccess: async () => {
            await queryClient.setQueryData(meQueryKey, null);
            await queryClient.invalidateQueries({ queryKey: meQueryKey });
        },
    });
}