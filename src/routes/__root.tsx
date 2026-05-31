import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, useRouterState, HeadContent, useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PersistentSidebar } from "@/components/layout/PersistentSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CustomCursor } from "@/components/CustomCursor";
import { useAuth, mapRole } from "@/store/auth";
import { usePreferences, applyAccent, applyBgTheme } from "@/store/preferences";

const API_BASE = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const AUTH_URL = ((import.meta as any).env?.VITE_AUTH_URL as string | undefined)?.trim()?.replace(/\/$/, "") ?? "";
// Em dev com DEV_TOKEN_LOGIN, cookies não são enviados cross-site — não forçamos logout
const IS_DEV_LOGIN = ((import.meta as any).env?.VITE_DEV_TOKEN_LOGIN as string | undefined)?.trim() === "true";

function SessionSync() {
  const login = useAuth((s) => s.login);
  const logout = useAuth((s) => s.logout);
  const setSyncing = useAuth((s) => s.setSyncing);
  const applyServerPreferences = usePreferences((s) => s.applyServerPreferences);

  useEffect(() => {
    if (!AUTH_URL) {
      setSyncing(false);
      return;
    }
    async function fetchSession(): Promise<any> {
      const r = await fetch(`${AUTH_URL}/api/auth/session`, { credentials: "include" });
      return r.ok ? r.json() : null;
    }

    async function tryRefresh(): Promise<boolean> {
      try {
        const r = await fetch(`${AUTH_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        return r.ok;
      } catch {
        return false;
      }
    }

    (async () => {
      try {
        let data = await fetchSession();

        // Token expirado → tenta refresh e repete a sessão
        if (!data?.authenticated) {
          const refreshed = await tryRefresh();
          if (refreshed) data = await fetchSession();
        }

        if (data?.authenticated && data.user?.id) {
          const u = data.user;
          login(
            {
              id: u.id,
              name: u.login,
              email: u.email ?? "",
              login: u.login,
              role: mapRole(u.role),
              isActive: true,
              lastLoginAt: new Date().toISOString(),
              createdAt: u.createdAt ?? null,
            },
            "",
            false
          );
          if (API_BASE) {
            fetch(`${API_BASE}/api/User/me`, { credentials: "include" })
              .then((r) => r.ok ? r.json() : null)
              .then((meData) => {
                if (meData?.result) {
                  const r = meData.result;
                  applyServerPreferences({
                    cursorStyle: r.cursorStyle,
                    accentColor: r.accentColor,
                    bgTheme: r.bgTheme,
                    navLayout: r.navLayout,
                    sidebarAutoExpand: r.sidebarAutoExpand,
                    reducedMotion: r.reducedMotion,
                  });
                }
              })
              .catch(() => {});
          }
        } else {
          logout();
        }
      } catch {
        setSyncing(false);
      }
    })();
  }, []);

  return null;
}

function GA4PageTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // Aguarda HeadContent atualizar document.title (inclusive na carga direta por URL)
    const t = setTimeout(() => {
      window.gtag?.("event", "page_view", {
        page_path: pathname,
        page_title: document.title,
      });
    }, 300);
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

function PreferencesApplier() {
  const accent      = usePreferences((s) => s.accent);
  const bgTheme     = usePreferences((s) => s.bgTheme);
  const reducedMotion = usePreferences((s) => s.reducedMotion);
  useEffect(() => {
    applyAccent(accent);
  }, [accent]);
  useEffect(() => {
    applyBgTheme(bgTheme);
  }, [bgTheme]);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const navLayout  = usePreferences((s) => s.navLayout);
  const isSidebar  = navLayout === "sidebar";
  const location   = useLocation();
  const isAdmin    = location.pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <GA4PageTracker />
      <SessionSync />
      <PreferencesApplier />
      <SidebarProvider defaultOpen={false}>
        <CustomCursor />
        {isSidebar ? (
          <>
            {/* Mobile: navbar normal; desktop: sidebar persistente */}
            <div className="md:hidden"><Navbar /></div>
            <PersistentSidebar />
          </>
        ) : (
          <Navbar />
        )}
        <AppSidebar />
        <div className="flex min-h-dvh w-full flex-col overflow-x-hidden" style={{ background: "var(--bg-base, #06070a)" }}>
          <main className={`flex-1 w-full relative ${isSidebar ? "pt-20 md:pt-0 md:pl-16" : "pt-20"}`}>
            <Outlet />
          </main>
          {!isAdmin && <Footer />}
        </div>
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  );
}
