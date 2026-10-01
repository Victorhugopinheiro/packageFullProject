import { z } from "zod";
import { AuthServiceError } from "../../service/user/auth/authErrors.js";
import type { Request, Response } from "express";
import AddWorkerDeliveryService from "../../service/worker/addWorkerDeliveryService.js";
import type { AuthUser } from "../../middleware/requireAuth.js";

const addWorkerDeliverySchema = z.object({
    quantity: z.coerce.number().int().positive(),
    workerId: z.string().min(1),
    date: z.string().min(1),
});

type WorkerDeliveryRequest = Request & {
    authUser?: AuthUser;
};


class AddWorkerDeliveryController {

    private readonly service = new AddWorkerDeliveryService();


    async handle(req: Request, res: Response) {

        const parseBody = addWorkerDeliverySchema.safeParse(req.body);
        
        if (!parseBody.success) {
            return res.status(400).json({ message: "Invalid delivery data" });
        }



        try {
            const workerDeliveryRequest = req as WorkerDeliveryRequest;
            const delivery = await this.service.handle({
                quantity: parseBody.data.quantity,
                workerId: parseBody.data.workerId,
                date: parseBody.data.date,
                authUser: workerDeliveryRequest.authUser,
            });


            return res.status(201).json({ success: true });
        }

        catch (error) {
            if (error instanceof AuthServiceError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            return res.status(500).json({ message: "Internal server error" });
        }
    }




}

export default AddWorkerDeliveryController;