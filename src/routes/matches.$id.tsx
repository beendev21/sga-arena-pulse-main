import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import useApiController from "@/API/controler";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { StatusBadge } from "@/components/sga/StatusBadge";
import { Trophy, Map as MapIcon, Users } from "lucide-react";
import { buildPublicMatches, buildPublicRoster } from "@/lib/publicApi";
import { unwrapList } from "@/lib/api";

export const Route = createFileRoute("/matches/$id")({ component: MatchPage });

function MatchPage() {
  const { id } = Route.useParams();
  const apiMatches = useApiController("Matches");
  const apiMatchTeams = useApiController("Matchteams");
  const apiTeams = useApiController("Teams");
  const apiTournaments = useApiController("Tournaments");
  const apiStatus = useApiController("Status");
  const apiStages = useApiController("Stages");
  const apiPlayers = useApiController("Players");
  const apiParticipants = useApiController("TeamParticipants");
  const apiRoles = useApiController("Roles");

  const { data: matchesRaw, isLoading: l1 } = useQuery({
    queryKey: ["matches"],
    queryFn: () => apiMatches.getAll({ includeAuth: false }),
  });
  const { data: matchTeamsRaw, isLoading: l2 } = useQuery({
    queryKey: ["matchteams"],
    queryFn: () => apiMatchTeams.getAll({ includeAuth: false }),
  });
  const { data: teamsRaw, isLoading: l3 } = useQuery({
    queryKey: ["teams"],
    queryFn: () => apiTeams.getAll({ includeAuth: false }),
  });
  const { data: tournamentsRaw, isLoading: l4 } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => apiTournaments.getAll({ includeAuth: false }),
  });
  const { data: statusRaw, isLoading: l5 } = useQuery({
    queryKey: ["status"],
    queryFn: () => apiStatus.getAll({ includeAuth: false }),
  });
  const { data: stagesRaw, isLoading: l6 } = useQuery({
    queryKey: ["stages"],
    queryFn: () => apiStages.getAll({ includeAuth: false }),
  });
  const { data: playersRaw, isLoading: l7 } = useQuery({
    queryKey: ["players"],
    queryFn: () => apiPlayers.getAll({ includeAuth: false }),
  });
  const { data: participantsRaw, isLoading: l8 } = useQuery({
    queryKey: ["team-participants"],
    queryFn: () => apiParticipants.getAll({ includeAuth: false }),
  });
  const { data: rolesRaw, isLoading: l9 } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiRoles.getAll({ includeAuth: false }),
  });

  const match = useMemo(
    () =>
      buildPublicMatches({
        matchesRaw,
        matchTeamsRaw,
        teamsRaw,
        tournamentsRaw,
        statusRaw,
        stagesRaw,
      }).find((item: any) => String(item.id) === String(id)),
    [matchesRaw, matchTeamsRaw, teamsRaw, tournamentsRaw, statusRaw, stagesRaw, id],
  );

  const rosters = useMemo(
    () =>
      buildPublicRoster({
        playersRaw,
        teamsRaw,
        participantsRaw,
        rolesRaw,
      }),
    [playersRaw, teamsRaw, participantsRaw, rolesRaw],
  );

  const lineupA = useMemo(
    () => rosters.filter((entry: any) => String(entry.teamId) === String(match?.teamA?.id)).slice(0, 5),
    [rosters, match?.teamA?.id],
  );
  const lineupB = useMemo(
    () => rosters.filter((entry: any) => String(entry.teamId) === String(match?.teamB?.id)).slice(0, 5),
    [rosters, match?.teamB?.id],
  );

  if (l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9) {
    return <div className="p-10 text-center">Carregando dados da partida...</div>;
  }

  if (!match) {
    return <div className="p-10 text-center">Partida não encontrada.</div>;
  }

  const winA = Number(match.scoreA) > Number(match.scoreB);

  return (
    <div>
      <div className="bg-hero">
        <div className="mx-auto max-w-[1500px] px-4 py-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <StatusBadge status={match.status} />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{match.tournamentName}</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">
              <MapIcon className="h-3.5 w-3.5" /> {match.map}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8 md:gap-6 rounded-2xl border border-border/60 bg-card-grad p-6 md:p-10">
            <div className={`flex flex-col items-center text-center gap-3 ${winA ? "" : "opacity-70"}`}>
              <TeamLogo team={match.teamA} size={88} />
              <div className="font-display text-xl">{match.teamA?.name}</div>
              {winA && <div className="text-xs text-primary uppercase tracking-widest">Vencedor</div>}
            </div>
            <div className="text-center order-first md:order-none">
              <div className="font-display text-6xl md:text-7xl">
                <span className={winA ? "text-primary" : ""}>{match.scoreA}</span>
                <span className="text-muted-foreground mx-2 md:mx-3">:</span>
                <span className={!winA && match.status === "Encerrada" ? "text-primary" : ""}>{match.scoreB}</span>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mt-2">{match.bracketPosition}</div>
            </div>
            <div className={`flex flex-col items-center text-center gap-3 ${!winA && match.status === "Encerrada" ? "" : "opacity-70"}`}>
              <TeamLogo team={match.teamB} size={88} />
              <div className="font-display text-xl">{match.teamB?.name}</div>
              {!winA && match.status === "Encerrada" && <div className="text-xs text-primary uppercase tracking-widest">Vencedor</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display text-xl uppercase mb-4"><span className="text-primary">/</span> Elencos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[{ title: match.teamA?.name, roster: lineupA, team: match.teamA }, { title: match.teamB?.name, roster: lineupB, team: match.teamB }].map((block) => (
                <div key={block.title} className="rounded-xl border border-border/60 bg-card-grad p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <TeamLogo team={block.team} size={40} />
                    <div>
                      <div className="font-display">{block.title}</div>
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {block.roster.length} jogadores</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {block.roster.map((entry: any) => (
                      <div key={entry.id} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                        <div>
                          <div className="text-sm font-semibold">{entry.playerName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-xl uppercase mb-4"><span className="text-primary">/</span> Informações</h2>
            <div className="space-y-3 rounded-xl border border-border/60 bg-card-grad p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Campeonato</span>
                <span className="font-semibold text-right">{match.tournamentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold">{match.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bracket</span>
                <span className="font-semibold">{match.bracketPosition}</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase mb-4"><span className="text-primary">/</span> Highlights</h2>
            <div className="aspect-video rounded-xl overflow-hidden ring-1 ring-primary/40">
              <video src="https://www.w3.org/2010/05/sintel/trailer.mp4" controls className="h-full w-full" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
