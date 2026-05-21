import { Link } from "@tanstack/react-router";
import { Calendar, Trophy, Users } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDateBR } from "@/lib/dateUtils";

interface Tournament {
  id: string;
  name: string;
  banner: string;
  status: "Ao vivo" | "Inscrições" | "Inscrições abertas" | "Encerrado" | "Em breve";
  teamsCount: number;
  prize: string;
  startDate: string;
}

export function TournamentCard({ t }: { t: Tournament }) {
  const name = t.name.toLowerCase();
  const isValorant = name.includes("vct") || name.includes("valorant");
  const isCS2 = !isValorant && (name.includes("cs") || name.includes("counter-strike"));
  const isLoL = name.includes("league") || name.includes("lol");

  const accentBorder =
    isValorant ? "hover:border-valorant/60" :
    isCS2 ? "hover:border-cs2/60" :
    isLoL ? "hover:border-lol/60" :
    "hover:border-primary/60";

  return (
    <Link to="/tournaments/$id" params={{ id: String(t.id) } as any} className="group block">
      <div className={`relative overflow-hidden ds-card transition-all hover:-translate-y-1 ${accentBorder}`}>
        <div className="relative h-44 overflow-hidden">
          <img src={t.banner} alt={t.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-2)] via-[var(--surface-2)]/60 to-transparent" />
          <div className="absolute top-3 left-3"><StatusBadge status={t.status} /></div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
            {t.name}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-semibold">{t.teamsCount}</span>
              <span className="text-muted-foreground hidden sm:inline">times</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold truncate">{t.prize}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-semibold text-xs">{formatDateBR(t.startDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
