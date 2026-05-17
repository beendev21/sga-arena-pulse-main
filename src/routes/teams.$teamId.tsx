import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import useApiController from "@/API/controler";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { MatchCard } from "@/components/sga/MatchCard";
import { Trophy, TrendingUp, Target, Crosshair } from "lucide-react";
import { StatsCard } from "@/components/sga/StatsCard";
import { useMemo } from "react";

export const Route = createFileRoute("/teams/$teamId")({ component: TeamPage });

function TeamPage() {
  // Captura o parâmetro de ID da URL (ex: /teams/team-uuid).
  const { teamId } = Route.useParams();
  const apiTeams = useApiController("Teams");
  const apiPlayers = useApiController("Players");
  const apiMatches = useApiController("Matches");
  
  const { result: team, isLoading: l1 } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => apiTeams.getById(teamId)
  });

  const { result: playersRaw, isLoading: l2 } = useQuery({
    queryKey: ["players"],
    queryFn: () => apiPlayers.getAll()
  });

  const { result: matchesRaw, isLoading: l3 } = useQuery({
    queryKey: ["matches"],
    queryFn: () => apiMatches.getAll()
  });

  const lineup = useMemo(() => {
    const list = Array.isArray(playersRaw) ? playersRaw : (playersRaw?.result || []);
    return list.filter((p: any) => p.teamId === teamId);
  }, [playersRaw, teamId]);

  const recent = useMemo(() => {
    const list = Array.isArray(matchesRaw) ? matchesRaw : (matchesRaw?.result || []);
    return list.filter((m: any) => m.teamAId === teamId || m.teamBId === teamId).slice(0, 5);
  }, [matchesRaw, teamId]);

  if (l1 || l2 || l3) return <div className="p-10 text-center font-display uppercase italic">Recuperando registros de equipe...</div>;
  if (!team) return <div className="p-10 text-center">Time não encontrado.</div>;

  const wr = Math.round((team.wins / Math.max(team.wins + team.losses, 1)) * 100);

  return (
    <div>
      <div className="relative h-64 overflow-hidden" style={{ background: `linear-gradient(135deg, ${team.bannerColor}, oklch(0.14 0.02 285))` }}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto max-w-[1500px] px-4 h-full flex items-end pb-6 gap-4">
          <TeamLogo team={team} size={96} />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{team.tag}</div>
            <h1 className="font-display text-4xl uppercase">{team.name}</h1>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1500px] px-4 py-8 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="ELO" value={team.elo} icon={TrendingUp} accent />
          <StatsCard label="Vitórias" value={team.wins} icon={Target} />
          <StatsCard label="Winrate" value={`${wr}%`} icon={Crosshair} />
          <StatsCard label="Troféus" value={team.trophies} icon={Trophy} />
        </div>

        <section>
          <h2 className="font-display text-2xl uppercase mb-4"><span className="text-primary">/</span> Lineup</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {lineup.map((p) => (
              <div key={p.id} className="rounded-xl border border-border/60 bg-card-grad p-4 text-center hover:shadow-neon transition">
                <img src={p.avatar} alt={p.nick} className="mx-auto h-20 w-20 rounded-full ring-2 ring-primary/40" />
                <div className="font-display mt-3">{p.nick}</div>
                <div className="text-xs text-muted-foreground">{p.role}</div>
                <div className="mt-2 text-xs">Rating <span className="text-primary font-display">{p.rating}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl uppercase mb-4"><span className="text-primary">/</span> Partidas recentes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recent.map((m) => <MatchCard key={m.id} m={m} />)}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl uppercase mb-4"><span className="text-primary">/</span> Troféus</h2>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: team.trophies }).map((_, i) => (
              <div key={i} className="px-4 py-3 rounded-lg bg-card-grad border border-border/60 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <div><div className="text-xs text-muted-foreground">Temporada {i + 1}</div><div className="font-display">SGA Cup</div></div>
              </div>
            ))}
            {team.trophies === 0 && <div className="text-muted-foreground text-sm">Ainda em busca da glória.</div>}
          </div>
          <div className="mt-6 text-sm">
            <Link to="/teams" className="text-primary hover:underline">← Voltar para todos os times</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
