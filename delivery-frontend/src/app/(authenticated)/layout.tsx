import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  return <>{children}</>;
}
