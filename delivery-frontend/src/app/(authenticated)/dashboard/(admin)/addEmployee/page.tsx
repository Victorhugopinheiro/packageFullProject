"use client"

import * as React from "react"
import { Controller, FieldErrors } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { WorkerForm, WorkerType } from "../../../../../lib/zodTypes/addWorkerZod"
import { ChangeImage } from "../../../_components/changeImage"
import api from "@/lib/apiPrivate"
import { toast } from "sonner"
import { formatPhone, normalizePhone } from "@/lib/formatPhone"


export default function AddEmployee() {
    const form = WorkerForm()
    const [image, setImage] = React.useState<File | null>(null)



    async function onSubmit(data: WorkerType) {
     
        if (!image) {
            toast.error("Por favor, selecione uma imagem para o funcionário antes de enviar.")
            return
        }

        try {

            const formData = new FormData()
            formData.append("name", data.name)
            formData.append("email", data.email)
            formData.append("password", data.password)
            formData.append("phone", normalizePhone(data.phone))
            formData.append("address", data.address)
            formData.append("pricePerPackage", Number(data.pricePerPackage.replace(",", ".")).toString())
            formData.append("image", image as File)


            const response = await api.post("/api/worker/addWorker", formData)

            toast.success("Funcionário cadastrado com sucesso!")
            form.reset()
            setImage(null)

        } catch (error) {
            toast.error("Erro ao cadastrar funcionário. Por favor, tente novamente.")
        }


    }

    function onInvalid(errors: FieldErrors<WorkerType>) {
        void errors
    }

    return (
        <div className="flex w-full gap-4 p-4">
            <Card className="w-full shadow-lg ">
                <CardHeader>
                    <CardTitle>Cadastrando novo funcionário</CardTitle>
                    <CardDescription>
                        Preencha os campos abaixo para cadastrar um novo funcionário no sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit, onInvalid)}>

                        <div className="  w-full flex justify-center">
                            <ChangeImage setImage={setImage} />

                        </div>


                        <FieldGroup className="flex flex-col gap-6 ">
                            <Controller

                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field className="" data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="worker-name">
                                            Nome do funcionário
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="worker-name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Digite o nome do funcionário"
                                            autoComplete="off"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="worker-email">
                                            E-mail do funcionário
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="worker-email"
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Digite o e-mail do funcionário"
                                            autoComplete="off"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="worker-password">
                                            Senha
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="worker-password"
                                            type="password"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Digite a senha do funcionário"
                                            autoComplete="off"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="phone"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="worker-phone">
                                            Telefone do funcionárioo
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            type="tel"
                                            id="worker-phone"
                                            inputMode="tel"
                                            value={field.value ?? ""}
                                            onChange={(event) => field.onChange(formatPhone(event.target.value))}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Digite o telefone do funcionário"
                                            autoComplete="tel"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="address"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="worker-address">
                                            Endereço do funcionário
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="worker-address"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Digite o endereço do funcionário"
                                            autoComplete="off"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="pricePerPackage"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="worker-price-per-package">
                                            Valor por pacote
                                        </FieldLabel>
                                        <Input
                                            id="worker-price-per-package"
                                            type="text"
                                            inputMode="decimal"
                                            value={field.value ?? ""}
                                            onChange={(event) => {
                                                const sanitized = event.target.value.replace(/[^0-9,.]/g, "")
                                                field.onChange(sanitized)
                                            }}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Valor recebido por pacote"
                                            autoComplete="off"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter>
                    <Field orientation="horizontal">

                        <Button className={"w-full py-4 bg-[#0077b6] hover:bg-[#03045e]"} type="submit" form="form-rhf-demo">
                            Salvar funcionário
                        </Button>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    )
}
