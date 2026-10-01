import apiPrivate from "@/lib/apiPrivate";
import { GetMyEmployeesResponse } from "@/lib/types/employee";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

export const employeesQueryKey = ["worker", "employees"] as const;

export function useEmployeesQuery(): UseQueryResult<GetMyEmployeesResponse, Error> {
    return useQuery({
        queryKey: employeesQueryKey,
        queryFn: async () => {
            const result = await apiPrivate.get<GetMyEmployeesResponse>("/api/worker/employees");
            return result.data;
        },
    });
}