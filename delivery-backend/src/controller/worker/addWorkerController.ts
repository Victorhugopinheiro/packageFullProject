import type { Request, Response } from "express";
import { z } from "zod";
import { AuthServiceError } from "../../service/user/auth/authErrors.js";
import AddWorkerService from "../../service/worker/addWorkerService.js";
import type { AuthUser } from "../../middleware/requireAuth.js";

const addWorkerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  pricePerPackage: z.coerce.number().positive(),
});

type WorkerRequest = Request & {
  authUser?: AuthUser;
  file?: Express.Multer.File;
};

class AddWorkerController {
  private readonly service = new AddWorkerService();

  async handle(req: Request, res: Response) {
   
    const parsedBody = addWorkerSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ message: "Invalid worker data" });
    }

    const workerRequest = req as WorkerRequest;

    try {
      const worker = await this.service.handle({
        name: parsedBody.data.name,
        email: parsedBody.data.email,
        password: parsedBody.data.password,
        phone: parsedBody.data.phone,
        address: parsedBody.data.address,
        pricePerPackage: parsedBody.data.pricePerPackage,
        imageFile: workerRequest.file,
        authUser: workerRequest.authUser,
      });

      return res.status(201).json({ worker });
    } catch (error) {
      if (error instanceof AuthServiceError) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      console.error("AddWorkerController error:", error);

      if (process.env.NODE_ENV !== "production") {
        return res.status(500).json({
          message: "Internal server error",
          detail: error instanceof Error ? error.message : "Unknown error",
        });
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AddWorkerController;