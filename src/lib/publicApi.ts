import { unwrapList } from "./api";

type AnyRecord = Record<string, any>;

const asId = (value: any) => String(value ?? "");

const pickFirstString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim() && value.trim() !== "null") {
      return value.trim();
    }
  }
  return "";
};

const mapPublicStatus = (status?: AnyRecord | string | null, statusId?: any) => {
  const raw = typeof status === "string" ? status : status?.name || status?.title || "";
  const normalized = String(raw).toLowerCase();

  if (normalized.includes("agend")) return "Agendada";
  if (normalized.includes("ativo")) return "Ao vivo";
  if (normalized.includes("final") || normalized.includes("encerr")) return "Encerrada";

  switch (Number(statusId)) {
    case 1:
      return "Agendada";
    case 2:
      return "Ao vivo";
    case 3:
      return "Encerrada";
    default:
      return "Agendada";
  }
};

export function buildPublicRoster({
  playersRaw,
  teamsRaw,
  participantsRaw,
  rolesRaw,
}: {
  playersRaw: any;
  teamsRaw: any;
  participantsRaw: any;
  rolesRaw: any;
}) {
  const players = unwrapList(playersRaw);
  const teams = unwrapList(teamsRaw);
  const participants = unwrapList(participantsRaw);
  const roles = unwrapList(rolesRaw);

  const playerById = new Map(players.map((player: AnyRecord) => [asId(player.id), player]));
  const teamById = new Map(teams.map((team: AnyRecord) => [asId(team.id), team]));
  const roleById = new Map(roles.map((role: AnyRecord) => [asId(role.id), role]));

  return participants
    .map((participant: AnyRecord) => {
      const player = playerById.get(asId(participant.playerId)) || participant.player || null;
      const team = teamById.get(asId(participant.teamId)) || participant.team || null;
      const role = roleById.get(asId(participant.roleId)) || participant.role || null;

      return {
        ...participant,
        player,
        team,
        role,
        playerName: pickFirstString(player?.name, participant.playerName, `Player #${participant.playerId}`),
        teamName: pickFirstString(team?.name, team?.tag, `Time #${participant.teamId}`),
        teamTag: pickFirstString(team?.tag, team?.name, `T${participant.teamId}`),
        roleName: pickFirstString(role?.name, `Função #${participant.roleId}`),
        avatar: pickFirstString(player?.avatarUrl, player?.avatar, ""),
      };
    })
    .filter((entry: AnyRecord) => entry.team && entry.player);
}

export function buildPublicMatches({
  matchesRaw,
  matchTeamsRaw,
  teamsRaw,
  tournamentsRaw,
  statusRaw,
  stagesRaw,
}: {
  matchesRaw: any;
  matchTeamsRaw: any;
  teamsRaw: any;
  tournamentsRaw: any;
  statusRaw: any;
  stagesRaw?: any;
}) {
  const matches = unwrapList(matchesRaw);
  const matchTeams = unwrapList(matchTeamsRaw);
  const teams = unwrapList(teamsRaw);
  const tournaments = unwrapList(tournamentsRaw);
  const statuses = unwrapList(statusRaw);
  const stages = unwrapList(stagesRaw);

  const teamById = new Map(teams.map((team: AnyRecord) => [asId(team.id), team]));
  const tournamentById = new Map(tournaments.map((tournament: AnyRecord) => [asId(tournament.id), tournament]));
  const statusById = new Map(statuses.map((status: AnyRecord) => [asId(status.id), status]));
  const stageById = new Map(stages.map((stage: AnyRecord) => [asId(stage.id), stage]));

  const matchTeamsByMatch = new Map<string, AnyRecord[]>();
  for (const relation of matchTeams) {
    const key = asId(relation.matchId);
    const current = matchTeamsByMatch.get(key) ?? [];
    current.push(relation);
    matchTeamsByMatch.set(key, current);
  }

  return matches.map((match: AnyRecord) => {
    const relations = matchTeamsByMatch.get(asId(match.id)) ?? [];
    const relationA =
      relations.find((entry) => String(entry.side || "").toUpperCase() === "A") || relations[0];
    const relationB =
      relations.find((entry) => String(entry.side || "").toUpperCase() === "B") || relations[1];

    const teamA =
      teamById.get(asId(relationA?.teamId || match.teamAId || match.matchTeamAId)) ||
      match.teamA ||
      relationA?.team ||
      null;
    const teamB =
      teamById.get(asId(relationB?.teamId || match.teamBId || match.matchTeamBId)) ||
      match.teamB ||
      relationB?.team ||
      null;

    const scoreA = Number(relationA?.score ?? match.scoreA ?? 0);
    const scoreB = Number(relationB?.score ?? match.scoreB ?? 0);
    const status = mapPublicStatus(statusById.get(asId(match.statusId)) || match.status, match.statusId);
    const tournament = tournamentById.get(asId(match.tournamentId)) || match.tournament || null;
    const stage = stageById.get(asId(match.stageId)) || match.stage || null;

    return {
      ...match,
      teamA,
      teamB,
      scoreA,
      scoreB,
      status,
      tournamentName: pickFirstString(tournament?.name, `Campeonato #${match.tournamentId}`),
      map: pickFirstString(stage?.name, match.bracketPosition, "Bracket"),
    };
  });
}

