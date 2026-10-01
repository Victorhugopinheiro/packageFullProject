import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../middleware/requireAuth.js";
import { AuthServiceError } from "../user/auth/authErrors.js";

type GetEmployeesInput = {
    authUser: AuthUser | undefined;
};

class GetEmployeesService {
    async handle({ authUser }: GetEmployeesInput) {
        if (!authUser) {
            throw new AuthServiceError("Unauthorized", 401);
        }

        if (authUser.role !== "ADMIN") {
            throw new AuthServiceError("Forbidden", 403);
        }

        const employees = await prisma.user.findMany({
            where: {
                role: "WORKER",
                workerProfile: {
                    adminId: authUser.userId,
                },
            },
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
                        pricePerPackage: true,
                        image: true,
                        address: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return employees;
    }
}

export default GetEmployeesService;
