import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthUser } from "../../middleware/requireAuth.js";
import { AuthServiceError } from "../../service/user/auth/authErrors.js";
import UpdateEmployeeService from "../../service/worker/updateEmployeeService.js";

const updateEmployeeSchema = z
    .object({
        workerId: z.string().min(1).optional(),
        workerID: z.string().min(1).optional(),
        name: z.string().trim().min(1).optional(),
        email: z.string().trim().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        pricePerPackage: z.coerce.number().positive().optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.workerId && !data.workerID) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "workerId is required",
                path: ["workerId"],
            });
        }
    });

type WorkerRequest = Request & {
    authUser?: AuthUser;
    file?: Express.Multer.File;
};

class UpdateEmployeeController {
    private readonly service = new UpdateEmployeeService();

    async handle(req: Request, res: Response) {
        const workerRequest = req as WorkerRequest;
        const parsedBody = updateEmployeeSchema.safeParse(req.body);


        if (!parsedBody.success) {
            return res.status(400).json({ message: "Invalid employee data" });
        }

        const workerId = parsedBody.data.workerId ?? parsedBody.data.workerID;

        const hasUpdatableField = (
            parsedBody.data.name !== undefined
            || parsedBody.data.email !== undefined
            || parsedBody.data.phone !== undefined
            || parsedBody.data.address !== undefined
            || parsedBody.data.pricePerPackage !== undefined
            || workerRequest.file !== undefined
        );

        if (!hasUpdatableField) {
            return res.status(400).json({ message: "At least one field must be provided" });
        }


        try {
            const employee = await this.service.handle({
                workerId: workerId!,
                userImageFile: workerRequest.file,
                ...(parsedBody.data.name !== undefined ? { name: parsedBody.data.name } : {}),
                ...(parsedBody.data.email !== undefined ? { email: parsedBody.data.email } : {}),
                ...(parsedBody.data.phone !== undefined ? { phone: parsedBody.data.phone } : {}),
                ...(parsedBody.data.address !== undefined ? { address: parsedBody.data.address } : {}),
                ...(parsedBody.data.pricePerPackage !== undefined ? { pricePerPackage: parsedBody.data.pricePerPackage } : {}),
                authUser: workerRequest.authUser,
            });

            return res.status(200).json({ employee });
        } catch (error) {
            if (error instanceof AuthServiceError) {
                return res.status(error.statusCode).json({ message: error.message });
            }


            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default UpdateEmployeeController;