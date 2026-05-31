import { Link } from "@tanstack/react-router";
interface Match {
  id: string;
  tournamentName?: string | null;
  teamA?: { id?: string; name?: string; tag?: string; bannerColor?: string | null } | null;
  teamB?: { id?: string; name?: string; tag?: string; bannerColor?: string | null } | null;
  scoreA: number;
  scoreB: number;
  status?: string | null;
  startsAt?: string | null;
  map?: string | null;
}
import { TeamLogo } from "./TeamLogo";
import { StatusBadge } from "./StatusBadge";
import { formatDateTimeBR } from "@/lib/dateUtils";

export function MatchCard({ m }: { m: Match }) {
  const teamA = m.teamA ?? { name: "Aguardando Time A", tag: "TBD" };
  const teamB = m.teamB ?? { name: "Aguardando Time B", tag: "TBD" };
  const tournamentName = String(m.tournamentName || "Campeonato").trim();
  const winnerA = m.status === "Encerrada" && Number(m.scoreA) > Number(m.scoreB);
  const winnerB = m.status === "Encerrada" && Number(m.scoreB) > Number(m.scoreA);
  const name = tournamentName.toLowerCase();
  const isValorant = name.includes("vct") || name.includes("valorant");
  const isCS2 = !isValorant && (name.includes("cs") || name.includes("counter-strike"));
  const isLoL = name.includes("league") || name.includes("lol");

  const accentBorder = isValorant ? "hover:border-valorant/60" :
                       isCS2 ? "hover:border-cs2/60" :
                       isLoL ? "hover:border-lol/60" :
                       "hover:border-primary/60";

  return (
    <Link
      to="/matches/$id" params={{ id: m.id } as any}
      className={`block ds-card p-5 ${accentBorder}`}
    >
      <div className="flex items-center justify-between mb-4 gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {tournamentName}
        </span>
        <StatusBadge status={m.status} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <div className={`flex items-center gap-2 sm:gap-3 ${winnerA ? "" : "opacity-90"}`}>
          <div className="shrink-0"><TeamLogo team={teamA} size={36} /></div>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold uppercase tracking-tight truncate leading-tight">
              {teamA.name || "TBD"}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-0.5 hidden sm:block">{teamA.tag || "TBD"}</div>
          </div>
        </div>
        <div className="text-center min-w-[60px] sm:min-w-[80px]">
          {m.status === "Agendada" ? (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">VS</div>
              <div className="text-[10px] sm:text-xs font-semibold mt-1 text-foreground/80">
                {m.startsAt ? formatDateTimeBR(m.startsAt) : "A confirmar"}
              </div>
            </div>
          ) : (
            <div className="font-display text-2xl sm:text-3xl font-black flex items-center justify-center gap-1.5 leading-none">
              <span className={winnerA ? "text-primary" : "text-foreground/80"}>{m.scoreA}</span>
              <span className="text-muted-foreground/60">:</span>
              <span className={winnerB ? "text-primary" : "text-foreground/80"}>{m.scoreB}</span>
            </div>
          )}
          {m.map && (
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1.5 truncate max-w-[70px] mx-auto">
              {m.map}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 sm:gap-3 justify-end ${winnerB ? "" : "opacity-90"}`}>
          <div className="min-w-0 text-right">
            <div className="font-display text-sm font-bold uppercase tracking-tight truncate leading-tight">
              {teamB.name || "TBD"}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-0.5 hidden sm:block">{teamB.tag || "TBD"}</div>
          </div>
          <div className="shrink-0"><TeamLogo team={teamB} size={36} /></div>
        </div>
      </div>
    </Link>
  );
}
