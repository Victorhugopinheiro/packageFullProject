import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const dateField = z
    .string()
    .optional()
    .transform((value) => {
        if (!value) {
            return undefined
        }

        const trimmed = value.trim()
        return trimmed === "" ? undefined : trimmed
    })
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
        message: "Informe uma data valida",
    })

const listWorkerDeliverieSchema = z
    .object({
        fromDate: dateField,
        toDate: dateField,
    })
    .refine(
        (value) => {
            if (!value.fromDate || !value.toDate) {
                return true
            }

            return new Date(value.fromDate) <= new Date(value.toDate)
        },
        {
            message: "Data inicial deve ser menor ou igual a data final",
            path: ["toDate"],
        },
    )

export type ListWorkerDeliverieInput = z.input<typeof listWorkerDeliverieSchema>
export type ListWorkerDeliverieType = z.output<typeof listWorkerDeliverieSchema>

export function FilterDeliveryForm() {
    return useForm<ListWorkerDeliverieInput, unknown, ListWorkerDeliverieType>({
        resolver: zodResolver(listWorkerDeliverieSchema),
        defaultValues: {

            fromDate: undefined,
            toDate: undefined,
        },
    })
}
