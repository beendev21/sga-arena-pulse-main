import { Link } from "@tanstack/react-router";
import type { Match } from "@/mocks/data";
import { TeamLogo } from "./TeamLogo";
import { StatusBadge } from "./StatusBadge";

export function MatchCard({ m }: { m: Match }) {
  const winnerA = m.status === "Encerrada" && m.scoreA > m.scoreB;
  const winnerB = m.status === "Encerrada" && m.scoreB > m.scoreA;
  const name = m.tournamentName.toLowerCase();
  const isValorant = name.includes("vct") || name.includes("valorant");
  const isCS2 = !isValorant && (name.includes("cs") || name.includes("counter-strike"));
  const isLoL = name.includes("league") || name.includes("lol");

  return (
    <Link
      to="/matches/$id" params={{ id: m.id }}
      className={`block rounded-lg border border-border/60 bg-card-grad p-4 transition-all ${
        isValorant ? "hover:bg-valorant/10 hover:border-valorant/40 hover:shadow-valorant" : 
        isCS2 ? "hover:bg-cs2/10 hover:border-cs2/40 hover:shadow-cs2" : 
        isLoL ? "hover:bg-lol/20 hover:border-lol/40 hover:shadow-lol" : 
        "hover:border-primary/60 hover:shadow-neon"
      }`}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span className="uppercase tracking-widest">{m.tournamentName}</span>
        <StatusBadge status={m.status} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className={`flex items-center gap-3 ${winnerA ? "" : "opacity-80"}`}>
          <TeamLogo team={m.teamA} size={44} />
          <div className="min-w-0">
            <div className="font-display text-sm md:text-base truncate">{m.teamA.name}</div>
            <div className="text-xs text-muted-foreground">{m.teamA.tag}</div>
          </div>
        </div>
        <div className="text-center">
          {m.status === "Agendada" ? (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">VS</div>
              <div className="text-[10px] md:text-xs mt-1">{new Date(m.startsAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit" })}</div>
            </div>
          ) : (
            <div className="font-display text-2xl flex items-center gap-2">
              <span className={winnerA ? "text-primary text-shadow" : ""}>{m.scoreA}</span>
              <span className="text-muted-foreground">:</span>
              <span className={winnerB ? "text-primary" : ""}>{m.scoreB}</span>
            </div>
          )}
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{m.map}</div>
        </div>
        <div className={`flex items-center gap-3 justify-end ${winnerB ? "" : "opacity-80"}`}>
          <div className="min-w-0 text-right">
            <div className="font-display truncate">{m.teamB.name}</div>
            <div className="text-xs text-muted-foreground">{m.teamB.tag}</div>
          </div>
          <TeamLogo team={m.teamB} size={44} />
        </div>
      </div>
    </Link>
  );
}
