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

const listWorkerDeliveriesSchema = z
    .object({
        workerId: z.string().trim().min(1, { message: "Selecione um funcionario" }),
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

export type ListWorkerDeliveriesInput = z.input<typeof listWorkerDeliveriesSchema>
export type ListWorkerDeliveriesType = z.output<typeof listWorkerDeliveriesSchema>

export function FilterDeliveryForm() {
    return useForm<ListWorkerDeliveriesInput, unknown, ListWorkerDeliveriesType>({
        resolver: zodResolver(listWorkerDeliveriesSchema),
        defaultValues: {
            workerId: "",
            fromDate: undefined,
            toDate: undefined,
        },
    })
}
