import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../middleware/requireAuth.js";
import { AuthServiceError } from "../user/auth/authErrors.js";

type ListWorkerDeliveriesInput = {
    workerId: string;
    fromDate?: string;
    toDate?: string;
    authUser: AuthUser | undefined;
};

class ListWorkerDeliveriesService {
    async handle({ workerId, fromDate, toDate, authUser }: ListWorkerDeliveriesInput) {
        if (!authUser) {
            throw new AuthServiceError("Unauthorized", 401);
        }

        if (authUser.role !== "ADMIN") {
            throw new AuthServiceError("Forbidden", 403);
        }

        const workerProfile = await prisma.workerProfile.findFirst({
            where: {
                userId: workerId,
                adminId: authUser.userId,
            },
            select: { userId: true },
        });

        if (!workerProfile) {
            throw new AuthServiceError("Worker not found", 404);
        }

        const dateFilter: { gte?: Date; lte?: Date } = {};

        if (fromDate) {
            const parsedFromDate = new Date(fromDate);
            if (Number.isNaN(parsedFromDate.getTime())) {
                throw new AuthServiceError("Invalid fromDate", 400);
            }

            const normalizedFromDate = new Date(Date.UTC(
                parsedFromDate.getUTCFullYear(),
                parsedFromDate.getUTCMonth(),
                parsedFromDate.getUTCDate(),
            ));

            dateFilter.gte = normalizedFromDate;
        }

        if (toDate) {
            const parsedToDate = new Date(toDate);
            if (Number.isNaN(parsedToDate.getTime())) {
                throw new AuthServiceError("Invalid toDate", 400);
            }

            const normalizedToDate = new Date(Date.UTC(
                parsedToDate.getUTCFullYear(),
                parsedToDate.getUTCMonth(),
                parsedToDate.getUTCDate(),
            ));

            dateFilter.lte = normalizedToDate;
        }

        if (dateFilter.gte && dateFilter.lte && dateFilter.gte > dateFilter.lte) {
            throw new AuthServiceError("fromDate must be before or equal to toDate", 400);
        }

        const deliveries = await prisma.deliveryRecord.findMany({
            where: {
                workerId,
                ...(dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {}),
            },
            orderBy: {
                date: "desc",
            },
        });

        return deliveries;
    }
}

export default ListWorkerDeliveriesService;
