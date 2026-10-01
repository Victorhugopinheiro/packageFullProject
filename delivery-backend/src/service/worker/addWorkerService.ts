import type { Express } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { uploadImageToCloudinary } from "../../lib/cloudinary.js";
import { AuthServiceError } from "../user/auth/authErrors.js";
import type { AuthUser } from "../../middleware/requireAuth.js";

type AddWorkerInput = {
    name: string;
    email: string;
    password: string;
    phone: string | undefined;
    address: string | undefined;
    pricePerPackage: number;
    imageFile: Express.Multer.File | undefined;
    authUser: AuthUser | undefined;
};

class AddWorkerService {
    async handle(input: AddWorkerInput) {
        if (!input.authUser) {
            throw new AuthServiceError("Unauthorized", 401);
        }

        if (input.authUser.role !== "ADMIN") {
            throw new AuthServiceError("Forbidden", 403);
        }

        const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

        if (existingUser) {
            throw new AuthServiceError("Email already in use", 409);
        }

        let imageUrl: string | null = null;

        if (input.imageFile) {
            try {
                imageUrl = await uploadImageToCloudinary(input.imageFile);
            } catch {
                throw new AuthServiceError("Failed to upload worker image", 502);
            }
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        try {
            const worker = await prisma.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    password: passwordHash,
                    role: "WORKER",
                    workerProfile: {
                        create: {
                            adminId: input.authUser.userId,
                            pricePerPackage: input.pricePerPackage,
                            ...(input.phone ? { phone: input.phone } : {}),
                            ...(input.address ? { address: input.address } : {}),
                            ...(imageUrl ? { image: imageUrl } : {}),
                        },
                    },
                },
                include: { workerProfile: true },
            });

            return worker;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new AuthServiceError("Email already in use", 409);
                }

                if (error.code === "P2003") {
                    throw new AuthServiceError("Invalid admin reference", 400);
                }

                if (error.code === "P2021" || error.code === "P2022") {
                    throw new AuthServiceError("Database schema is out of sync", 500);
                }
            }

            throw error;
        }
    }
}

export default AddWorkerService;
