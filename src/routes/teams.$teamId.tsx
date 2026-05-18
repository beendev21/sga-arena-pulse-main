import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import useApiController from "@/API/controler";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { MatchCard } from "@/components/sga/MatchCard";
import { Trophy, TrendingUp, Target, Crosshair } from "lucide-react";
import { StatsCard } from "@/components/sga/StatsCard";
import { useMemo } from "react";
import { buildPublicMatches, buildPublicRoster } from "@/lib/publicApi";

export const Route = createFileRoute("/teams/$teamId")({ component: TeamPage });

function TeamPage() {
  // Captura o parâmetro de ID da URL (ex: /teams/team-uuid).
  const { teamId } = Route.useParams();
  const apiTeams = useApiController("Teams");
  const apiMatches = useApiController("Matches");
  const apiMatchTeams = useApiController("Matchteams");
  const apiParticipants = useApiController("TeamParticipants");
  const apiPlayers = useApiController("Players");
  const apiRoles = useApiController("Roles");
  const apiTournaments = useApiController("Tournaments");
  const apiStatus = useApiController("Status");
  const apiStages = useApiController("Stages");
  
  const { result: team, isLoading: l1 } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => apiTeams.getById(teamId, { includeAuth: false })
  });

  const { result: playersRaw, isLoading: l2 } = useQuery({
    queryKey: ["players"],
    queryFn: () => apiPlayers.getAll({ includeAuth: false })
  });

  const { result: matchesRaw, isLoading: l3 } = useQuery({
    queryKey: ["matches"],
    queryFn: () => apiMatches.getAll({ includeAuth: false })
  });

  const { data: matchTeamsRaw } = useQuery({
    queryKey: ["matchteams"],
    queryFn: () => apiMatchTeams.getAll({ includeAuth: false })
  });
  const { data: participantsRaw } = useQuery({
    queryKey: ["team-participants"],
    queryFn: () => apiParticipants.getAll({ includeAuth: false })
  });
  const { data: rolesRaw } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiRoles.getAll({ includeAuth: false })
  });
  const { data: tournamentsRaw } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => apiTournaments.getAll({ includeAuth: false })
  });
  const { data: statusRaw } = useQuery({
    queryKey: ["status"],
    queryFn: () => apiStatus.getAll({ includeAuth: false })
  });
  const { data: stagesRaw } = useQuery({
    queryKey: ["stages"],
    queryFn: () => apiStages.getAll({ includeAuth: false })
  });

  const lineup = useMemo(() => {
    return buildPublicRoster({
      playersRaw,
      teamsRaw: [team],
      participantsRaw,
      rolesRaw,
    }).filter((entry: any) => String(entry.teamId) === String(teamId));
  }, [playersRaw, participantsRaw, rolesRaw, team, teamId]);

  const recent = useMemo(() => {
    return buildPublicMatches({
      matchesRaw,
      matchTeamsRaw,
      teamsRaw: [team],
      tournamentsRaw,
      statusRaw,
      stagesRaw,
    })
      .filter((m: any) => String(m.teamA?.id) === String(teamId) || String(m.teamB?.id) === String(teamId))
      .slice(0, 5);
  }, [matchesRaw, matchTeamsRaw, tournamentsRaw, statusRaw, stagesRaw, team, teamId]);

  if (l1 || l2 || l3 || !participantsRaw || !rolesRaw) return <div className="p-10 text-center font-display uppercase italic">Recuperando registros de equipe...</div>;
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
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-primary/20 bg-primary/10 font-display text-xl text-primary">
                  {String(p.playerName || "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part: string) => part[0]?.toUpperCase() || "")
                    .join("")}
                </div>
                <div className="font-display mt-3">{p.playerName}</div>
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
