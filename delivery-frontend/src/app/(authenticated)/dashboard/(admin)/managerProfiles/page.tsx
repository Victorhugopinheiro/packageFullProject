"use client"

import * as React from "react"
import { Controller, FieldErrors } from "react-hook-form"
import { toast } from "sonner"
import apiPrivate from "@/lib/apiPrivate"
import { useEmployeesQuery } from "@/hooks/useEmployeesQuery"
import { employeesQueryKey } from "@/hooks/useEmployeesQuery"
import { formatPhone } from "@/lib/formatPhone"
import { Employee } from "@/lib/types/employee"
import {
    managerProfileDefaultValues,
    ManagerProfileForm,
    ManagerProfileFormValues,
} from "@/lib/zodTypes/managerProfileZod"
import { useQueryClient } from "@tanstack/react-query"
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
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChangeImage } from "../../../_components/changeImage"





type WorkerOption = {
    id: string
    name: string
}

function mapEmployeeToFormValues(employee: Employee): ManagerProfileFormValues {
    return {
        workerId: employee.id,
        name: employee.name ?? "",
        email: employee.email ?? "",
        address: employee.workerProfile?.address ?? "",
        phone: formatPhone(employee.workerProfile?.phone ?? ""),
        pricePerPackage:
            employee.workerProfile?.pricePerPackage !== undefined
                ? String(employee.workerProfile.pricePerPackage)
                : "",
    }
}

export default function ManagerProfilesPage() {
    const form = ManagerProfileForm()

    const employeesQuery = useEmployeesQuery()

    const queryClient = useQueryClient();

    const [image, setImage] = React.useState<File | null>(null)

    const workers: WorkerOption[] = (employeesQuery.data?.employees ?? [])
        .map((employee) => {
            const id = String(employee.id ?? "").trim()
            const name = String(employee.name ?? "").trim()

            if (!id || !name) {
                return null
            }

            return { id, name }
        })
        .filter((worker): worker is WorkerOption => worker !== null)

    const items = workers.map((worker) => ({
        value: worker.id,
        label: worker.name,
    }))

    const workerId = form.watch("workerId")
    const selectedWorker = React.useMemo(
        () => (employeesQuery.data?.employees ?? []).find((employee) => employee.id === workerId),
        [employeesQuery.data?.employees, workerId],
    )

    React.useEffect(() => {
        if (!workerId) {
            form.reset(managerProfileDefaultValues)
            return
        }

        if (!selectedWorker) {
            return
        }

        form.reset(mapEmployeeToFormValues(selectedWorker))
    }, [form, selectedWorker, workerId])

    async function onSubmit(data: ManagerProfileFormValues) {


        const changedData: Partial<ManagerProfileFormValues> = {}
        const originalData = selectedWorker ? mapEmployeeToFormValues(selectedWorker) : managerProfileDefaultValues

        for (const key of Object.keys(data) as (keyof ManagerProfileFormValues)[]) {
            if (data[key] !== originalData[key]) {
                changedData[key] = data[key]
            }
        }

        if (Object.keys(changedData).length === 0 && !image) {
            toast.error("Nenhuma alteração foi feita.")
            return
        }

        const formData = new FormData()

        formData.append("workerId", data.workerId)

        for (const key in changedData) {
            if (changedData.hasOwnProperty(key)) {
                formData.append(key, changedData[key as keyof ManagerProfileFormValues] ?? "")
            }
        }

        if (image) {
            formData.append("image", image)
        }

        if (formData.get("workerId") === null) {
            toast.error("Selecione um funcionario antes de salvar.")
            return
        }


        try {

            const response = await apiPrivate.patch(`/api/worker/updateEmployee`, formData)

            if (response.status === 200) {

                queryClient.invalidateQueries({ queryKey: employeesQueryKey })

                setImage(null)

                return toast.success("Perfil do funcionario atualizado com sucesso.")
            }


        } catch (error) {


            toast.error("Ocorreu um erro ao atualizar o perfil do funcionario.")
        }

    }

    function onInvalid(errors: FieldErrors<ManagerProfileFormValues>) {
        toast.error("Revise os campos antes de salvar")
    }

    const imageSrc = selectedWorker?.workerProfile?.image ?? ""

    const selectedWorkerName = workers.find((worker) => worker.id === workerId)?.name

    return (
        <div className="grid w-full gap-4 p-4 lg:grid-cols-[2fr_1fr]">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>
                        Selecione um funcionario para carregar os dados e editar as informacoes da conta.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form id="form-manager-profile" onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
                        <FieldGroup className="flex flex-col gap-6">
                            <Controller
                                name="workerId"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="manager-profile-worker-id">Funcionario</FieldLabel>
                                        <Select
                                            items={items}
                                            value={field.value ?? ""}
                                            onValueChange={(value) => field.onChange(value)}
                                            disabled={employeesQuery.isLoading}
                                        >
                                            <SelectTrigger
                                                id="manager-profile-worker-id"
                                                aria-invalid={fieldState.invalid}
                                                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-4 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
                                            >
                                                <SelectValue
                                                    className={selectedWorkerName ? "text-foreground" : "text-muted-foreground"}
                                                    placeholder={employeesQuery.isLoading ? "Carregando funcionarios..." : "Selecione um funcionario"}
                                                >
                                                    {selectedWorkerName}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Funcionarios</SelectLabel>
                                                    {items.map((item) => (
                                                        <SelectItem key={item.value} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>

                                        <FieldDescription>
                                            {employeesQuery.isLoading
                                                ? "Carregando funcionarios..."
                                                : employeesQuery.isError
                                                    ? "Nao foi possivel carregar os funcionarios."
                                                    : items.length > 0
                                                        ? "Ao selecionar um funcionario, o formulario sera preenchido automaticamente."
                                                        : "Nenhum funcionario encontrado."}
                                        </FieldDescription>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <div className="flex justify-center py-2 ">
                                <ChangeImage disabled={!workerId} setImage={setImage} userImage={imageSrc} />
                            </div>

                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="manager-profile-name">Nome completo</FieldLabel>
                                        <Input
                                            {...field}
                                            id="manager-profile-name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Nome completo"
                                            autoComplete="off"
                                            disabled={!workerId}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="manager-profile-email">E-mail</FieldLabel>
                                        <Input
                                            {...field}
                                            id="manager-profile-email"
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="E-mail do funcionario"
                                            autoComplete="off"
                                            disabled={!workerId}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="address"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="manager-profile-address">Endereço</FieldLabel>
                                        <Input
                                            {...field}
                                            id="manager-profile-address"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Endereco do funcionario"
                                            autoComplete="off"
                                            disabled={!workerId}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="phone"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="manager-profile-phone">Telefone</FieldLabel>
                                        <Input
                                            {...field}
                                            id="manager-profile-phone"
                                            type="tel"
                                            inputMode="tel"
                                            value={field.value ?? ""}
                                            onChange={(event) => field.onChange(formatPhone(event.target.value))}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Telefone do funcionario"
                                            autoComplete="tel"
                                            disabled={!workerId}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="pricePerPackage"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="manager-profile-price">Valor por pacote</FieldLabel>
                                        <Input
                                            id="manager-profile-price"
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
                                            disabled={!workerId}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>

                <CardFooter>
                    <Field orientation="horizontal" className="w-full">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-2/12 py-4"
                            onClick={() => form.reset(workerId && selectedWorker ? mapEmployeeToFormValues(selectedWorker) : managerProfileDefaultValues)}
                            disabled={!workerId}
                        >
                            Recarregar
                        </Button>
                        <Button
                            className="w-10/12 bg-[#0077b6] py-4 hover:bg-[#03045e]"
                            type="submit"
                            form="form-manager-profile"
                            disabled={!workerId}
                        >
                            Salvar alteracoes
                        </Button>
                    </Field>
                </CardFooter>
            </Card>

            <Card className="h-fit border-[#0077b6]/20 bg-[#caf0f8]/30 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Resumo do perfil</CardTitle>
                    <CardDescription>Confira quem esta sendo editado antes de salvar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-md border border-[#0077b6]/20 bg-white p-4">
                        <p className="text-sm font-medium text-muted-foreground">Funcionario selecionado</p>
                        <p className="mt-1 text-base font-semibold text-foreground">
                            {selectedWorker?.name ?? "Nenhum funcionario selecionado"}
                        </p>
                    </div>

                    <div className="rounded-md border border-[#0077b6]/20 bg-white p-4">
                        <p className="text-sm font-medium text-muted-foreground">E-mail atual</p>
                        <p className="mt-1 text-base text-foreground">{selectedWorker?.email ?? "-"}</p>
                    </div>

                    <div className="rounded-md border border-[#0077b6]/20 bg-white p-4">
                        <p className="text-sm font-medium text-muted-foreground">Telefone atual</p>
                        <p className="mt-1 text-base text-foreground">
                            {selectedWorker ? formatPhone(selectedWorker.workerProfile?.phone ?? "") || "-" : "-"}
                        </p>
                    </div>

                    <div className="rounded-md border border-[#0077b6]/20 bg-white p-4">
                        <p className="text-sm font-medium text-muted-foreground">Endereco atual</p>
                        <p className="mt-1 text-base text-foreground">{selectedWorker?.workerProfile?.address ?? "-"}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}