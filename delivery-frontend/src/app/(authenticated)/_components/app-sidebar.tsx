"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    LogOut,
    PackagePlus,
    SlidersHorizontal,
    Motorbike,
    Funnel,
    UserRoundPen,
    Truck,
    UserPlus,
    Users,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/authContext"

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/newDelivery", label: "Nova entrega", icon: Motorbike },
    { href: "/dashboard/filterDelivery", label: "Filtrar entregas", icon: Funnel },
    { href: "/dashboard/addEmployee", label: "Adicionar funcionário", icon: UserPlus },
    { href: "/dashboard/managerProfiles", label: "Perfis de gerentes", icon: UserRoundPen },
    { href: "/dashboard/employeeMetrics", label: "Perfil do funcionário", icon: Users, role: "employee" },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    console.log(user)

  

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Truck className="size-4" />
                    </div>
                    <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
                        Delivery
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {user?.role === "ADMIN" ? (
                                navItems.map(({ href, label, icon: Icon }) => (
                                    <SidebarMenuItem key={href}>
                                        <SidebarMenuButton
                                            isActive={pathname === href}
                                            tooltip={label}
                                            render={
                                                <Link href={href}>
                                                    <Icon />
                                                    <span>{label}</span>
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                ))
                            ) : (
                                navItems.filter(({ role }) => role === "employee").map(({ href, label, icon: Icon }) => (
                                    <SidebarMenuItem key={href}>
                                        <SidebarMenuButton
                                            isActive={pathname === href}
                                            tooltip={label}
                                            render={
                                                <Link href={href}>
                                                    <Icon />
                                                    <span>{label}</span>
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                ))
                            )



                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    {user && (
                        <SidebarMenuItem>
                            <div className="flex min-w-0 flex-col px-2 py-1 group-data-[collapsible=icon]:hidden">
                                <span className="truncate text-sm font-medium">{user.name ?? user.email}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Sair" onClick={() => logout()}>
                            <LogOut />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
