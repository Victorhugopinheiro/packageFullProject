import { useQuery, UseQueryResult } from "@tanstack/react-query"
import apiPrivate from "@/lib/apiPrivate"
import {
    ListWorkerDeliveriesApiResponse,
    ListWorkerDeliveriesParams,
} from "@/lib/types/delivery"

const filterWorkerDeliveriesQueryKey = ["worker", "deliveries", "filter"] as const

export interface LastMonthTrendItem {
    label: string
    value: number
}

interface listWorkerDeliveriesType {
    fromDate?: string
    toDate?: string
}

function formatApiDate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}/${month}/${day}`
}

function getDefaultParams(): listWorkerDeliveriesType {
    const toDate = new Date()
    const fromDate = new Date(toDate)
    fromDate.setDate(toDate.getDate() - 30)

    return {
        fromDate: formatApiDate(fromDate),
        toDate: formatApiDate(toDate),
    }
}

function partDate(date: string) {
    const [year, month, day] = date.slice(0, 10).split("-").map(Number)
    return { year, month, day }
}

function buildWeeklyTrend(data: ListWorkerDeliveriesApiResponse): LastMonthTrendItem[] {

   

    const weeklyQuantity = new Map<number, number>()

    data.employees.forEach((delivery) => {

        const dateTeste = new Date(delivery.date)
        if (Number.isNaN(dateTeste.getTime())) {
            return
        }

        const date = partDate(delivery.date)

        const week = Math.min(5, Math.max(1, Math.ceil(date.day / 7)))
        const currentValue = weeklyQuantity.get(week) ?? 0
       
        weeklyQuantity.set(week, currentValue + delivery.quantity)

    })
    

    return [1, 2, 3, 4, 5,].map((week) => ({
        label: `${week}ª semm`,
        value: weeklyQuantity.get(week) ?? 0,
    }))
}

export function useFilterWorkerDeliveries(
    params?: listWorkerDeliveriesType,
): UseQueryResult<LastMonthTrendItem[], Error> {

    const queryParams = params ?? getDefaultParams()

    return useQuery({
        queryKey: [...filterWorkerDeliveriesQueryKey, queryParams],
        queryFn: async () => {
            const result = await apiPrivate.get<ListWorkerDeliveriesApiResponse>("/api/worker/employeesDelivery", {
                params: queryParams,
            })

            const formatedResult = buildWeeklyTrend(result.data)
          
            return formatedResult
        },



    })
}