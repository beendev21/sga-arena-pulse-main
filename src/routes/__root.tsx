import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import appCss from "../styles.css?url";

/**
 * Componente para exibição de erro 404 (Not Found).
 * Integrado nativamente ao TanStack Router para capturar rotas inexistentes.
 */
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-neon">404</h1>
        <h2 className="mt-4 text-xl">Página não encontrada</h2>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-neon px-6 py-2 font-medium text-primary-foreground shadow-neon">
          Voltar para Home
        </Link>
      </div>
    </div>
  );
}

/**
 * Boundary de Erro Global.
 * Captura falhas inesperadas na renderização ou no carregamento de dados (loaders).
 */
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-neon px-4 py-2 text-sm font-medium text-primary-foreground shadow-neon">
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

/**
 * Configuração da Rota Raiz.
 * Injecta o 'queryClient' no contexto para que todas as sub-rotas possam realizar fetches.
 */
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Santos Games Arena — SGA | CS2, Valorant & CS" },
      { name: "description", content: "Plataforma de e-sports SGA: campeonatos, ranking de times e jogadores, partidas ao vivo e highlights de CS2, Valorant e CS." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Ponto central de montagem da UI.
 * Renderiza o SidebarProvider para controle do menu colateral e o QueryClientProvider
 * para gerenciamento de cache e sincronização de estado com o servidor.
 */
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
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
