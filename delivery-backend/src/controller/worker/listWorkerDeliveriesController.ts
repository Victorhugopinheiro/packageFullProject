import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthUser } from "../../middleware/requireAuth.js";
import { AuthServiceError } from "../../service/user/auth/authErrors.js";
import ListWorkerDeliveriesService from "../../service/worker/listWorkerDeliveriesService.js";

const listWorkerDeliveriesSchema = z.object({
    workerId: z.string().min(1),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
});

type WorkerDeliveryRequest = Request & {
    authUser?: AuthUser;
};

class ListWorkerDeliveriesController {
    private readonly service = new ListWorkerDeliveriesService();

    async handle(req: Request, res: Response) {
        const parsedQuery = listWorkerDeliveriesSchema.safeParse(req.query);

        if (!parsedQuery.success) {
            return res.status(400).json({ message: "Invalid filter data" });
        }

        const workerDeliveryRequest = req as WorkerDeliveryRequest;

        try {
            const filters = {
                workerId: parsedQuery.data.workerId,
                authUser: workerDeliveryRequest.authUser,
                ...(parsedQuery.data.fromDate ? { fromDate: parsedQuery.data.fromDate } : {}),
                ...(parsedQuery.data.toDate ? { toDate: parsedQuery.data.toDate } : {}),
            };

            const deliveries = await this.service.handle({
                ...filters,
            });

            return res.status(200).json({ deliveries });
        } catch (error) {
            if (error instanceof AuthServiceError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default ListWorkerDeliveriesController;
