import { ReactNode } from "react";
import { redirectIfAuthenticated } from "@/lib/auth/server";

export default async function UnauthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await redirectIfAuthenticated();

  return <>{children}</>;
}
