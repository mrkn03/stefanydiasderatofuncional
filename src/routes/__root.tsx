import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-milk px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-normal text-ink">404</h1>
        <h2 className="mt-4 font-display text-xl font-medium text-ink">Página não encontrada</h2>
        <p className="mt-2 text-sm text-inksoft">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-rosedeep px-5 py-2.5 text-sm font-semibold text-white/95 transition-transform duration-300 hover:-translate-y-0.5"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-milk px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-medium tracking-tight text-ink">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-inksoft">
          Algo saiu errado do nosso lado. Tente atualizar ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-rosedeep px-5 py-2.5 text-sm font-semibold text-white/95 transition-transform duration-300 hover:-translate-y-0.5"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-ink ring-1 ring-ink/15 transition-transform duration-300 hover:-translate-y-0.5"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dra. Stefany Dias | Fisioterapia Dermatofuncional" },
      {
        name: "description",
        content:
          "Fisioterapia dermatofuncional em Vitória/ES. Tratamentos de pele com ciência e cuidado individualizado. Agende sua avaliação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
