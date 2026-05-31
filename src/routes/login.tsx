import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, ChevronRight, Cookie } from "lucide-react";
import { redirectToAuth } from "@/lib/auth-redirect";
import { useAuth, mapRole } from "@/store/auth";

const DEV_TOKEN_LOGIN =
  ((import.meta as any).env?.VITE_DEV_TOKEN_LOGIN as string | undefined)?.trim() === "true";

const AUTH_URL =
  ((import.meta as any).env?.VITE_AUTH_URL as string | undefined)?.trim()?.replace(/\/$/, "") ?? "";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  if (AUTH_URL && !DEV_TOKEN_LOGIN) {
    redirectToAuth("/");
    return (
      <div className="grid min-h-[80vh] place-items-center bg-[#06070a]">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Redirecionando para o login
        </div>
      </div>
    );
  }

  return <DevLogin />;
}

function DevLogin() {
  const navigate  = useNavigate();
  const loginStore = useAuth((s) => s.login);

  const [token,   setToken]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const raw = token.trim();
    if (!raw) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Seta o cookie sga_auth para localhost via API
      const setRes = await fetch(`${AUTH_URL}/api/auth/dev-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: raw }),
      });

      if (!setRes.ok) {
        setError("Não foi possível registrar o token.");
        return;
      }

      // 2. Verifica a sessão para pegar os dados do usuário
      const sessionRes = await fetch(`${AUTH_URL}/api/auth/Session`, {
        credentials: "include",
      });

      const data = await sessionRes.json().catch(() => ({}));

      if (!sessionRes.ok || !data?.authenticated) {
        setError("Token inválido ou expirado.");
        return;
      }

      const u = data.user;
      loginStore(
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

      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível conectar à API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[90vh] grid place-items-center bg-[#06070a] overflow-hidden px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-[0.04] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(248,109,131,0.05),transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-5 flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/30 text-warning text-[10px] font-black uppercase tracking-widest">
            <AlertTriangle className="h-3 w-3" />
            Modo Desenvolvimento
          </span>
        </div>

        <div className="border border-white/[0.08] bg-[#0a0a0c]/90 backdrop-blur-md shadow-2xl">
          <div className="px-7 pt-7 pb-5 border-b border-white/[0.06] text-center">
            <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white leading-none">
              Santos Games <span className="text-primary">Arena</span>
            </h1>
            <p className="mt-1.5 text-[11px] text-muted-foreground">Login via cookie de sessão</p>
          </div>

          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            {/* instrução */}
            <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-xs text-muted-foreground leading-relaxed">
              <Cookie className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span>
                Abra{" "}
                <a href="https://santos-games.com" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-primary transition-colors">
                  santos-games.com
                </a>{" "}
                no browser, entre em DevTools{" "}
                <span className="font-mono text-white/50">(F12)</span> → Application → Cookies →{" "}
                <span className="font-mono text-primary">sga_auth</span> e cole o valor abaixo.
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Valor do cookie <span className="font-mono text-primary">sga_auth</span>
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={4}
                className="w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-mono text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/60 transition-colors resize-none"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
                >
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Usar cookie
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[9px] text-muted-foreground/30 uppercase tracking-widest">
          Remova <span className="font-mono">VITE_DEV_TOKEN_LOGIN</span> do .env para usar o auth de produção
        </p>
      </motion.div>
    </div>
  );
}
