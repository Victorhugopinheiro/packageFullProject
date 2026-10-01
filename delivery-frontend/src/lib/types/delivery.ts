export interface WorkerDeliveryRaw {
    id: string
    createdAt: string
    workerId: string
    date: string
    quantity: number
    totalAmount: number
}

export interface ListWorkerDeliveriesApiResponse {
    employees: WorkerDeliveryRaw[]
}


export interface ListWorkerDeliveriesApiResponse2 {
    deliveries: WorkerDeliveryRaw[]
}




export interface ListWorkerDeliveriesParams {
    workerId: string
    fromDate?: string
    toDate?: string
}

export interface WorkerDelivery {
    id: string
    createdAt: Date
    workerId: string
    date: Date
    quantity: number
    totalAmount: number
}

export interface ListWorkerDeliveriesResponse {
    deliveries: WorkerDelivery[]
}

export function mapWorkerDeliveriesResponse(
    payload: ListWorkerDeliveriesApiResponse2,
): ListWorkerDeliveriesResponse {
    return {
        deliveries: payload.deliveries.map((delivery) => ({
            ...delivery,
            createdAt: new Date(delivery.createdAt),
            date: new Date(delivery.date)
        })),
    }
}
