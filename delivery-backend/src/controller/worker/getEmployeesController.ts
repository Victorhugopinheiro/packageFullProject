import type { Request, Response } from "express";
import type { AuthUser } from "../../middleware/requireAuth.js";
import { AuthServiceError } from "../../service/user/auth/authErrors.js";
import GetEmployeesService from "../../service/worker/getEmployeesService.js";

type WorkerRequest = Request & {
    authUser?: AuthUser;
};

class GetEmployeesController {
    private readonly service = new GetEmployeesService();

    async handle(req: Request, res: Response) {
        const workerRequest = req as WorkerRequest;

        try {
            const employees = await this.service.handle({
                authUser: workerRequest.authUser,
            });

            return res.status(200).json({ employees });
        } catch (error) {
            if (error instanceof AuthServiceError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            console.error("GetEmployeesController error:", error);

            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default GetEmployeesController;


