import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export type DeliveryRecord = Prisma.DeliveryRecordModel;

interface FilterMyDeliveriesInput {
    workerId: string;
    fromDate?: string;
    toDate?: string;
}

class FilterMyDeliveriesService {
    async execute({ workerId, fromDate, toDate }: FilterMyDeliveriesInput): Promise<DeliveryRecord[]> {

        const userWorker = prisma.workerProfile.findUnique({
            where: { userId: workerId },
        })


        if (!userWorker) {
            throw new Error("Worker not found");
        }


        const dateFilter: { gte?: Date; lte?: Date } = {};

        if (fromDate) {
            const parsedFromDate = new Date(fromDate);

            if (Number.isNaN(parsedFromDate.getTime())) {
                throw new Error("Invalid fromDate");
            }

            dateFilter.gte = new Date(Date.UTC(
                parsedFromDate.getUTCFullYear(),
                parsedFromDate.getUTCMonth(),
                parsedFromDate.getUTCDate(),
            ));
        }

        if (toDate) {
            const parsedToDate = new Date(toDate);

            if (Number.isNaN(parsedToDate.getTime())) {
                throw new Error("Invalid toDate");
            }

            dateFilter.lte = new Date(Date.UTC(
                parsedToDate.getUTCFullYear(),
                parsedToDate.getUTCMonth(),
                parsedToDate.getUTCDate(),
            ));
        }

        if (dateFilter.gte && dateFilter.lte && dateFilter.gte > dateFilter.lte) {
            throw new Error("fromDate must be before or equal to toDate");
        }

        const deliveries = await prisma.deliveryRecord.findMany({
            where: {
                workerId,
                date: dateFilter,
            },
            orderBy: {
                date: "desc",
            },
        });

        return deliveries;
    }
}

export default FilterMyDeliveriesService;