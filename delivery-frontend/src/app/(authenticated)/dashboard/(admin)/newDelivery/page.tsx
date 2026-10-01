

"use client"

import { format } from "date-fns"
import { CalendarDays, PackageOpen, UserRound } from "lucide-react"
import axios from "axios"
import { Controller, FieldErrors } from "react-hook-form"
import { toast } from "sonner"
import apiPrivate from "@/lib/apiPrivate"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useEmployeesQuery } from "@/hooks/useEmployeesQuery"
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
    NewDeliveryForm,
    NewDeliveryType,
} from "../../../../../lib/zodTypes/newDeliveryZod"

type WorkerOption = {
    id: string
    name: string
}

function todayDate() {
    return format(new Date(), "yyyy-MM-dd")
}

export default function NewDeliveryPage() {
    const form = NewDeliveryForm()
    const employeesQuery = useEmployeesQuery()
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
    const loadingWorkers = employeesQuery.isLoading


    const items = workers.map((worker) => ({
        value: worker.id,
        label: worker.name,
    }))



    async function onSubmit(data: NewDeliveryType) {
        try {
            const response = await apiPrivate.post("/api/worker/addDelivery", {
                quantity: data.quantity,
                workerId: data.workerId,
                date: data.date,
            })

          

            void response
            toast.success("Entrega criada com sucesso")
            form.reset({
                quantity: 1,
                workerId: "",
                date: todayDate(),
            })
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                toast.error("Funcionario nao encontrado. Selecione um ID valido.")
                return
            }
            console.error("Error submitting data:", error)
            toast.error("Nao foi possivel criar a entrega. Tente novamente.")
        }
    }

    function onInvalid(errors: FieldErrors<NewDeliveryType>) {
        void errors
        toast.error("Revise os campos antes de enviar")
    }

    const quantity = form.watch("quantity")
    const date = form.watch("date")
    const workerId = form.watch("workerId")
    const selectedWorker = workers.find((worker) => worker.id === workerId)

    return (
        <div className="grid w-full gap-4 p-4 lg:grid-cols-[2fr_1fr]">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle>Criar nova entrega</CardTitle>
                    <CardDescription>
                        Informe quantidade, funcionario e data para registrar a entrega.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form id="form-new-delivery" onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
                        <FieldGroup className="flex flex-col gap-6">
                            <Controller
                                name="quantity"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="delivery-quantity">
                                            Quantidade de pacotes
                                        </FieldLabel>
                                        <Input
                                            id="delivery-quantity"
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            step={1}
                                            value={field.value ?? ""}
                                            onChange={(event) => {
                                                const value = event.target.value
                                                field.onChange(value === "" ? undefined : event.target.valueAsNumber)
                                            }}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Ex: 12"
                                            autoComplete="off"
                                            disabled={form.formState.isSubmitting}
                                        />
                                        <FieldDescription>
                                            Informe apenas numeros inteiros maiores que zero.
                                        </FieldDescription>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="workerId"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    const selectedWorkerName = workers.find((worker) => worker.id === field.value)?.name

                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="delivery-worker-id">
                                                Funcionario responsavel
                                            </FieldLabel>
                                            <Select
                                                items={items}
                                                value={field.value ?? ""}
                                                onValueChange={(value) => field.onChange(value)}
                                                disabled={form.formState.isSubmitting || loadingWorkers}
                                            >
                                                <SelectTrigger
                                                    id="delivery-worker-id"
                                                    aria-invalid={fieldState.invalid}
                                                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-4 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                                                >
                                                    <SelectValue
                                                        className={selectedWorkerName ? "text-foreground" : "text-muted-foreground"}
                                                        placeholder={
                                                            loadingWorkers
                                                                ? "Carregando funcionarios..."
                                                                : "Selecione um funcionario"
                                                        }
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
                                                {loadingWorkers
                                                    ? "Carregando funcionarios..."
                                                    : employeesQuery.isError
                                                        ? "Nao foi possivel carregar os funcionarios."
                                                        : items.length > 0
                                                            ? "Selecione um funcionario da lista."
                                                            : "Nenhum funcionario encontrado."}
                                            </FieldDescription>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )
                                }}
                            />

                            <Controller
                                name="date"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="delivery-date">
                                            Data da entrega
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="delivery-date"
                                            type="date"
                                            aria-invalid={fieldState.invalid}
                                            disabled={form.formState.isSubmitting}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>

                    </form>
                </CardContent>

                <CardFooter >
                    <Field orientation="horizontal" className="w-ful">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-2/12 py-4 hover:bg-[#caf0f8]"
                            onClick={() =>
                                form.reset({
                                    quantity: 1,
                                    workerId: "",
                                    date: todayDate(),
                                })
                            }
                            disabled={form.formState.isSubmitting}
                        >
                            Limpar
                        </Button>

                        <Button
                            className="w-10/12 text-center bg-[#0077b6] py-4 hover:bg-[#03045e]"
                            type="submit"
                            form="form-new-delivery"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? "Salvando entrega..." : "Salvar entrega"}
                        </Button>
                    </Field>
                </CardFooter>
            </Card>

            <Card className="h-fit border-[#0077b6]/20 bg-[#caf0f8]/30 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Resumo da entrega</CardTitle>
                    <CardDescription>Confira os dados antes de salvar.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 rounded-md border border-[#0077b6]/20 bg-white p-3">
                        <PackageOpen className="size-4 text-[#03045e]" />
                        <div className="text-sm">
                            <p className="text-muted-foreground">Quantidade</p>
                            <p className="font-medium">{quantity || 0} pacote(s)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-md border border-[#0077b6]/20 bg-white p-3">
                        <UserRound className="size-4 text-[#03045e]" />
                        <div className="text-sm">
                            <p className="text-muted-foreground">Funcionario</p>
                            <p className="font-medium">{selectedWorker?.name ?? "Nao informado"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-md border border-[#0077b6]/20 bg-white p-3">
                        <CalendarDays className="size-4 text-[#03045e]" />
                        <div className="text-sm">
                            <p className="text-muted-foreground">Data</p>
                            <p className="font-medium">{date || "Nao informada"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}