import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { hasAdminSession } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    void hasAdminSession().then((hasSession) => {
      if (hasSession) setAuthenticated(true);
      else void navigate({ to: "/auth", replace: true });
    });
  }, [navigate]);

  return authenticated ? <Outlet /> : null;
}
