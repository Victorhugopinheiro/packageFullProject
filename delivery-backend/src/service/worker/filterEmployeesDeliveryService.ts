
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export type DeliveryRecord = Prisma.DeliveryRecordModel


interface UserInfos {
    authUserId: string;
    fromDate: string;
    toDate: string;
    // Add other relevant properties for a delivery
}




class FilterEmployeesDeliveryService {
    async execute({ authUserId, fromDate, toDate }: UserInfos): Promise<DeliveryRecord[]> {

        const userEmployees = await prisma.workerProfile.findMany({
            where: {
                adminId: authUserId,
            }
        })

        if (!userEmployees || userEmployees.length === 0) {
            return [];
        }


        const dateFilter: { gte?: Date, lte?: Date } = {}

        if (fromDate) {
            const parsedFromDate = new Date(fromDate);

            if (Number.isNaN(parsedFromDate.getTime())) {
                throw new Error("Invalid fromDate");
            }

            const normalizedFromDate = new Date(Date.UTC(
                parsedFromDate.getUTCFullYear(),
                parsedFromDate.getUTCMonth(),
                parsedFromDate.getUTCDate(),
            ))


            dateFilter.gte = normalizedFromDate;

        }


        if (toDate) {
            const parsedToDate = new Date(toDate);

            if (Number.isNaN(parsedToDate.getTime())) {
                throw new Error("Invalid toDate");
            }


            const normalizedToDate = new Date(Date.UTC(
                parsedToDate.getUTCFullYear(),
                parsedToDate.getUTCMonth(),
                parsedToDate.getUTCDate(),
            ))

            dateFilter.lte = normalizedToDate;
        }

        if (dateFilter.gte && dateFilter.lte && dateFilter.gte > dateFilter.lte) {
            throw new Error("fromDate must be before or equal to toDate");
        }

        if (!dateFilter.gte || !dateFilter.lte) {
            throw new Error("At least one filter must be provided");
        }


        const deliveries = await prisma.deliveryRecord.findMany({
            where: {
                workerId: {
                    in: userEmployees.map(employee => employee.userId)
                },
                date: dateFilter
            },

            orderBy: {
                date: "desc"
            }
        })


        return deliveries;




    }

}

export default FilterEmployeesDeliveryService;