import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

function GA4PageTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    // Aguarda o TanStack Router atualizar document.title antes de disparar
    const t = setTimeout(() => {
      window.gtag?.("event", "page_view", {
        page_path: pathname,
        page_title: document.title,
      });
    }, 150);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background px-6">
      <div className="ds-card max-w-lg w-full p-10 text-center">
        <div className="font-display text-7xl md:text-8xl font-black italic text-primary leading-none">404</div>
        <h2 className="mt-5 font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
          Página não encontrada
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          A página que você procurou não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 h-11 font-bold uppercase tracking-wide text-sm hover:bg-primary/90 transition-colors"
        >
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const isDev = typeof import.meta !== "undefined" && (import.meta as any).env?.DEV;

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background px-6">
      <div className="ds-card max-w-lg w-full p-10 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 mb-5 bg-primary/15 border border-primary/30 text-primary text-3xl font-bold">
          !
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
          Algo deu errado
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Não conseguimos carregar essa parte da plataforma. Tente novamente em alguns instantes.
        </p>
        {isDev && error?.message && (
          <pre className="mt-5 text-left text-xs font-mono text-muted-foreground/80 bg-[var(--surface-1)] border border-white/[0.06] p-3 overflow-auto max-h-32">
            {error.message}
          </pre>
        )}
        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 h-11 font-bold uppercase tracking-wide text-sm hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-white/15 text-white px-6 h-11 font-bold uppercase tracking-wide text-sm hover:bg-white/5 transition-colors"
          >
            Ir para Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <GA4PageTracker />
      <SidebarProvider defaultOpen={false}>
        <Navbar />
        <AppSidebar />
        <div className="flex min-h-dvh w-full flex-col overflow-x-hidden">
          <main className="flex-1 pt-16 w-full relative">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  );
}
