import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import isMobilePhone from "validator/lib/isMobilePhone"

const schemaWorker = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    email: z.string().trim().email({ message: "Endereço de e-mail inválido" }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    address: z.string().min(1, { message: "Endereço é obrigatório" }),
    pricePerPackage: z.string().trim().min(1, { message: "Valor por pacote é obrigatório" }).refine((value) => {
        const normalized = value.replace(",", ".")
        return /^\d+(\.\d{1,2})?$/.test(normalized)
    }, { message: "Informe um valor válido, por exemplo 15 ou 15.50" }),
    phone: z.string().trim().superRefine((value, ctx) => {
        const digits = value.replace(/\D/g, "")

        if (digits.length < 10) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Telefone é obrigatório",
            })
            return
        }

        if (!isMobilePhone(digits, "pt-BR")) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Número de telefone inválido",
            })
        }
    }),
})


export type WorkerType = z.infer<typeof schemaWorker>


export function WorkerForm() {
    return useForm<WorkerType>({
        resolver: zodResolver(schemaWorker),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            pricePerPackage: "",

        },
    })
}