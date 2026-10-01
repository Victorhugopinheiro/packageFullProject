
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { CalendarDays, PackageOpen, Wallet } from "lucide-react"

import apiPrivate from "@/lib/apiPrivate"
import {
    ListWorkerDeliveriesApiResponse,
    ListWorkerDeliveriesApiResponse2,
    WorkerDelivery,
    mapWorkerDeliveriesResponse,
} from "@/lib/types/delivery"

import { FilterDeliveryForm, ListWorkerDeliverieType } from "@/lib/zodTypes/filterEmployeeDelivery"


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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
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
import { Controller, FieldErrors } from "react-hook-form"

type ChartDeliveryPoint = {
    label: string
    quantity: number
    totalAmount: number
    sortDate: number
}

type MeasureView = "all" | "quantity" | "totalAmount"



export default function EmployeeMetrics() {

    const form = FilterDeliveryForm()
    const [deliveries, setDeliveries] = React.useState<WorkerDelivery[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [measureView, setMeasureView] = React.useState<MeasureView>("all")

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
        return Number.isNaN(date.getTime()) ? "Data invalida" : format(date, "dd/MM/yyyy")
    }

    function onInvalid(errors: FieldErrors<ListWorkerDeliverieType>) {
        void errors
        toast.error("Revise os campos antes de filtrar")
    }

    function buildChartData(deliveries: WorkerDelivery[]): ChartDeliveryPoint[] {
        const bucket = new Map<string, ChartDeliveryPoint>()

        deliveries.forEach((delivery) => {
            if (Number.isNaN(delivery.date.getTime())) {
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

        return [...bucket.values()].sort((first, second) => first.sortDate - second.sortDate)
    }

    const measureItems = [
        { value: "all", label: "Pacotes e Total" },
        { value: "quantity", label: "Somente pacotes" },
        { value: "totalAmount", label: "Somente total (R$)" },
    ]
    const fromDate = form.watch("fromDate")
    const toDate = form.watch("toDate")
    const chartData = React.useMemo(() => buildChartData(deliveries), [deliveries])
    const totalPackages = deliveries.reduce((total, delivery) => total + delivery.quantity, 0)
    const totalAmount = deliveries.reduce((total, delivery) => total + delivery.totalAmount, 0)
    const showQuantityMeasure = measureView === "all" || measureView === "quantity"
    const showAmountMeasure = measureView === "all" || measureView === "totalAmount"

    async function onSubmit(data: ListWorkerDeliverieType) {
        const { fromDate, toDate } = data

        alert(JSON.stringify(data))



        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
            toast.error("Data inicial deve ser menor ou igual a data final.")
            return
        }

        setIsLoading(true)

        try {
            const response = await apiPrivate.get<ListWorkerDeliveriesApiResponse2>("/api/worker/myDelivery", {
                params: {
                    fromDate: fromDate || undefined,
                    toDate: toDate || undefined,
                },
            })

            console.log(response.data)


            const parsed = mapWorkerDeliveriesResponse({ deliveries: response.data.deliveries })

            console.log(parsed)

            setDeliveries(parsed.deliveries)
            toast.success(`Filtro aplicado com ${parsed.deliveries.length} entrega(s).`)
        } catch {
            toast.error("Nao foi possivel filtrar suas entregas. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid w-full gap-4 p-4 lg:grid-cols-[2fr_1fr]">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle>Minhas entregas</CardTitle>
                    <CardDescription>Selecione um periodo para consultar apenas as suas entregas.</CardDescription>
                </CardHeader>

                <CardContent>
                    <form id="form-filter-delivery" onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
                        <FieldGroup className="flex flex-col gap-6">


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
                                form.reset()
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
                        </Button>
                    </Field>
                </CardFooter>
            </Card>

            <Card className="h-fit border-[#0077b6]/20 bg-[#caf0f8]/30 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Resumo do filtro</CardTitle>
                    <CardDescription>Visao geral do periodo e dos totais encontrados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 rounded-md border border-[#0077b6]/20 bg-white p-3">
                        <CalendarDays className="size-4 text-[#03045e]" />
                        <div className="text-sm">
                            <p className="text-muted-foreground">Periodo</p>
                            <p className="font-medium">{fromDate || "Sem inicio"} ate {toDate || "Sem fim"}</p>
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
                        <Select items={measureItems} value={measureView} onValueChange={(value) => setMeasureView(value as MeasureView)}>
                            <SelectTrigger id="measure-view"><SelectValue placeholder="Selecione uma medida" /></SelectTrigger>
                            <SelectContent><SelectGroup><SelectLabel>Medidas</SelectLabel>
                                {measureItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                            </SelectGroup></SelectContent>
                        </Select>
                        <FieldDescription>Escolha quais medidas serao exibidas no grafico.</FieldDescription>
                    </Field>
                </CardContent>
            </Card>

            <Card className="w-full shadow-sm lg:col-span-2">
                <CardHeader><CardTitle>Volume por dia</CardTitle><CardDescription>Pacotes e valor total agrupados por data.</CardDescription></CardHeader>
                {chartData.length === 0 ? (
                    <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Aplique um filtro para visualizar o grafico.</div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[280px] w-full">
                        <BarChart accessibilityLayer data={chartData} barCategoryGap="15%">
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} />
                            {showQuantityMeasure && <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} tickMargin={10} />}
                            {showAmountMeasure && <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => formatMoney(Number(value))} />}
                            <ChartTooltip content={<ChartTooltipContent />} shared={false} cursor={false} />
                            <ChartLegend content={<ChartLegendContent />} />
                            {showQuantityMeasure && <Bar yAxisId="left" dataKey="quantity" fill="var(--color-quantity)" radius={4} maxBarSize={60} />}
                            {showAmountMeasure && <Bar yAxisId="right" dataKey="totalAmount" fill="var(--color-totalAmount)" radius={4} maxBarSize={40} />}
                        </BarChart>
                    </ChartContainer>
                )}
            </Card>

            <Card className="w-full shadow-sm lg:col-span-2">
                <CardHeader><CardTitle>Entregas encontradas</CardTitle><CardDescription>Lista detalhada com quantidade e total por entrega.</CardDescription></CardHeader>
                <CardContent>
                    {deliveries.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma entrega carregada.</p> : (
                        <div className="grid gap-3">
                            {deliveries.map((delivery) => (
                                <div key={delivery.id} className="grid gap-2 rounded-lg border border-[#0077b6]/20 bg-[#caf0f8]/20 p-3 text-sm md:grid-cols-4">
                                    <div><p className="text-muted-foreground">Data da entrega</p><p className="font-medium">{formatDateLabel(delivery.date)}</p></div>
                                    <div><p className="text-muted-foreground">Criado em</p><p className="font-medium">{formatDateLabel(delivery.createdAt)}</p></div>
                                    <div><p className="text-muted-foreground">Quantidade</p><p className="font-medium">{delivery.quantity.toLocaleString("pt-BR")}</p></div>
                                    <div><p className="text-muted-foreground">Total</p><p className="font-medium">{formatMoney(delivery.totalAmount)}</p></div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


