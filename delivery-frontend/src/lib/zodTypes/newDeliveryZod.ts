import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"

const today = () => format(new Date(), "yyyy-MM-dd")

const newDeliverySchema = z.object({
    quantity: z
        .number({ message: "Quantidade deve ser um numero" })
        .int({ message: "Quantidade deve ser um numero inteiro" })
        .min(1, { message: "Quantidade deve ser maior que zero" }),
    workerId: z.string().trim().min(1, { message: "Selecione ou informe um funcionario" }),
    date: z
        .string()
        .trim()
        .min(1, { message: "Data e obrigatoria" })
        .refine((value) => !Number.isNaN(Date.parse(value)), {
            message: "Informe uma data valida",
        }),
})

export type NewDeliveryFormInput = z.input<typeof newDeliverySchema>
export type NewDeliveryType = z.output<typeof newDeliverySchema>

export function NewDeliveryForm() {
    return useForm<NewDeliveryType>({
        resolver: zodResolver(newDeliverySchema),
        defaultValues: {
            quantity: 1,
            workerId: "",
            date: today(),
        },
    })
}
