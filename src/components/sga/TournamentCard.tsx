import { Link } from "@tanstack/react-router";
import { Calendar, Trophy, Users } from "lucide-react";
import type { Tournament } from "@/mocks/data";
import { StatusBadge } from "./StatusBadge";

export function TournamentCard({ t }: { t: Tournament }) {
  const name = t.name.toLowerCase();
  const isValorant = name.includes("vct") || name.includes("valorant");
  const isCS2 = !isValorant && (name.includes("cs") || name.includes("counter-strike"));
  const isLoL = name.includes("league") || name.includes("lol");

  return (
    <Link to="/tournaments/$id" params={{ id: t.id }} className="group block">
      <div className={`relative overflow-hidden rounded-xl border border-border/60 bg-card-grad transition-all hover:-translate-y-1 ${
        isValorant ? "hover:bg-valorant/10 hover:border-valorant/40 hover:shadow-valorant" : 
        isCS2 ? "hover:bg-cs2/10 hover:border-cs2/40 hover:shadow-cs2" : 
        isLoL ? "hover:bg-lol/20 hover:border-lol/40 hover:shadow-lol" : 
        "hover:shadow-neon"
      }`}>
        <div className="relative h-40 overflow-hidden">
          <img src={t.banner} alt={t.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute top-3 left-3"><StatusBadge status={t.status} /></div>
        </div>
        <div className="p-4">
          <h3 className="font-display text-lg group-hover:text-primary transition-colors">{t.name}</h3>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{t.teamsCount} times</div>
            <div className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-primary" />{t.prize}</div>
            <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(t.startDate).toLocaleDateString("pt-BR")}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
