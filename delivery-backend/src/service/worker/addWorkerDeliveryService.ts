
import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../middleware/requireAuth.js";
import { AuthServiceError } from "../user/auth/authErrors.js";

type AddWorkerDeliveryInput = {
    quantity: number;
    workerId: string;
    date: string;
    authUser: AuthUser | undefined;
};

class AddWorkerDeliveryService {
    async handle({ quantity, workerId, date, authUser }: AddWorkerDeliveryInput) {
        if (!authUser) {
            throw new AuthServiceError("Unauthorized", 401);
        }

        if (authUser.role !== "ADMIN") {
            throw new AuthServiceError("Forbidden", 403);
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            throw new AuthServiceError("Invalid date", 400);
        }

        const normalizedDate = new Date(Date.UTC(
            parsedDate.getUTCFullYear(),
            parsedDate.getUTCMonth(),
            parsedDate.getUTCDate(),
        ));

        const workerProfile = await prisma.workerProfile.findFirst({
            where: {
                userId: workerId,
                adminId: authUser.userId,
            },
            select: { userId: true, pricePerPackage: true },
        });

        if (!workerProfile) {
            throw new AuthServiceError("Worker not found", 404);
        }

        const totalAmount = quantity * workerProfile.pricePerPackage;

        const delivery = await prisma.deliveryRecord.create({
            data: {
                workerId,
                date: normalizedDate,
                quantity,
                totalAmount,
            },
        });

        return delivery;
    }
}

export default AddWorkerDeliveryService;