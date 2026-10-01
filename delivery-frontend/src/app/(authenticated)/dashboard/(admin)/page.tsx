"use client"

import * as React from "react"
import { gsap } from "gsap"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ArrowUpRight,
    CircleDollarSign,
    PackageCheck,
    Sparkles,
    Users,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useEmployeesQuery } from "@/hooks/useEmployeesQuery"
import { cn } from "@/lib/utils"
import { useFilterWorkerDeliveries } from "@/hooks/useFilterWorkerDeliveries"
import { useAuth } from "@/context/authContext"

const chartConfig = {
    value: {
        label: "Pacotes entregues",
        color: "#00b4d8",
    },
} satisfies ChartConfig

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
    }).format(value)
}



export default function DashboardPage() {
    const { data, isLoading, isError } = useEmployeesQuery()
    const employees = data?.employees ?? []
    const { data: lastMonthTrend = [] } = useFilterWorkerDeliveries()

    const {user} = useAuth()

   
  

    const heroRef = React.useRef<HTMLDivElement | null>(null)
    const statRefs = React.useRef<Array<HTMLDivElement | null>>([])
    const avatarRefs = React.useRef<Array<HTMLDivElement | null>>([])
    const chartRef = React.useRef<HTMLDivElement | null>(null)

    const firstWeekValue = lastMonthTrend[0]?.value ?? 0
    const lastWeekValue = lastMonthTrend[lastMonthTrend.length - 1]?.value ?? 0
    const growth = firstWeekValue > 0
        ? Math.round(((lastWeekValue / firstWeekValue) - 1) * 100)
        : 0
    const totalPackages = lastMonthTrend.reduce((sum, item) => sum + item.value, 0)
    const averagePerWeek = lastMonthTrend.length > 0
        ? Math.round(totalPackages / lastMonthTrend.length)
        : 0
    const completedGoal = Math.round((totalPackages / 180) * 100)

    React.useEffect(() => {
        const context = gsap.context(() => {
            const animation = gsap.timeline({ defaults: { ease: "power3.out" } })

            animation.fromTo(
                heroRef.current,
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.7 }
            )

            animation.fromTo(
                statRefs.current.filter(Boolean),
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
                "-=0.3"
            )

            animation.fromTo(
                avatarRefs.current.filter(Boolean),
                { opacity: 0, y: 16, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07 },
                "-=0.2"
            )

            animation.fromTo(
                chartRef.current,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: 0.7 },
                "-=0.15"
            )
        })


        return () => context.revert()

    }, [])


    return (
        <div className="flex w-full flex-col gap-4 p-4 lg:p-6">
            <section
                ref={heroRef}
                className="overflow-hidden rounded-[28px] border border-white/40 bg-linear-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] p-6 text-white shadow-2xl shadow-[#03045e]/30"
            >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl space-y-3">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-200 backdrop-blur">
                            <Sparkles className="size-4" />
                            Visão geral da equipe
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Seu time está conquistando ritmo e consistência.
                            </h1>
                            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
                                Acompanhe os entregadores, os resultados do último mês e a saúde geral da operação em um painel mais vivo e intuitivo.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                        <p className="text-sm text-slate-300">Meta do mês</p>
                        <p className="text-2xl font-semibold">{completedGoal}%</p>
                        <p className="text-sm text-[#90e0ef]">{formatCurrency(averagePerWeek * 120)} em média semanal</p>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-3">
                {[
                    {
                        title: "Funcionários ativos",
                        value: isLoading ? "—" : employees.length,
                        description: "Cadastros disponíveis hoje",
                        icon: Users,
                        accent: "from-[#0077b6] to-[#00b4d8]",
                    },
                    {
                        title: "Pacotes no mês",
                        value: isLoading ? "—" : totalPackages,
                        description: `${averagePerWeek} por semana`,
                        icon: PackageCheck,
                        accent: "from-[#03045e] to-[#0077b6]",
                    },
                    {
                        title: "Crescimento",
                        value: `${growth}%`,
                        description: "Em relação à primeira semana",
                        icon: ArrowUpRight,
                        accent: "from-[#00b4d8] to-[#90e0ef]",
                    },
                ].map((item, index) => {
                    const Icon = item.icon
                    return (
                        <Card
                            key={item.title}
                            ref={(node) => {
                                statRefs.current[index] = node
                            }}
                            className="border-0 bg-white/80 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur"
                        >
                            <CardHeader className="flex flex-row items-start justify-between gap-3">
                                <div>
                                    <CardTitle className="text-sm font-medium text-slate-600">{item.title}</CardTitle>
                                    <CardDescription className="mt-1 text-sm text-slate-500">{item.description}</CardDescription>
                                </div>
                                <div className={cn("rounded-2xl bg-linear-to-br p-2 text-white", item.accent)}>
                                    <Icon className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="border-0 bg-white/80 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">Resultados do último mês</CardTitle>
                                <CardDescription className="mt-1">Acompanhamento visual do avanço semanal.</CardDescription>
                            </div>
                            <div className="rounded-full bg-[#caf0f8] px-3 py-1 text-sm font-medium text-[#0077b6]">
                                +{growth}%
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div ref={chartRef} className="rounded-3xl border border-slate-200/70 bg-[#03045e]/95 p-4 text-white">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Volume semanal</p>
                                    <p className="text-2xl font-semibold">{formatCurrency(totalPackages * 95)}</p>
                                </div>
                                <div className="flex items-center gap-2 rounded-full border border-[#00b4d8]/30 bg-[#00b4d8]/10 px-3 py-1 text-sm text-[#90e0ef]">
                                    <CircleDollarSign className="size-4" />
                                    Receita estimada
                                </div>
                            </div>

                            <ChartContainer config={chartConfig} className="h-64 w-full">
                                <AreaChart data={lastMonthTrend} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="packages-fill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#00b4d8" stopOpacity={0.08} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.18)" strokeDasharray="4 4" />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        tick={{ fill: "#cbd5e1", fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fill: "#cbd5e1", fontSize: 12 }}
                                    />
                                    <ChartTooltip
                                        cursor={{ stroke: "rgba(0, 180, 216, 0.35)", strokeWidth: 1 }}
                                        content={<ChartTooltipContent className="bg-[#03045e] text-slate-50" formatter={(value) => [`${value} pacotes`, "Entregues"]} />}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#00b4d8"
                                        strokeWidth={3}
                                        fill="url(#packages-fill)"
                                        activeDot={{ r: 6, fill: "#00b4d8", stroke: "#03045e", strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-xl">Equipe em destaque</CardTitle>
                        <CardDescription>Os colaboradores com foto cadastrada aparecem aqui com destaque.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                                Carregando funcionários...
                            </div>
                        ) : isError ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
                                Não foi possível carregar os funcionários no momento.
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                                Nenhum funcionário cadastrado ainda.
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-3">
                                    {employees.slice(0, 8).map((employee, index) => {
                                        const initials = employee.name
                                            .split(" ")
                                            .slice(0, 2)
                                            .map((part) => part[0] ?? "")
                                            .join("")
                                            .toUpperCase()

                                        return (
                                            <div
                                                key={employee.id}
                                                ref={(node) => {
                                                    avatarRefs.current[index] = node
                                                }}
                                                className="flex flex-col items-center gap-2"
                                            >
                                                {employee.workerProfile?.image ? (
                                                    <img
                                                        src={employee.workerProfile.image}
                                                        alt={employee.name}
                                                        className="h-14 w-14 rounded-full border-4 border-white object-cover shadow-lg shadow-slate-200"
                                                    />
                                                ) : (
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-[#0077b6] to-[#00b4d8] font-semibold text-white shadow-lg shadow-slate-200">
                                                        {initials}
                                                    </div>
                                                )}
                                                <span className="max-w-18 truncate text-center text-xs font-medium text-slate-600">
                                                    {employee.name}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {employees.length > 8 ? (
                                    <p className="text-sm text-slate-500">
                                        +{employees.length - 8} colaboradores adicionais na equipe.
                                    </p>
                                ) : null}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}