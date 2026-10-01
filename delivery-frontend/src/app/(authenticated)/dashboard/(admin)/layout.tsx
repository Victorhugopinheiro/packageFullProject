import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/server";
import { IsUserAdmin } from "@/lib/auth/isAdmin";

export default async function AuthenticatedLayout({
    children,
}: {
    children: ReactNode;
}) {
    await IsUserAdmin();

    return <>{children}</>;
}
