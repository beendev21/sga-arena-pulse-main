import { createFileRoute, Link } from "@tanstack/react-router";
import { ogMeta } from "@/lib/og";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { StatsCard } from "@/components/sga/StatsCard";
import { Button } from "@/components/ui/button";
import {
  Trophy, Target, Crosshair, Zap,
  User as UserIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ApiService from "@/API/service";

const AUTH_URL = ((import.meta as any).env?.VITE_AUTH_URL as string | undefined)?.trim()?.replace(/\/$/, "") ?? "";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: ogMeta({ title: "Meu Perfil — SGA", description: "Seu perfil na Santos Games Arena.", path: "/profile" }) }),
  component: ProfilePage,
});

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase().replace(/\./g, "");
  } catch {
    return "—";
  }
}

function ProfilePage() {
  const user = useAuth((s) => s.user);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#06070a] px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-4xl font-black italic uppercase text-white mb-4">Sinal Perdido</h1>
          <p className="text-muted-foreground mb-8 uppercase tracking-widest text-[10px] italic">
            Acesso restrito. Identificação necessária para visualizar dados de agente_
          </p>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 px-8 h-12 uppercase tracking-[0.2em] font-black italic">
              Acessar Terminal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,109,131,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-[15rem] md:text-[25rem] font-black italic text-white/[0.01] select-none pointer-events-none tracking-tighter uppercase z-0">
        Agent
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 border-l-4 border-primary pl-6 md:pl-10"
        >
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase leading-[0.95] font-black italic tracking-tight text-white">
            Dossiê do <span className="text-primary">Agente</span>.
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-8">
          {/* Identity Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="relative group h-fit"
          >
            <div className="absolute -top-2 -left-2 w-5 h-5 border-t border-l border-primary/40" />
            <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b border-r border-primary/40" />

            <div className="bg-[#0a0a0c]/80 backdrop-blur-md border border-white/5 p-7 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors duration-500">
                  <img
                    src={user.avatar || "/avatar-default.svg"}
                    alt={user.login}
                    onError={(e) => {
                      const t = e.currentTarget;
                      if (!t.src.endsWith("/avatar-default.svg")) t.src = "/avatar-default.svg";
                    }}
                    className="w-36 h-36 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-[8px] font-black uppercase italic tracking-widest shadow-xl whitespace-nowrap">
                  Status: Online
                </div>
              </div>

              <h2 className="font-display text-3xl font-black italic text-white uppercase tracking-tighter mt-2 mb-0.5">
                {user.login}
              </h2>
              <p className="text-muted-foreground text-[10px] uppercase tracking-[0.25em] italic">{user.email}</p>

              <div className="w-full space-y-3 pt-6 mt-6 border-t border-white/5">
                <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest text-white/40">
                  <span>Nível de Acesso</span>
                  <span className={user.role === "Administrador" ? "text-primary" : "text-white"}>
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest text-white/40">
                  <span>Membro desde</span>
                  <span className="text-white/60">{formatDate(user.createdAt)}</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <PlayerStatsPanel login={user.login} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PlayerStatsPanel({ login }: { login: string }) {
  const API_BASE = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

  const { data: rankingRaw, isLoading } = useQuery({
    queryKey: ["ranking-player-per-game"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/Games/GetRankingPlayerPerGame`);
      return res.json();
    },
    staleTime: 60_000,
  });

  const player = (() => {
    const list: any[] = Array.isArray(rankingRaw?.result) ? rankingRaw.result : [];
    const q = login.trim().toLowerCase();
    return list.find(
      (p: any) =>
        String(p.playerNickname ?? "").toLowerCase() === q ||
        String(p.playerName ?? "").toLowerCase().includes(q)
    ) ?? null;
  })();

  const stats = player?.playerStats ?? null;
  const kd = stats ? (stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : stats.totalKills.toFixed(2)) : null;
  const winPct = player ? Math.round((player.wins / Math.max(player.totalMatches, 1)) * 100) : null;

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#0a0a0c]/60 border border-white/5 p-5 animate-pulse h-24" />
          ))
        ) : player ? (
          <>
            <StatsCard label="Partidas" value={String(player.totalMatches)} icon={Target} accent />
            <StatsCard label="Vitórias" value={String(player.wins)} icon={Trophy} />
            <StatsCard label="K/D Ratio" value={kd ?? "—"} icon={Crosshair} />
            <StatsCard label="Aproveitamento" value={`${winPct}%`} icon={Zap} />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <StatsCard key={i} label={["Partidas", "Vitórias", "K/D Ratio", "Aproveitamento"][i]} value="—" icon={[Target, Trophy, Crosshair, Zap][i]} />
          ))
        )}
      </motion.div>

      {/* Player details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <div className="bg-[#0a0a0c]/60 backdrop-blur-sm border border-white/5 p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-[8px] font-black text-white/5 uppercase tracking-[0.4em] pointer-events-none">
            SGA_AUTH // LOG_774
          </div>

          {player ? (
            <>
              <h3 className="font-display text-xl uppercase italic font-black text-white mb-8 flex items-center gap-3">
                <span className="text-primary">/</span> Estatísticas Detalhadas
              </h3>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: "Kills", value: stats?.totalKills ?? 0 },
                  { label: "Deaths", value: stats?.totalDeaths ?? 0 },
                  { label: "Assists", value: stats?.totalAssists ?? 0 },
                  { label: "HS%", value: `${Math.round(stats?.totalHSPercentage ?? 0)}%` },
                  { label: "KDA", value: (stats?.kda ?? 0).toFixed(2) },
                  { label: "Derrotas", value: player.losses ?? 0 },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.03] border border-white/5 p-4">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">{s.label}</div>
                    <div className="text-2xl font-black font-display text-white">{s.value}</div>
                  </div>
                ))}
              </div>

              {player.teamRelation && (
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Time</div>
                    <div className="text-sm font-black text-white uppercase">{player.teamRelation.teamName}</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center py-10 text-center gap-4">
              <AlertTriangle className="w-8 h-8 text-warning/60" />
              <div>
                <p className="font-display text-lg font-black uppercase italic text-white">Jogador não registrado</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Nenhum registro de partida encontrado para <span className="font-mono text-white/50">{login}</span>
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
      </motion.div>
    </div>
  );
}


