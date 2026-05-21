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
 * Página 404 — rota inexistente.
 */
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

/**
 * Boundary de Erro Global. Em produção mostra mensagem amigável;
 * em dev mostra o detalhe técnico pra facilitar debug.
 */
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
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Inter:wght@400;500;600;700;800&family=Orbitron:wght@500;700;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * Critical CSS inline — evita FOUC (flash de conteúdo sem estilo).
 * Aplica bg/cor/fonte ANTES do appCss carregar.
 */
const CRITICAL_CSS = `
  :root { color-scheme: dark; }
  html, body {
    background-color: #1f2227;
    color: #f4f4f5;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    font-weight: 500;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body { visibility: hidden; }
  a { color: inherit; text-decoration: none; }
`;

const REVEAL_SCRIPT = `(function(){
  function show(){ document.body.style.visibility='visible'; }
  var link = document.querySelector('link[rel="stylesheet"]');
  if (!link){ show(); return; }
  if (link.sheet){ show(); return; }
  link.addEventListener('load', show);
  link.addEventListener('error', show);
  setTimeout(show, 1500);
})();`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" style={{ backgroundColor: "#1f2227", colorScheme: "dark" }}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <HeadContent />
      </head>
      <body style={{ backgroundColor: "#1f2227", color: "#f4f4f5" }}>
        {children}
        <Scripts />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
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
