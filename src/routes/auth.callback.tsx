import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import ApiService from "@/API/service";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/auth/callback")({ component: AuthCallback });

function AuthCallback() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    async function handleCallback() {
      try {
        const session = await ApiService.get("api/Auth/Session");
        const result = session?.result;

        if (!result || typeof result.userId !== "number") {
          throw new Error("Sessao invalida.");
        }

        const userInfo = result.userInfo;
        const player = userInfo?.player;
        const user = {
          id: result.userId,
          name: player?.nickname || userInfo?.login || "",
          email: userInfo?.email ?? "",
          login: userInfo?.login ?? "",
          role: userInfo?.role ?? "",
          isActive: userInfo?.isActive ?? true,
          lastLoginAt: userInfo?.lastLoginAt ?? "",
          avatar: player?.avatarUrl || undefined
        };

        login(user, "", Boolean(player?.id));
        navigate({ to: "/" });
      } catch (err: any) {
        setError(err?.message ?? "Nao foi possivel autenticar.");
      }
    }

    void handleCallback();
  }, [login, navigate]);

  return (
    <div className="relative min-h-[90vh] grid place-items-center bg-[#06070a] overflow-hidden px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-none border border-white/5 bg-[#0a0a0c]/80 p-8 text-center backdrop-blur-md"
      >
        {error ? (
          <>
            <h1 className="font-display text-xl font-black uppercase tracking-tight text-white">
              Falha ao concluir login
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{error}</p>
            <a
              href="/login"
              className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-primary"
            >
              Voltar para login
            </a>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Finalizando autenticacao
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
