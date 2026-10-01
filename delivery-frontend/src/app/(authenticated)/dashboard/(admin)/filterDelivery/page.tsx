

"use client"

import * as React from "react"
import { format } from "date-fns"
import { Controller, FieldErrors } from "react-hook-form"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { CalendarDays, Funnel, PackageOpen, Wallet } from "lucide-react"

import apiPrivate from "@/lib/apiPrivate"
import { useEmployeesQuery } from "@/hooks/useEmployeesQuery"
import {
    ListWorkerDeliveriesApiResponse2,
    ListWorkerDeliveriesParams,
    WorkerDelivery,
    mapWorkerDeliveriesResponse,
} from "@/lib/types/delivery"
import {
    FilterDeliveryForm,
    ListWorkerDeliveriesType,
} from "@/lib/zodTypes/filterDeliveryZod"

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
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
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

type WorkerOption = {
    id: string
    name: string
}

type ChartDeliveryPoint = {
    label: string
    quantity: number
    totalAmount: number
    sortDate: number
}

type MeasureView = "all" | "quantity" | "totalAmount"

const chartConfig = {
    quantity: {
        label: "Pacotes",
        color: "#0077b6",
    },
    totalAmount: {
        label: "Total (R$)",
        color: "#03045e",
    },
} satisfies ChartConfig

function formatMoney(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value)
}

function formatDateLabel(date: Date) {
    if (Number.isNaN(date.getTime())) {
        return "Data invalida"
    }

    return format(date, "dd/MM/yyyy")
}

function buildChartData(deliveries: WorkerDelivery[]): ChartDeliveryPoint[] {
    const bucket = new Map<string, ChartDeliveryPoint>()

    deliveries.forEach((delivery) => {
        const isValidDate = !Number.isNaN(delivery.date.getTime())
        if (!isValidDate) {
            return
        }

        const key = format(delivery.date, "yyyy-MM-dd")
        const current = bucket.get(key)

        if (current) {
            current.quantity += delivery.quantity
            current.totalAmount += delivery.totalAmount
            return
        }

        bucket.set(key, {
            label: format(delivery.date, "dd/MM"),
            quantity: delivery.quantity,
            totalAmount: delivery.totalAmount,
            sortDate: delivery.date.getTime(),
        })
    })

   



    return [...bucket.values()].sort((a, b) => a.sortDate - b.sortDate)
}

export default function FilterDeliveryPage() {
    const form = FilterDeliveryForm()
    const employeesQuery = useEmployeesQuery()

    const [deliveries, setDeliveries] = React.useState<WorkerDelivery[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [measureView, setMeasureView] = React.useState<MeasureView>("all")

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

    const measureItems = [
        { value: "all", label: "Pacotes e Total" },
        { value: "quantity", label: "Somente pacotes" },
        { value: "totalAmount", label: "Somente total (R$)" },
    ]

    const chartData = React.useMemo(() => buildChartData(deliveries), [deliveries])
    const totalPackages = deliveries.reduce((acc, item) => acc + item.quantity, 0)
    const totalAmount = deliveries.reduce((acc, item) => acc + item.totalAmount, 0)
    const showQuantityMeasure = measureView === "all" || measureView === "quantity"
    const showAmountMeasure = measureView === "all" || measureView === "totalAmount"

    const workerId = form.watch("workerId")
    const fromDate = form.watch("fromDate")
    const toDate = form.watch("toDate")
    const selectedWorker = workers.find((worker) => worker.id === workerId)

    async function onSubmit(data: ListWorkerDeliveriesType) {
        setIsLoading(true)

        try {
            const params: ListWorkerDeliveriesParams = {
                workerId: data.workerId,
                fromDate: data.fromDate,
                toDate: data.toDate,
            }

            const response = await apiPrivate.get<ListWorkerDeliveriesApiResponse2>("/api/worker/workerDelivery", {
                params,
            })

            const parsed = mapWorkerDeliveriesResponse(response.data)
            setDeliveries(parsed.deliveries)
            toast.success(`Filtro aplicado com ${parsed.deliveries.length} entrega(s).`)
        } catch {
            toast.error("Nao foi possivel filtrar as entregas. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    function onInvalid(errors: FieldErrors<ListWorkerDeliveriesType>) {
        void errors
        toast.error("Revise os campos antes de filtrar")
    }

    return (
        <div className="grid w-full gap-4 p-4 lg:grid-cols-[2fr_1fr]">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle>Filtrar entregas</CardTitle>
                    <CardDescription>
                        Selecione funcionario e periodo para buscar as entregas e visualizar os resultados.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form id="form-filter-delivery" onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
                        <FieldGroup className="flex flex-col gap-6">
                            <Controller
                                name="workerId"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    const selectedWorkerName = workers.find((worker) => worker.id === field.value)?.name

                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="filter-worker-id">Funcionario</FieldLabel>
                                            <Select
                                                items={items}
                                                value={field.value ?? ""}
                                                onValueChange={(value) => field.onChange(value)}
                                                disabled={employeesQuery.isLoading || isLoading}
                                            >
                                                <SelectTrigger
                                                    id="filter-worker-id"
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
                                                            ? "Selecione o funcionario para filtrar as entregas."
                                                            : "Nenhum funcionario encontrado."}
                                            </FieldDescription>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )
                                }}
                            />

                            <Controller
                                name="fromDate"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="filter-from-date">Data inicial</FieldLabel>
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            id="filter-from-date"
                                            type="date"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isLoading}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="toDate"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="filter-to-date">Data final</FieldLabel>
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            id="filter-to-date"
                                            type="date"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isLoading}
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
                            className="w-3/12 py-4 hover:bg-[#caf0f8]"
                            onClick={() => {
                                form.reset({
                                    workerId: "",
                                    fromDate: undefined,
                                    toDate: undefined,
                                })
                                setDeliveries([])
                            }}
                            disabled={isLoading}
                        >
                            Limpar
                        </Button>

                        <Button
                            className="w-9/12 bg-[#0077b6] py-4 text-center hover:bg-[#03045e]"
                            type="submit"
                            form="form-filter-delivery"
                            disabled={isLoading}
                        >
                            {isLoading ? "Filtrando entregas..." : "Aplicar filtro"}
                        </Button>filtro
                    </Field>
                </CardFooter>
            </Card>

            <Card className="h-fit border-[#0077b6]/20 bg-[#caf0f8]/30 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Resumo do filtro</CardTitle>
                    <CardDescription>Visao geral dos filtros e totais encontrados.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 rounded-md border border-[#0077b6]/20 bg-white p-3">
                        <Funnel className="size-4 text-[#03045e]" />
                        <div className="text-sm">
                            <p className="text-muted-foreground">Funcionario</p>
                            <p className="font-medium">{selectedWorker?.name ?? "Nao informado"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-md border border-[#0077b6]/20 bg-white p-3">
                        <CalendarDays className="size-4 text-[#03045e]" />
                        <div className="text-sm">
                            <p className="text-muted-foreground">Periodo</p>
                            <p className="font-medium">
                                {fromDate ? fromDate : "Sem inicio"} ate {toDate ? toDate : "Sem fim"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-md border border-[#0077b6]/20 bg-white p-3">
                        <PackageOpen className="size-4 text-[#03045e]" />
                        <div className="text-sm">
                            <p className="text-muted-foreground">Pacotes</p>
                            <p className="font-medium">{totalPackages.toLocaleString("pt-BR")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-md border border-[#0077b6]/20 bg-white p-3">
                        <Wallet className="size-4 text-[#03045e]" />
                        <div className="text-sm">
                            <p className="text-muted-foreground">Total recebido</p>
                            <p className="font-medium">{formatMoney(totalAmount)}</p>
                        </div>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="measure-view">Medida no grafico</FieldLabel>
                        <Select
                            items={measureItems}
                            value={measureView}
                            onValueChange={(value) => setMeasureView(value as MeasureView)}
                        >
                            <SelectTrigger id="measure-view">
                                <SelectValue placeholder="Selecione uma medida" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Medidas</SelectLabel>
                                    {measureItems.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <FieldDescription>
                            Escolha quais medidas serao exibidas no grafico.
                        </FieldDescription>
                    </Field>
                </CardContent>
            </Card>

            <Card className="w-full shadow-sm lg:col-span-2">
                <CardHeader>
                    <CardTitle>Volume por dia</CardTitle>
                    <CardDescription>Pacotes e valor total agrupados por data.</CardDescription>
                </CardHeader>

                {chartData.length === 0 ? (
                    <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                        Aplique um filtro para visualizar o grafico.
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[280px] w-full">
                        <BarChart accessibilityLayer data={chartData} barCategoryGap="15%">
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />

                            {showQuantityMeasure && (
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                            )}
                            {showAmountMeasure && (
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tickFormatter={(value) => formatMoney(Number(value))}
                                />
                            )}



                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                shared={false}
                                cursor={false}
                            />
                            <ChartLegend content={<ChartLegendContent />} />

                            {showQuantityMeasure && (
                                <Bar  yAxisId="left" dataKey="quantity" fill="var(--color-quantity)"  radius={4} maxBarSize={60} />
                            )}
                            {showAmountMeasure && (
                                <Bar yAxisId="right" dataKey="totalAmount" fill="var(--color-totalAmount)" radius={4} maxBarSize={40} />
                            )}



                        </BarChart>
                    </ChartContainer>
                )}

            </Card>

            <Card className="w-full shadow-sm lg:col-span-2">
                <CardHeader>
                    <CardTitle>Entregas encontradas</CardTitle>
                    <CardDescription>Lista detalhada com quantidade e total por entrega.</CardDescription>
                </CardHeader>

                <CardContent>
                    {deliveries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma entrega carregada.</p>
                    ) : (
                        <div className="grid gap-3">
                            {deliveries.map((delivery) => (
                                <div
                                    key={delivery.id}
                                    className="grid gap-2 rounded-lg border border-[#0077b6]/20 bg-[#caf0f8]/20 p-3 text-sm md:grid-cols-4"
                                >
                                    <div>
                                        <p className="text-muted-foreground">Data da entrega</p>
                                        <p className="font-medium">{formatDateLabel(delivery.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Criado em</p>
                                        <p className="font-medium">{formatDateLabel(delivery.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Quantidade</p>
                                        <p className="font-medium">{delivery.quantity.toLocaleString("pt-BR")}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total</p>
                                        <p className="font-medium">{formatMoney(delivery.totalAmount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}