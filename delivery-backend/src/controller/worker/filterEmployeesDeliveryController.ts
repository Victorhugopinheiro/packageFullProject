

import type { Request, Response } from "express";
import type { AuthUser } from "../../middleware/requireAuth.js";
import { z } from "zod";
import FilterEmployeesDeliveryService from "../../service/worker/filterEmployeesDeliveryService.js";

type WorkerDeliveryRequest = Request & {
    authUser?: AuthUser;
};


const filterEmployeesDeliverySchema = z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
});

class FilterEmployeesDeliveryController {

    private readonly service = new FilterEmployeesDeliveryService();


    async handle(req: Request, res: Response) {


        const parsedQuery = filterEmployeesDeliverySchema.safeParse(req.query);

        

        if (!parsedQuery.success) {
            return res.status(400).json({ message: "Invalid filter data" });
        }

        if (!parsedQuery.data.fromDate && !parsedQuery.data.toDate) {
            return res.status(400).json({ message: "At least one filter must be provided" });
        }


        const workerDeliveryRequest = req as WorkerDeliveryRequest;

        if (!workerDeliveryRequest.authUser || workerDeliveryRequest.authUser.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden" });
        }



        try {

            const employeesFilters = await this.service.execute({
                authUserId: workerDeliveryRequest.authUser.userId,
                fromDate: parsedQuery.data.fromDate!,
                toDate: parsedQuery.data.toDate!,
            })

            if (!employeesFilters || employeesFilters.length === 0) {
                return res.status(404).json({ message: "No employees found for the given filters" });
            }

            return res.status(200).json({ employees: employeesFilters });


        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }

    }
}


export default FilterEmployeesDeliveryController;