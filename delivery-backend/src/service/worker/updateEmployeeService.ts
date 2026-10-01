import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../middleware/requireAuth.js";
import { Prisma } from "../../generated/prisma/client.js";
import { AuthServiceError } from "../user/auth/authErrors.js";
import { uploadImageToCloudinary } from "../../lib/cloudinary.js";

type UpdateEmployeeInput = {
    workerId: string;
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    pricePerPackage?: number | undefined;
    authUser: AuthUser | undefined;
    userImageFile?: Express.Multer.File | undefined;
};

function normalizeOptionalText(value: string | undefined) {
    if (value === undefined) {
        return undefined;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
}

class UpdateEmployeeService {
    async handle({ workerId, name, email, phone, address, pricePerPackage, authUser, userImageFile }: UpdateEmployeeInput) {
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

        if (
            name === undefined
            && email === undefined
            && phone === undefined
            && address === undefined
            && pricePerPackage === undefined
            && userImageFile === undefined
        ) {
            throw new AuthServiceError("At least one field must be provided", 400);
        }

        const normalizedPhone = normalizeOptionalText(phone);
        const normalizedAddress = normalizeOptionalText(address);

        const workerProfileData: {
            pricePerPackage?: number;
            phone?: string | null;
            address?: string | null;
            image?: string | null;
        } = {};

        if (pricePerPackage !== undefined) {
            workerProfileData.pricePerPackage = pricePerPackage;
        }


        let imageUrl: string | null = null;

        if (userImageFile !== undefined) {

            try {
                imageUrl = await uploadImageToCloudinary(userImageFile);
                workerProfileData.image = imageUrl;
            } catch {
                throw new AuthServiceError("Failed to upload worker image", 502);
            }

        }

        if (normalizedPhone !== undefined) {
            workerProfileData.phone = normalizedPhone;
        }

        if (normalizedAddress !== undefined) {
            workerProfileData.address = normalizedAddress;
        }

        const userData: Prisma.UserUpdateInput = {
            ...(name !== undefined ? { name } : {}),
            ...(email !== undefined ? { email } : {}),
            ...(Object.keys(workerProfileData).length > 0
                ? {
                    workerProfile: {
                        update: workerProfileData,
                    },
                }
                : {}),
        };

        try {
            const employee = await prisma.user.update({
                where: { id: workerId },
                data: userData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    workerProfile: {
                        select: {
                            phone: true,
                            address: true,
                            image: true,
                            pricePerPackage: true,
                        },
                    },
                },
            });

            return employee;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new AuthServiceError("Email already in use", 409);
                }

                if (error.code === "P2025") {
                    throw new AuthServiceError("Worker not found", 404);
                }
            }

            throw error;
        }
    }
}

export default UpdateEmployeeService;