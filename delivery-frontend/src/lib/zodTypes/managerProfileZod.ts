import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import isMobilePhone from "validator/lib/isMobilePhone"
import { z } from "zod"

export const managerProfileSchema = z.object({
    workerId: z.string().trim().min(1, { message: "Selecione um funcionario" }),
    name: z.string().trim().min(1, { message: "Nome e obrigatorio" }),
    email: z.string().trim().email({ message: "Informe um e-mail valido" }),
    address: z.string().trim().min(1, { message: "Endereco e obrigatorio" }),
    pricePerPackage: z
        .string()
        .trim()
        .min(1, { message: "Valor por pacote e obrigatorio" })
        .refine((value) => {
            const normalized = value.replace(",", ".")
            return /^\d+(\.\d{1,2})?$/.test(normalized)
        }, { message: "Informe um valor valido, por exemplo 15 ou 15.50" }),
    phone: z.string().trim().superRefine((value, ctx) => {
        const digits = value.replace(/\D/g, "")

        if (digits.length < 10) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Telefone e obrigatorio",
            })
            return
        }

        if (!isMobilePhone(digits, "pt-BR")) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Numero de telefone invalido",
            })
        }
    }),
})

export type ManagerProfileFormInput = z.input<typeof managerProfileSchema>
export type ManagerProfileFormValues = z.output<typeof managerProfileSchema>

export const managerProfileDefaultValues: ManagerProfileFormInput = {
    workerId: "",
    name: "",
    email: "",
    address: "",
    phone: "",
    pricePerPackage: "",
   
}

export function ManagerProfileForm() {
    return useForm<ManagerProfileFormInput, unknown, ManagerProfileFormValues>({
        resolver: zodResolver(managerProfileSchema),
        defaultValues: managerProfileDefaultValues,
    })
}