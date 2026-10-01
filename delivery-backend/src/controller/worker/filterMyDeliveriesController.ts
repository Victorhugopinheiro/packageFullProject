import type { Request, Response } from "express";
import type { AuthUser } from "../../middleware/requireAuth.js";
import { z } from "zod";
import FilterMyDeliveriesService from "../../service/worker/filterMyDeliveriesService.js";

type WorkerDeliveryRequest = Request & {
    authUser?: AuthUser;
};

const filterMyDeliveriesSchema = z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
});

class FilterMyDeliveriesController {
    private readonly service = new FilterMyDeliveriesService();

    async handle(req: Request, res: Response) {
        const parsedQuery = filterMyDeliveriesSchema.safeParse(req.query);

        console.log(parsedQuery);

        if (!parsedQuery.success) {
            return res.status(400).json({ message: "Invalid filter data" });
        }

        if (!parsedQuery.data.fromDate && !parsedQuery.data.toDate) {
            return res.status(400).json({ message: "At least one filter must be provided" });
        }

        const workerDeliveryRequest = req as WorkerDeliveryRequest;

        if (!workerDeliveryRequest.authUser || workerDeliveryRequest.authUser.role !== "WORKER") {
            return res.status(403).json({ message: "Forbidden" });
        }

        try {
            const deliveries = await this.service.execute({
                workerId: workerDeliveryRequest.authUser.userId,
                ...(parsedQuery.data.fromDate ? { fromDate: parsedQuery.data.fromDate } : {}),
                ...(parsedQuery.data.toDate ? { toDate: parsedQuery.data.toDate } : {}),
            });

            if (deliveries.length === 0) {
                return res.status(404).json({ message: "No deliveries found for the given filters" });
            }

            return res.status(200).json({ deliveries: deliveries });
        } catch (error) {
            return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid filter data" });
        }
    }
}

export default FilterMyDeliveriesController;