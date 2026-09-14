import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { hasAdminSession } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ preload }) => {
    if (preload) return;
    const authenticated = await hasAdminSession();
    if (!authenticated) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});