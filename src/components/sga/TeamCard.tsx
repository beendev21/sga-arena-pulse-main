import { Link } from "@tanstack/react-router";
import type { Team } from "@/mocks/data";
import { TeamLogo } from "./TeamLogo";
import { Trophy } from "lucide-react";

export function TeamCard({ team, rank }: { team: Team; rank?: number }) {
  const wr = Math.round((team.wins / Math.max(team.wins + team.losses, 1)) * 100);
  return (
    <Link to="/teams/$teamId" params={{ teamId: team.id }} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card-grad p-4 hover:-translate-y-1 hover:shadow-neon transition-all">
        {rank !== undefined && (
          <div className="absolute top-2 right-2 font-display text-3xl text-muted-foreground/30 group-hover:text-primary/60">
            #{rank}
          </div>
        )}
        <div className="flex items-center gap-3">
          <TeamLogo team={team} size={56} />
          <div>
            <div className="font-display text-lg group-hover:text-primary transition-colors">{team.name}</div>
            <div className="text-xs text-muted-foreground">ELO {team.elo}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div><div className="text-success font-display text-base">{team.wins}</div><div className="text-muted-foreground">Wins</div></div>
          <div><div className="text-destructive font-display text-base">{team.losses}</div><div className="text-muted-foreground">Losses</div></div>
          <div><div className="text-primary font-display text-base">{wr}%</div><div className="text-muted-foreground">Winrate</div></div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-primary" /> {team.trophies} troféus
        </div>
      </div>
    </Link>
  );
}
