import { useState, useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import useApiController from "@/API/controler";
import ApiService from "@/API/service";
import {
  tabs,
  AdminTabKey,
  createEmptyPlayer,
  createEmptyTeam,
  createEmptyTeamMatchStats,
  createEmptyTeamParticipant,
  createEmptyTeamParticipantDraft,
  createEmptyTournament,
  createEmptyMatch,
  BRACKET_UPPER_ROUNDS,
  BRACKET_LOWER_ROUNDS,
  BRACKET_PROGRESS_MAP,
  BRACKET_LOSER_PROGRESS_MAP,
  BRACKET_PHASE_LABELS,
  BRACKET_STAGE_HINTS,
  BRACKET_STORAGE_KEY,
} from "../types";
import {
  formatApiUtcTimestamp,
  toDateTimeLocalValue,
  parseApiResponse,
  extractEntity,
  filt,
  paginate,
} from "../utils";

export function useAdminPage() {
  const user = useAuth((s) => s.user);
  const isAdmin = useAuth((s) => s.isAdmin);
  const token = useAuth((s) => s.token);

  const [tab, setTab] = useState<AdminTabKey | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const shouldLoadTab = (keys: Array<AdminTabKey>) => tab !== null && keys.includes(tab);

  const [isCreatingTourney, setIsCreatingTourney] = useState(false);
  const [newTourney, setNewTourney] = useState(createEmptyTournament());

  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeam, setNewTeam] = useState(createEmptyTeam());
  const [teamGameId, setTeamGameId] = useState(0);
  const [teamParticipants, setTeamParticipants] = useState([createEmptyTeamParticipant()]);
  const [viewingTeamId, setViewingTeamId] = useState<number | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editTeamRosterHydrated, setEditTeamRosterHydrated] = useState(false);
  const [editingEntity, setEditingEntity] = useState<
    | { type: "tournament"; data: any }
    | { type: "team"; data: any }
    | { type: "player"; data: any }
    | { type: "match"; data: any }
    | null
  >(null);
  const [editTournamentDraft, setEditTournamentDraft] = useState(createEmptyTournament());
  const [editTeamDraft, setEditTeamDraft] = useState(createEmptyTeam());
  const [editTeamGameId, setEditTeamGameId] = useState(0);
  const [editTeamMatchStatsDraft, setEditTeamMatchStatsDraft] = useState(createEmptyTeamMatchStats());
  const [editTeamParticipants, setEditTeamParticipants] = useState(
    [createEmptyTeamParticipantDraft()],
  );
  const [editPlayerDraft, setEditPlayerDraft] = useState(createEmptyPlayer());
  const [editPlayerStatsMatchId, setEditPlayerStatsMatchId] = useState(0);
  const [editMatchDraft, setEditMatchDraft] = useState(createEmptyMatch());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; entity: string } | null>(null);

  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState(createEmptyPlayer());
  const [draggingTeamId, setDraggingTeamId] = useState<number | null>(null);
  const [previewSlotKey, setPreviewSlotKey] = useState<string | null>(null);
  const [optimisticBracketSlots, setOptimisticBracketSlots] = useState<Record<string, Record<string, any>>>({});
  const [isBracketLayoutHydrated, setIsBracketLayoutHydrated] = useState(false);

  const apiTournaments = useApiController("Tournaments");
  const apiPlayers = useApiController("Players");
  const apiTeams = useApiController("Teams");
  const apiRoles = useApiController("Roles");
  const apiTeamParticipants = useApiController("TeamParticipants");
  const apiPlayerMatchStats = useApiController("PlayerMatchStats");
  const apiTeamMatchStats = useApiController("TeamMatchStats");
  const apiUsers = useApiController("User");
  const apiGameAccounts = useApiController("GameAccounts");
  const apiGames = useApiController("Games");
  const apiStages = useApiController("Stages");
  const apiStatus = useApiController("Status");
  const apiMatches = useApiController("Matches");
  const apiMatchTeams = useApiController("Matchteams");
  const apiMatchLineups = useApiController("MatchLineups");
  const apiMatchLineupPlayers = useApiController("MatchLineupPlayers");
  const apiHighlights = useApiController("Highlights");
  const apiGallery = useApiController("Gallery");

  const queryClient = useQueryClient();

  const { data: tr, isLoading: l1 } = useQuery({
    queryKey: ["tournaments", user?.id],
    queryFn: () => apiTournaments.getAll(),
    enabled: !!user && shouldLoadTab(["campeonatos", "chaveamentos", "ia"]),
  });

  const { data: pr, isLoading: l2 } = useQuery({
    queryKey: ["players", user?.id],
    queryFn: () => apiPlayers.getAll(),
    enabled: !!user && shouldLoadTab(["times", "jogadores", "ia"]),
  });

  const { data: ter, isLoading: l3 } = useQuery({
    queryKey: ["teams", user?.id],
    queryFn: () => apiTeams.getAll(),
    enabled: !!user && shouldLoadTab(["times", "chaveamentos", "ia"]),
  });

  const { data: rr } = useQuery({
    queryKey: ["roles", user?.id],
    queryFn: () => apiRoles.getAll(),
    enabled: !!user && shouldLoadTab(["times", "ia"]),
  });

  const { data: tpr } = useQuery({
    queryKey: ["team-participants", user?.id],
    queryFn: () => apiTeamParticipants.getAll(),
    enabled: !!user && shouldLoadTab(["times", "jogadores", "ia"]),
  });

  const { data: pmsr } = useQuery({
    queryKey: ["player-match-stats", user?.id],
    queryFn: () => apiPlayerMatchStats.getAll(),
    enabled: !!user && shouldLoadTab(["jogadores", "ia"]),
  });

  const { data: tmsr } = useQuery({
    queryKey: ["team-match-stats", user?.id],
    queryFn: () => apiTeamMatchStats.getAll(),
    enabled: !!user && shouldLoadTab(["times", "ia"]),
  });

  const { data: ur } = useQuery({
    queryKey: ["users", user?.id],
    queryFn: () => apiUsers.getAll(),
    enabled: !!user && shouldLoadTab(["jogadores", "ia"]),
  });

  const { data: garc } = useQuery({
    queryKey: ["game-accounts", user?.id],
    queryFn: () => apiGameAccounts.getAll(),
    enabled: !!user && shouldLoadTab(["ia"]),
  });

  const { data: gar } = useQuery({
    queryKey: ["games", user?.id],
    queryFn: () => apiGames.getAll(),
    enabled: !!user && shouldLoadTab(["campeonatos", "times", "ia"]),
  });

  const { data: str } = useQuery({
    queryKey: ["stages", user?.id],
    queryFn: () => apiStages.getAll(),
    enabled: !!user && shouldLoadTab(["chaveamentos", "ia"]),
  });

  const { data: sr, isLoading: lStatus } = useQuery({
    queryKey: ["statuses", user?.id],
    queryFn: () => apiStatus.getAll(),
    enabled: !!user && shouldLoadTab(["campeonatos", "monitoramento", "chaveamentos", "ia"]),
  });

  const { data: mr, isLoading: l4 } = useQuery({
    queryKey: ["matches", user?.id],
    queryFn: () => apiMatches.getAll(),
    enabled: !!user && shouldLoadTab(["chaveamentos", "monitoramento", "ia"]),
  });

  const { data: mtr } = useQuery({
    queryKey: ["match-teams", user?.id],
    queryFn: () => apiMatchTeams.getAll(),
    enabled: !!user && shouldLoadTab(["ia"]),
  });

  const { data: mlar } = useQuery({
    queryKey: ["match-lineups", user?.id],
    queryFn: () => apiMatchLineups.getAll(),
    enabled: !!user && shouldLoadTab(["ia"]),
  });

  const { data: mlpar } = useQuery({
    queryKey: ["match-lineup-players", user?.id],
    queryFn: () => apiMatchLineupPlayers.getAll(),
    enabled: !!user && shouldLoadTab(["ia"]),
  });

  const { data: hr } = useQuery({
    queryKey: ["highlights", user?.id],
    queryFn: () => apiHighlights.getAll(),
    enabled: !!user && shouldLoadTab(["highlights"]),
  });

  const { data: gr } = useQuery({
    queryKey: ["gallery", user?.id],
    queryFn: () => apiGallery.getAll(),
    enabled: !!user && shouldLoadTab(["galeria"]),
  });

  const tournamentsData = useMemo(() => parseApiResponse(tr), [tr]);
  const playersData = useMemo(() => parseApiResponse(pr), [pr]);
  const teamsData = useMemo(() => parseApiResponse(ter), [ter]);
  const rolesData = useMemo(() => parseApiResponse(rr), [rr]);
  const teamParticipantsData = useMemo(() => parseApiResponse(tpr), [tpr]);
  const playerMatchStatsData = useMemo(() => parseApiResponse(pmsr), [pmsr]);
  const teamMatchStatsData = useMemo(() => parseApiResponse(tmsr), [tmsr]);
  const usersData = useMemo(() => parseApiResponse(ur), [ur]);
  const gameAccountsData = useMemo(() => parseApiResponse(garc), [garc]);
  const gamesData = useMemo(() => parseApiResponse(gar), [gar]);
  const stagesData = useMemo(() => parseApiResponse(str), [str]);
  const statusesData = useMemo(() => parseApiResponse(sr), [sr]);
  const matchesData = useMemo(() => parseApiResponse(mr), [mr]);
  const matchTeamsData = useMemo(() => parseApiResponse(mtr), [mtr]);
  const matchLineupsData = useMemo(() => parseApiResponse(mlar), [mlar]);
  const matchLineupPlayersData = useMemo(() => parseApiResponse(mlpar), [mlpar]);
  const highlightsData = useMemo(() => parseApiResponse(hr), [hr]);
  const galleryData = useMemo(() => parseApiResponse(gr), [gr]);

  const linkedUserIds = useMemo(
    () => new Set(playersData.map((player: any) => Number(player.userId)).filter(Boolean)),
    [playersData],
  );

  const selectedUser = useMemo(
    () => usersData.find((candidate: any) => Number(candidate.id) === Number(newPlayer.userId)),
    [newPlayer.userId, usersData],
  );

  const availableRoles = useMemo(
    () => rolesData.filter((role: any) => !teamGameId || Number(role.gameId) === Number(teamGameId)),
    [rolesData, teamGameId],
  );

  const editAvailableRoles = useMemo(
    () => rolesData.filter((role: any) => !editTeamGameId || Number(role.gameId) === Number(editTeamGameId)),
    [rolesData, editTeamGameId],
  );

  const linkedPlayerIdsInDraft = useMemo(
    () => new Set(teamParticipants.map((participant) => Number(participant.playerId)).filter(Boolean)),
    [teamParticipants],
  );

  const linkedPlayerIdsInEditDraft = useMemo(
    () => new Set(editTeamParticipants.map((participant) => Number(participant.playerId)).filter(Boolean)),
    [editTeamParticipants],
  );

  const viewingTeam = useMemo(
    () => teamsData.find((team: any) => Number(team.id) === Number(viewingTeamId)),
    [teamsData, viewingTeamId],
  );

  const viewingTeamParticipants = useMemo(() => {
    if (!viewingTeamId) return [];

    return teamParticipantsData
      .filter((participant: any) => Number(participant.teamId) === Number(viewingTeamId))
      .map((participant: any) => {
        const player = playersData.find((candidate: any) => Number(candidate.id) === Number(participant.playerId));
        const role = rolesData.find((candidate: any) => Number(candidate.id) === Number(participant.roleId));

        return {
          ...participant,
          player,
          role,
        };
      });
  }, [playersData, rolesData, teamParticipantsData, viewingTeamId]);

  const getUserLabel = (candidate: any) => {
    if (!candidate) return "Usuário sem identificação";
    return candidate.login || candidate.email || `Usuário #${candidate.id}`;
  };

  const getTournamentStatusLabel = (statusId: number) => {
    const status = statusesData.find((candidate: any) => Number(candidate.id) === Number(statusId));
    return status?.name || status?.title || `Status #${statusId}`;
  };

  const getGameLabel = (gameId: number) => {
    const game = gamesData.find((candidate: any) => Number(candidate.id) === Number(gameId));
    return game?.name || game?.title || `Jogo #${gameId}`;
  };

  const getTournamentLabel = (tournamentId: number) => {
    const tournament = tournamentsData.find((candidate: any) => Number(candidate.id) === Number(tournamentId));
    return tournament?.name || `Campeonato #${tournamentId}`;
  };

  const getStageLabel = (stageId: number) => {
    const stage = stagesData.find((candidate: any) => Number(candidate.id) === Number(stageId));
    return stage?.name || `Stage #${stageId}`;
  };

  const getTeamLabel = (teamId: number) => {
    const team = teamsData.find((candidate: any) => Number(candidate.id) === Number(teamId));
    return team?.name || `Time #${teamId}`;
  };

  const playerStatsById = useMemo(() => {
    const map = new Map<number, { kills: number; deaths: number; assists: number; kda: number }>();

    for (const stat of playerMatchStatsData) {
      const playerId = Number(stat?.playerId);
      if (!playerId) continue;

      const current = map.get(playerId) || { kills: 0, deaths: 0, assists: 0, kda: 0 };
      current.kills += Number(stat?.kills) || 0;
      current.deaths += Number(stat?.deaths) || 0;
      current.assists += Number(stat?.assists) || 0;
      current.kda = (current.kills + current.assists) / Math.max(current.deaths, 1);
      map.set(playerId, current);
    }

    return map;
  }, [playerMatchStatsData]);

  const getPlayerTeam = (playerId: number) => {
    const participant = teamParticipantsData.find((candidate: any) => Number(candidate.playerId) === Number(playerId));
    if (!participant) return null;
    return teamsData.find((candidate: any) => Number(candidate.id) === Number(participant.teamId)) || null;
  };

  const getPlayerTeamId = (playerId: number) => {
    const participant = teamParticipantsData.find((candidate: any) => Number(candidate.playerId) === Number(playerId));
    return Number(participant?.teamId) || 0;
  };

  const getLatestMatchForTeam = (teamId: number) => {
    return [...matchesData]
      .filter((match: any) => Number(match.teamAId) === Number(teamId) || Number(match.teamBId) === Number(teamId))
      .sort((a: any, b: any) => {
        const ta = new Date(a.startedAt || a.createdAt || a.updatedAt || 0).getTime();
        const tb = new Date(b.startedAt || b.createdAt || b.updatedAt || 0).getTime();
        return tb - ta;
      })[0];
  };

  const getLatestStatsRecordForPlayer = (playerId: number) => {
    return [...playerMatchStatsData]
      .filter((entry: any) => Number(entry.playerId) === Number(playerId))
      .sort((a: any, b: any) => {
        const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return tb - ta;
      })[0];
  };

  const getTeamMatchStatsRecord = (teamId: number, matchId: number) => {
    return [...teamMatchStatsData].find(
      (entry: any) => Number(entry.teamId) === Number(teamId) && Number(entry.matchId) === Number(matchId)
    );
  };

  const getLatestTeamMatchStatsRecord = (teamId: number) => {
    return [...teamMatchStatsData]
      .filter((entry: any) => Number(entry.teamId) === Number(teamId))
      .sort((a: any, b: any) => {
        const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return tb - ta;
      })[0];
  };

  const editingPlayerTeamId = useMemo(() => {
    if (editingEntity?.type !== "player") return 0;
    return getPlayerTeamId(Number(editingEntity.data?.id) || 0);
  }, [editingEntity, teamParticipantsData]);

  const playerStatsMatchOptions = useMemo(() => {
    if (!editingPlayerTeamId) return [];

    return [...matchesData]
      .filter(
        (match: any) =>
          Number(match.teamAId) === Number(editingPlayerTeamId) ||
          Number(match.teamBId) === Number(editingPlayerTeamId),
      )
      .sort((a: any, b: any) => {
        const ta = new Date(a.startedAt || a.createdAt || a.updatedAt || 0).getTime();
        const tb = new Date(b.startedAt || b.createdAt || b.updatedAt || 0).getTime();
        return tb - ta;
      });
  }, [editingPlayerTeamId, matchesData]);

  const teamStatsMatchOptions = useMemo(() => {
    if (!editingTeamId) return [];

    return [...matchesData]
      .filter((match: any) => {
        const matchTeams = Array.isArray(match?.teams) ? match.teams : match?.teams?.$values || [];

        return (
          Number(match.teamAId) === Number(editingTeamId) ||
          Number(match.teamBId) === Number(editingTeamId) ||
          Number(match.matchTeamAId) === Number(editingTeamId) ||
          Number(match.matchTeamBId) === Number(editingTeamId) ||
          matchTeams.some((candidate: any) => Number(candidate?.teamId) === Number(editingTeamId))
        );
      })
      .sort((a: any, b: any) => {
        const ta = new Date(a.startedAt || a.createdAt || a.updatedAt || 0).getTime();
        const tb = new Date(b.startedAt || b.createdAt || b.updatedAt || 0).getTime();
        return tb - ta;
      });
  }, [editingTeamId, matchesData]);

  const resolveMatchTeamId = (...candidates: any[]) => {
    for (const candidate of candidates) {
      const value = Number(candidate);
      if (value) return value;
    }
    return 0;
  };

  const openTournamentEdit = (tournament: any) => {
    setEditingEntity({ type: "tournament", data: tournament });
    setEditTournamentDraft({
      ...createEmptyTournament(),
      name: String(tournament?.name || ""),
      description: String(tournament?.description || ""),
      bannerUrl: String(tournament?.bannerUrl || tournament?.banner || ""),
      startDate: toDateTimeLocalValue(tournament?.startDate),
      endDate: toDateTimeLocalValue(tournament?.endDate),
      createdBy: String(tournament?.createdBy || "SGA_ADMIN"),
      format: String(tournament?.format || "Eliminação Simples"),
      bracketType: String(tournament?.bracketType || "Single Elimination"),
      maxTeams: Number(tournament?.maxTeams) || 0,
      organizer: String(tournament?.organizer || "Santos Games Arena"),
      rulebookUrl: String(tournament?.rulebookUrl || ""),
      prizePool: Number(tournament?.prizePool) || 0,
      region: String(tournament?.region || "Brasil"),
      timezone: String(tournament?.timezone || "UTC-3"),
      patchVersion: String(tournament?.patchVersion || "Current"),
      rosterLockAt: toDateTimeLocalValue(tournament?.rosterLockAt),
      statusId: Number(tournament?.statusId) || 0,
      gameId: Number(tournament?.gameId) || 0,
    });
  };

  const openTeamEdit = (team: any) => {
    const teamId = Number(team?.id) || 0;
    const latestTeamStats = getLatestTeamMatchStatsRecord(teamId);
    const inferredMatchId =
      Number(latestTeamStats?.matchId) || Number(getLatestMatchForTeam(teamId)?.id) || 0;
    const resolvedTeamStats = inferredMatchId
      ? getTeamMatchStatsRecord(teamId, inferredMatchId) || latestTeamStats
      : latestTeamStats;

    setEditingTeamId(Number(team?.id) || null);
    setEditTeamRosterHydrated(false);
    setEditingEntity({ type: "team", data: team });
    setEditTeamDraft({
      ...createEmptyTeam(),
      name: String(team?.name || ""),
      description: String(team?.description || ""),
      tag: String(team?.tag || ""),
      logoUrl: String(team?.logoUrl || ""),
      bannerColor: String(team?.bannerColor || "#f86d83"),
      gameId: Number(team?.gameId) || 0,
      elo: Number(team?.elo) || 0,
    });
    setEditTeamGameId(Number(team?.gameId) || 0);
    setEditTeamMatchStatsDraft({
      id: Number(resolvedTeamStats?.id) || 0,
      teamId,
      matchId: inferredMatchId,
      roundsWon: Number(resolvedTeamStats?.roundsWon) || 0,
      roundsLost: Number(resolvedTeamStats?.roundsLost) || 0,
      plants: Number(resolvedTeamStats?.plants) || 0,
      defuses: Number(resolvedTeamStats?.defuses) || 0,
    });
    setEditTeamParticipants([createEmptyTeamParticipantDraft()]);
  };

  const openPlayerEdit = (player: any) => {
    const latestStats = getLatestStatsRecordForPlayer(Number(player?.id) || 0);
    const playerTeamId = getPlayerTeamId(Number(player?.id) || 0);
    const inferredMatch = latestStats?.matchId
      ? Number(latestStats.matchId)
      : Number(getLatestMatchForTeam(playerTeamId)?.id) || 0;

    setEditingEntity({ type: "player", data: player });
    setEditPlayerDraft({
      ...createEmptyPlayer(),
      name: String(player?.name || ""),
      avatarUrl: String(player?.avatarUrl || "https://picsum.photos/seed/sga/200/200"),
      userId: Number(player?.userId) || 0,
      isProfilePublic: Boolean(player?.isProfilePublic),
      kills: Number(latestStats?.kills) || 0,
      deaths: Number(latestStats?.deaths) || 0,
      assists: Number(latestStats?.assists) || 0,
      adr: Number(latestStats?.adr) || 0,
      hsPercentage: Number(latestStats?.hsPercentage) || 0,
      firstKills: Number(latestStats?.firstKills) || 0,
      kast: Number(latestStats?.kast) || 0,
      acs: Number(latestStats?.acs) || 0,
    });
    setEditPlayerStatsMatchId(inferredMatch);
  };

  const openMatchEdit = (match: any) => {
    setEditingEntity({ type: "match", data: match });
    setEditMatchDraft({
      ...createEmptyMatch(),
      stageId: Number(match?.stageId) || 0,
      tournamentId:
        Number(match?.tournamentId) ||
        Number(match?.tournament?.id) ||
        Number(selectedTourney) ||
        0,
      statusId: Number(match?.statusId) || 0,
      winnerTeamId: Number(match?.winnerTeamId) || 0,
      teamAId: resolveMatchTeamId(
        match?.teamAId,
        match?.matchTeamAId,
        match?.teamA?.id,
        match?.teamA?.teamId,
        match?.teams?.find?.(
          (candidate: any) => String(candidate?.side || "").toUpperCase() === "A",
        )?.teamId,
      ),
      teamBId: resolveMatchTeamId(
        match?.teamBId,
        match?.matchTeamBId,
        match?.teamB?.id,
        match?.teamB?.teamId,
        match?.teams?.find?.(
          (candidate: any) => String(candidate?.side || "").toUpperCase() === "B",
        )?.teamId,
      ),
      gameId: Number(match?.gameId) || 0,
      bestOf: Number(match?.bestOf) || 1,
      startedAt: toDateTimeLocalValue(match?.startedAt),
      finishedAt: toDateTimeLocalValue(match?.finishedAt),
    });
  };

  const closeEditModal = () => {
    setEditingEntity(null);
    setEditTournamentDraft(createEmptyTournament());
    setEditingTeamId(null);
    setEditTeamRosterHydrated(false);
    setEditPlayerDraft(createEmptyPlayer());
    setEditPlayerStatsMatchId(0);
    setEditTeamMatchStatsDraft(createEmptyTeamMatchStats());
  };

  const updateEditTeamMatchStatsMatch = (matchId: number) => {
    const teamId = Number(editingTeamId) || Number(editingEntity?.data?.id) || 0;
    const existing = teamId && matchId ? getTeamMatchStatsRecord(teamId, matchId) : null;

    setEditTeamMatchStatsDraft({
      id: Number(existing?.id) || 0,
      teamId,
      matchId,
      roundsWon: Number(existing?.roundsWon) || 0,
      roundsLost: Number(existing?.roundsLost) || 0,
      plants: Number(existing?.plants) || 0,
      defuses: Number(existing?.defuses) || 0,
    });
  };

  const updateEditTeamParticipant = (
    index: number,
    patch: Partial<ReturnType<typeof createEmptyTeamParticipantDraft>>,
  ) => {
    setEditTeamParticipants((current) =>
      current.map((participant, participantIndex) =>
        participantIndex === index ? { ...participant, ...patch } : participant,
      ),
    );
  };

  const addEditTeamParticipant = () => {
    setEditTeamParticipants((current) => [...current, createEmptyTeamParticipantDraft()]);
  };

  const removeEditTeamParticipant = (index: number) => {
    setEditTeamParticipants((current) => {
      if (current.length === 1) return [createEmptyTeamParticipantDraft()];
      return current.filter((_, participantIndex) => participantIndex !== index);
    });
  };

  useEffect(() => {
    if (editingEntity?.type !== "team" || !editingTeamId || editTeamRosterHydrated) return;

    const currentParticipants = teamParticipantsData
      .filter((participant: any) => Number(participant.teamId) === Number(editingTeamId))
      .map((participant: any) => ({
        id: Number(participant.id) || 0,
        roleId: Number(participant.roleId) || 0,
        playerId: Number(participant.playerId) || 0,
        playerName:
          playersData.find((candidate: any) => Number(candidate.id) === Number(participant.playerId))?.name ||
          participant.player?.name ||
          "",
        roleName:
          rolesData.find((candidate: any) => Number(candidate.id) === Number(participant.roleId))?.name ||
          participant.role?.name ||
          "",
        isActive: Boolean(participant.isActive),
        isStarter: Boolean(participant.isStarter),
        isCaptain: Boolean(participant.isCaptain),
        isSubstitute: Boolean(participant.isSubstitute),
        joinedAt: participant.joinedAt || "",
        leftAt: participant.leftAt || null,
      }));

    setEditTeamParticipants(currentParticipants.length > 0 ? currentParticipants : [createEmptyTeamParticipantDraft()]);
    setEditTeamRosterHydrated(true);
  }, [editingEntity?.type, editingTeamId, editTeamRosterHydrated, teamParticipantsData, playersData, rolesData]);

  const saveEdit = async () => {
    if (!editingEntity) return;

    try {
      if (editingEntity.type === "tournament") {
        if (!editTournamentDraft.name.trim()) {
          throw new Error("O nome do campeonato é obrigatório.");
        }
        if (!editTournamentDraft.gameId) {
          throw new Error("Selecione um jogo para o campeonato.");
        }
        if (!editTournamentDraft.statusId) {
          throw new Error("Selecione o status do campeonato.");
        }

        const payload = {
          id: Number(editingEntity.data?.id) || 0,
          createdAt:
            formatApiUtcTimestamp(editingEntity.data?.createdAt) ||
            formatApiUtcTimestamp(new Date()),
          updatedAt: formatApiUtcTimestamp(new Date()),
          name: editTournamentDraft.name.trim(),
          description: editTournamentDraft.description.trim() || null,
          bannerUrl: editTournamentDraft.bannerUrl.trim() || null,
          startDate: formatApiUtcTimestamp(editTournamentDraft.startDate),
          endDate: formatApiUtcTimestamp(editTournamentDraft.endDate),
          rosterLockAt: formatApiUtcTimestamp(editTournamentDraft.rosterLockAt),
          createdBy:
            editTournamentDraft.createdBy ||
            user?.login ||
            user?.name ||
            user?.email ||
            "SGA_ADMIN",
          format: editTournamentDraft.format.trim() || null,
          bracketType: editTournamentDraft.bracketType.trim() || null,
          maxTeams: Number(editTournamentDraft.maxTeams) || null,
          organizer: editTournamentDraft.organizer.trim() || null,
          rulebookUrl: editTournamentDraft.rulebookUrl.trim() || null,
          prizePool: Number(editTournamentDraft.prizePool) || null,
          region: editTournamentDraft.region.trim() || null,
          timezone: editTournamentDraft.timezone.trim() || null,
          patchVersion: editTournamentDraft.patchVersion.trim() || null,
          statusId: Number(editTournamentDraft.statusId) || null,
          gameId: Number(editTournamentDraft.gameId) || null,
        };

        const result = await apiTournaments.update(Number(editingEntity.data?.id), payload);
        if (result === false) {
          throw new Error("Erro ao atualizar campeonato");
        }

        toast.success("Campeonato atualizado!");
        queryClient.invalidateQueries({ queryKey: ["tournaments", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["tournaments"] });
        queryClient.invalidateQueries({ queryKey: ["matches", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        closeEditModal();
        return;
      }

      if (editingEntity.type === "team") {
        if (!editTeamDraft.name.trim() || !editTeamDraft.tag.trim()) {
          throw new Error("Nome e TAG são obrigatórios.");
        }
        if (!Number(editTeamMatchStatsDraft.matchId)) {
          throw new Error("Selecione uma partida para confirmar os stats do time.");
        }

        const payload = {
          id: Number(editingEntity.data?.id) || 0,
          createdAt:
            formatApiUtcTimestamp(editingEntity.data?.createdAt) ||
            formatApiUtcTimestamp(new Date()),
          updatedAt: formatApiUtcTimestamp(new Date()),
          name: editTeamDraft.name.trim(),
          description: editTeamDraft.description.trim() || null,
          tag: editTeamDraft.tag.trim() || null,
          logoUrl: editTeamDraft.logoUrl.trim() || null,
        };

        const result = await apiTeams.update(Number(editingEntity.data?.id), payload);
        if (result === false) {
          throw new Error("Erro ao atualizar time");
        }

        const teamId = Number(editingEntity.data?.id) || 0;
        const selectedMatchId = Number(editTeamMatchStatsDraft.matchId) || 0;
        const existingStatsRecord = getTeamMatchStatsRecord(teamId, selectedMatchId);
        const statsPayload = {
          id: Number(existingStatsRecord?.id) || Number(editTeamMatchStatsDraft.id) || 0,
          createdAt:
            formatApiUtcTimestamp(existingStatsRecord?.createdAt) ||
            formatApiUtcTimestamp(new Date()),
          updatedAt: formatApiUtcTimestamp(new Date()),
          teamId,
          matchId: selectedMatchId,
          roundsWon: Number(editTeamMatchStatsDraft.roundsWon) || 0,
          roundsLost: Number(editTeamMatchStatsDraft.roundsLost) || 0,
          plants: Number(editTeamMatchStatsDraft.plants) || 0,
          defuses: Number(editTeamMatchStatsDraft.defuses) || 0,
        };

        const statsResult = existingStatsRecord
          ? await apiTeamMatchStats.update(Number(existingStatsRecord.id), statsPayload)
          : await apiTeamMatchStats.create(statsPayload);
        if (statsResult === false) {
          throw new Error("Erro ao atualizar stats do time");
        }

        const existingTeamParticipants = teamParticipantsData.filter(
          (participant: any) => Number(participant.teamId) === teamId,
        );
        const draftById = new Map(
          editTeamParticipants
            .filter((participant) => participant.playerId && participant.roleId)
            .map((participant) => [Number(participant.id) || 0, participant] as const),
        );

        await Promise.all(
          editTeamParticipants.map(async (participant) => {
            if (!participant.playerId || !participant.roleId) return null;

            const currentParticipant = participant.id
              ? existingTeamParticipants.find(
                  (candidate: any) => Number(candidate.id) === Number(participant.id),
                )
              : null;

            const createdAt =
              formatApiUtcTimestamp(currentParticipant?.createdAt) ||
              formatApiUtcTimestamp(participant.joinedAt) ||
              formatApiUtcTimestamp(new Date());
            const updatedAt = formatApiUtcTimestamp(new Date());

            if (Number(participant.id) > 0) {
              const participantPayload = {
                id: Number(participant.id) || 0,
                createdAt,
                updatedAt,
                teamId,
                roleId: Number(participant.roleId) || 0,
                playerId: Number(participant.playerId) || 0,
                joinedAt:
                  currentParticipant?.joinedAt ||
                  participant.joinedAt ||
                  formatApiUtcTimestamp(new Date()),
                leftAt: null,
                isActive: Boolean(participant.isActive),
                isStarter: Boolean(participant.isStarter),
                isCaptain: Boolean(participant.isCaptain),
                isSubstitute: Boolean(participant.isSubstitute),
              };
              return apiTeamParticipants.update(Number(participant.id), participantPayload);
            }

            const participantPayload = {
              roleId: Number(participant.roleId) || 0,
              playerId: Number(participant.playerId) || 0,
              teamId,
              joinedAt:
                participant.joinedAt ||
                formatApiUtcTimestamp(new Date()),
              leftAt: null,
              isActive: Boolean(participant.isActive),
              isStarter: Boolean(participant.isStarter),
              isCaptain: Boolean(participant.isCaptain),
              isSubstitute: Boolean(participant.isSubstitute),
            };

            return apiTeamParticipants.create(participantPayload);
          }),
        );

        await Promise.all(
          existingTeamParticipants
            .filter((participant: any) => !draftById.has(Number(participant.id)))
            .map((participant: any) => apiTeamParticipants.deleteRecord(Number(participant.id))),
        );

        toast.success("Time e stats atualizados!");
        queryClient.invalidateQueries({ queryKey: ["teams", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["team-match-stats", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["team-match-stats"] });
        queryClient.invalidateQueries({ queryKey: ["team-participants", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["players", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["players"] });
        closeEditModal();
        return;
      }

      if (editingEntity.type === "player") {
        if (!editPlayerDraft.name.trim()) {
          throw new Error("O nome do player é obrigatório.");
        }

        const payload = {
          id: Number(editingEntity.data?.id) || 0,
          createdAt:
            formatApiUtcTimestamp(editingEntity.data?.createdAt) ||
            formatApiUtcTimestamp(new Date()),
          updatedAt: formatApiUtcTimestamp(new Date()),
          name: editPlayerDraft.name.trim(),
          avatarUrl: editPlayerDraft.avatarUrl?.trim() || "https://picsum.photos/seed/sga/200/200",
          userId: Number(editPlayerDraft.userId) || Number(editingEntity.data?.userId) || null,
          isProfilePublic: Boolean(editPlayerDraft.isProfilePublic),
        };

        const result = await apiPlayers.update(Number(editingEntity.data?.id), payload);
        if (result === false) {
          throw new Error("Erro ao atualizar player");
        }

        const playerId = Number(editingEntity.data?.id) || 0;
        const playerTeamId = getPlayerTeamId(playerId);
        const selectedMatchId =
          Number(editPlayerStatsMatchId) || Number(getLatestMatchForTeam(playerTeamId)?.id) || 0;
        if (selectedMatchId) {
          const existingStatsRecord = getLatestStatsRecordForPlayer(playerId);
          const statsPayload = {
            id: Number(existingStatsRecord?.id) || 0,
            createdAt:
              formatApiUtcTimestamp(existingStatsRecord?.createdAt) ||
              formatApiUtcTimestamp(new Date()),
            updatedAt: formatApiUtcTimestamp(new Date()),
            playerId,
            gameAccountId: Number(existingStatsRecord?.gameAccountId) || null,
            matchId: selectedMatchId,
            matchMapId: Number(existingStatsRecord?.matchMapId) || null,
            kills: Number(editPlayerDraft.kills) || 0,
            deaths: Number(editPlayerDraft.deaths) || 0,
            assists: Number(editPlayerDraft.assists) || 0,
            adr: Number(editPlayerDraft.adr) || 0,
            hsPercentage: Number(editPlayerDraft.hsPercentage) || 0,
            firstKills: Number(editPlayerDraft.firstKills) || 0,
            kast: Number(editPlayerDraft.kast) || 0,
            acs: Number(editPlayerDraft.acs) || 0,
            roleName: existingStatsRecord?.roleName || null,
            characterName: existingStatsRecord?.characterName || null,
            statsJson: existingStatsRecord?.statsJson || null,
          };

          const statsResult = existingStatsRecord
            ? await apiPlayerMatchStats.update(Number(existingStatsRecord.id), statsPayload)
            : await apiPlayerMatchStats.create(statsPayload);
          if (statsResult === false) {
            throw new Error("Erro ao atualizar stats do player");
          }
        }

        toast.success("Player atualizado!");
        if (selectedMatchId) {
          queryClient.invalidateQueries({ queryKey: ["player-match-stats", user?.id] });
          queryClient.invalidateQueries({ queryKey: ["player-match-stats"] });
        } else {
          toast.warning("Player salvo, mas não havia partida vinculada para gravar stats.");
        }
        queryClient.invalidateQueries({ queryKey: ["players", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["players"] });
        closeEditModal();
        return;
      }

      if (editingEntity.type === "match") {
        if (!editMatchDraft.tournamentId || !editMatchDraft.statusId || !editMatchDraft.gameId) {
          throw new Error("Preencha campeonato, stage, status e jogo.");
        }

        const resolvedStageId =
          Number(editMatchDraft.stageId) ||
          Number(editingEntity.data?.stageId) ||
          Number(
            stagesData.find(
              (stage: any) =>
                Number(stage.tournamentId) === Number(editMatchDraft.tournamentId || selectedTourney),
            )?.id,
          ) ||
          Number(stagesData[0]?.id) ||
          1;

        const payload = {
          id: Number(editingEntity.data?.id) || 0,
          createdAt:
            formatApiUtcTimestamp(editingEntity.data?.createdAt) ||
            formatApiUtcTimestamp(new Date()),
          updatedAt: formatApiUtcTimestamp(new Date()),
          stageId: resolvedStageId,
          tournamentId: Number(editMatchDraft.tournamentId) || Number(selectedTourney) || 0,
          statusId: Number(editMatchDraft.statusId) || 0,
          winnerTeamId: Number(editMatchDraft.winnerTeamId) || 0,
          gameId: Number(editMatchDraft.gameId) || 0,
          bestOf: Number(editMatchDraft.bestOf) || 1,
          bracketPosition: String(editingEntity.data?.bracketPosition || "") || null,
          startedAt: formatApiUtcTimestamp(editMatchDraft.startedAt),
          finishedAt: editMatchDraft.finishedAt ? formatApiUtcTimestamp(editMatchDraft.finishedAt) : null,
        };

        const result = await apiMatches.update(Number(editingEntity.data?.id), payload);
        if (result === false) {
          throw new Error("Erro ao atualizar partida");
        }

        toast.success("Partida atualizada!");
        queryClient.invalidateQueries({ queryKey: ["matches", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["bracket-matches", user?.id, selectedTourney] });
        closeEditModal();
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao confirmar edição");
    }
  };

  const getTeamById = (teamId: number) => {
    return teamsData.find((candidate: any) => Number(candidate.id) === Number(teamId));
  };

  const draggingTeam = useMemo(() => (draggingTeamId ? getTeamById(draggingTeamId) : null), [draggingTeamId, teamsData]);

  const getStatusIdByLabel = (fragments: string[]) => {
    const status = statusesData.find((candidate: any) => {
      const label = String(candidate?.name || candidate?.title || "").toLowerCase();
      return fragments.some((fragment) => label.includes(fragment));
    });

    return Number(status?.id) || 0;
  };

  const handlePlayerUserChange = (value: string) => {
    const userId = Number(value) || 0;
    const selected = usersData.find((candidate: any) => Number(candidate.id) === userId);

    setNewPlayer((current) => ({
      ...current,
      userId,
      name: selected?.login || current.name,
    }));
  };

  const updateTeamParticipant = (
    index: number,
    patch: Partial<(typeof teamParticipants)[number]>,
  ) => {
    setTeamParticipants((current) =>
      current.map((participant, participantIndex) =>
        participantIndex === index ? { ...participant, ...patch } : participant,
      ),
    );
  };

  const addTeamParticipant = () => {
    setTeamParticipants((current) => [...current, createEmptyTeamParticipant()]);
  };

  const removeTeamParticipant = (index: number) => {
    setTeamParticipants((current) => {
      if (current.length === 1) return [createEmptyTeamParticipant()];
      return current.filter((_, participantIndex) => participantIndex !== index);
    });
  };

  const loading = l1 || l2 || l3 || l4 || lStatus;

  const [selectedTourney, setSelectedTourney] = useState("");

  const { data: bmr } = useQuery({
    queryKey: ["bracket-matches", user?.id, selectedTourney],
    queryFn: () => ApiService.get(`api/Matches/GetMatchesByTournamentId/${selectedTourney}`),
    enabled: !!user && !!selectedTourney,
  });

  const selectedTournament = useMemo(
    () => tournamentsData.find((candidate: any) => Number(candidate.id) === Number(selectedTourney)),
    [selectedTourney, tournamentsData],
  );

  const selectedTournamentBracketType = String(
    selectedTournament?.bracketType || selectedTournament?.format || "",
  ).toLowerCase();

  const isDoubleEliminationTournament =
    selectedTournamentBracketType.includes("double") ||
    selectedTournamentBracketType.includes("lower") ||
    selectedTournamentBracketType.includes("dupla");

  const bracketMatchesByTournament = useMemo(() => {
    return parseApiResponse(bmr).map((match: any) => {
      const teams = Array.isArray(match?.teams) ? match.teams : match?.teams?.$values || [];
      const teamA = teams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "A");
      const teamB = teams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "B");
      const winnerTeam = teams.find((candidate: any) => candidate?.isWinner);

      return {
        ...match,
        matchTeamAId: Number(teamA?.id) || 0,
        matchTeamBId: Number(teamB?.id) || 0,
        teamAId: Number(teamA?.teamId) || 0,
        teamBId: Number(teamB?.teamId) || 0,
        teamA: teamA?.team || null,
        teamB: teamB?.team || null,
        scoreA: teamA?.score ?? null,
        scoreB: teamB?.score ?? null,
        winnerTeamId: Number(match?.winnerTeamId) || Number(winnerTeam?.teamId) || 0,
      };
    });
  }, [bmr]);

  const bracketMatches = useMemo(
    () => bracketMatchesByTournament.filter((match: any) => match.bracketPosition),
    [bracketMatchesByTournament],
  );

  const bracketMatchMap = useMemo(
    () => new Map(bracketMatches.map((match: any) => [String(match.bracketPosition), match])),
    [bracketMatches],
  );

  const effectiveBracketMatchMap = useMemo(() => {
    const nextMap = new Map(bracketMatchMap);

    Object.entries(optimisticBracketSlots).forEach(([position, patch]) => {
      const currentMatch = (nextMap.get(position) as any) || {
        bracketPosition: position,
        tournamentId: Number(selectedTourney) || 0,
      };
      nextMap.set(position, { ...currentMatch, ...patch });
    });

    return nextMap;
  }, [bracketMatchMap, optimisticBracketSlots, selectedTourney]);

  const assignedBracketTeamIds = useMemo(
    () =>
      new Set(
        Array.from(effectiveBracketMatchMap.values())
          .flatMap((match: any) => [Number(match.teamAId), Number(match.teamBId)])
          .filter(Boolean),
      ),
    [effectiveBracketMatchMap],
  );

  const bracketTeams = useMemo(() => {
    const selectedGameId = Number(selectedTournament?.gameId) || 0;

    return teamsData.filter((team: any) => {
      if (!selectedGameId) return true;
      if (!team?.gameId) return true;
      return Number(team.gameId) === selectedGameId;
    });
  }, [selectedTournament?.gameId, teamsData]);

  const scheduledStatusId = useMemo(
    () => getStatusIdByLabel(["agend", "abert", "penden"]) || Number(statusesData[0]?.id) || 0,
    [statusesData],
  );

  const activeStatusId = useMemo(
    () =>
      getStatusIdByLabel(["vivo", "live", "ativo", "andam", "progres", "curso", "abert"]) ||
      scheduledStatusId,
    [scheduledStatusId, statusesData],
  );

  const finishedStatusId = useMemo(
    () => getStatusIdByLabel(["encerr", "conclu", "finaliz"]) || scheduledStatusId,
    [scheduledStatusId, statusesData],
  );

  const getBracketPhaseLabel = (position: string) => {
    const phaseKey = position.split("-")[0];
    return BRACKET_PHASE_LABELS[phaseKey] || "Fase Eliminatória";
  };

  const getStageIdForBracketPosition = (position: string) => {
    const phaseKey = position.split("-")[0];
    const hints = BRACKET_STAGE_HINTS[phaseKey] || [];
    const tournamentStages = stagesData.filter((candidate: any) => {
      const candidateTournamentId = Number(candidate?.tournamentId) || 0;
      return !candidateTournamentId || candidateTournamentId === Number(selectedTourney);
    });

    const stagePool = tournamentStages.length > 0 ? tournamentStages : stagesData;
    const stage = stagePool.find((candidate: any) => {
      const label = String(candidate?.name || candidate?.title || "").toLowerCase();
      return hints.some((hint) => label.includes(hint));
    });

    return Number(stage?.id) || 0;
  };

  const getMatchTeamByMatchAndTeamId = async (matchId: number, teamId: number) => {
    if (!matchId || !teamId) return null;

    try {
      const response = await ApiService.get(
        `api/MatchTeams/GetTeamsByMatchAndTeamId?matchId=${matchId}&teamId=${teamId}`,
      );
      const entity = extractEntity(response);

      if (entity) return entity;

      const list = parseApiResponse(response);
      return list[0] || null;
    } catch {
      return null;
    }
  };

  const saveBracketMatch = async (
    position: string,
    patch: Record<string, any>,
    successMessage?: string,
  ) => {
    const currentMatch = effectiveBracketMatchMap.get(position) as any;
    const { teamA, teamB, tournament, stage, status, game, teams, winnerTeam, ...existingMatch } =
      currentMatch || {};
    const resolvedExistingStageId = Number(existingMatch?.stageId) || Number(stage?.id) || 0;
    const existingTeams = Array.isArray(teams) ? teams : [];
    const existingTeamAEntry =
      existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "A") || null;
    const existingTeamBEntry =
      existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "B") || null;

    const resolvedStartedAt =
      patch.startedAt === undefined
        ? existingMatch?.startedAt || formatApiUtcTimestamp(new Date())
        : patch.startedAt;

    const resolvedFinishedAt =
      patch.finishedAt === undefined ? existingMatch?.finishedAt || null : patch.finishedAt;

    const payload = {
      ...existingMatch,
      ...patch,
      bracketPosition: position,
      tournamentId: Number(existingMatch?.tournamentId) || Number(selectedTourney) || 0,
      statusId: Number(patch.statusId) || Number(existingMatch?.statusId) || scheduledStatusId,
      gameId:
        Number(patch.gameId) ||
        Number(existingMatch?.gameId) ||
        Number(selectedTournament?.gameId) ||
        Number(gamesData[0]?.id) ||
        0,
      bestOf: Number(patch.bestOf) || Number(existingMatch?.bestOf) || 1,
      startedAt: formatApiUtcTimestamp(resolvedStartedAt),
      finishedAt: resolvedFinishedAt ? formatApiUtcTimestamp(resolvedFinishedAt) : null,
      winnerTeamId:
        patch.winnerTeamId === undefined
          ? Number(existingMatch?.winnerTeamId) || 0
          : Number(patch.winnerTeamId) || 0,
      stageId:
        Number(patch.stageId) ||
        resolvedExistingStageId ||
        getStageIdForBracketPosition(position) ||
        0,
    };

    if (payload.stageId === 0) {
      let fallbackStage = stagesData.find((s: any) => Number(s.tournamentId) === Number(selectedTourney));
      if (!fallbackStage && stagesData.length > 0) {
        fallbackStage = stagesData[0];
      }
      if (fallbackStage) {
        payload.stageId = Number(fallbackStage.id);
      }
    }

    const resolvedTeamAId = Object.prototype.hasOwnProperty.call(patch, "teamAId")
      ? Number(patch.teamAId) || 0
      : Number(existingMatch?.teamAId) || 0;
    const resolvedTeamBId = Object.prototype.hasOwnProperty.call(patch, "teamBId")
      ? Number(patch.teamBId) || 0
      : Number(existingMatch?.teamBId) || 0;

    const resolvedWinnerTeamId = Number(payload.winnerTeamId) || 0;

    const teamAScore =
      patch.scoreA ??
      existingMatch?.scoreA ??
      existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "A")?.score ??
      null;
    const teamBScore =
      patch.scoreB ??
      existingMatch?.scoreB ??
      existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "B")?.score ??
      null;

    const matchTeamsPayload = [
      resolvedTeamAId
        ? {
            id: Number(existingMatch?.matchTeamAId) || Number(existingTeamAEntry?.id) || 0,
            createdAt: existingTeamAEntry?.createdAt || formatApiUtcTimestamp(new Date()),
            updatedAt: formatApiUtcTimestamp(new Date()),
            teamId: resolvedTeamAId,
            side: "A",
            score: teamAScore ?? 0,
            isWinner: resolvedWinnerTeamId === resolvedTeamAId,
          }
        : null,
      resolvedTeamBId
        ? {
            id: Number(existingMatch?.matchTeamBId) || Number(existingTeamBEntry?.id) || 0,
            createdAt: existingTeamBEntry?.createdAt || formatApiUtcTimestamp(new Date()),
            updatedAt: formatApiUtcTimestamp(new Date()),
            teamId: resolvedTeamBId,
            side: "B",
            score: teamBScore ?? 0,
            isWinner: resolvedWinnerTeamId === resolvedTeamBId,
          }
        : null,
    ].filter(Boolean);

    payload.teamAId = resolvedTeamAId || null;
    payload.teamBId = resolvedTeamBId || null;
    payload.scoreA = teamAScore;
    payload.scoreB = teamBScore;
    delete payload.teams;

    if (!payload.tournamentId || !payload.statusId || !payload.gameId) {
      throw new Error("Cadastre o torneio, status e jogo antes de montar o chaveamento.");
    }

    const matchResponse = currentMatch?.id
      ? await apiMatches.update(currentMatch.id, payload)
      : await apiMatches.create(payload);

    const persistedMatchId =
      Number(currentMatch?.id) || Number(extractEntity(matchResponse)?.id) || 0;

    if (!persistedMatchId) {
      throw new Error("Não foi possível identificar a partida para atualizar os times.");
    }

    const matchTeamsToDelete = [
      !resolvedTeamAId && existingTeamAEntry?.id ? Number(existingTeamAEntry.id) : 0,
      !resolvedTeamBId && existingTeamBEntry?.id ? Number(existingTeamBEntry.id) : 0,
    ].filter(Boolean);

    await Promise.all(
      matchTeamsPayload.map(async (entry: any) => {
        const persistedMatchTeam = entry.id
          ? { id: entry.id, createdAt: entry.createdAt }
          : await getMatchTeamByMatchAndTeamId(persistedMatchId, entry.teamId);

        const matchTeamPayload = {
          id: Number(persistedMatchTeam?.id) || 0,
          createdAt: persistedMatchTeam?.createdAt || entry.createdAt,
          updatedAt: entry.updatedAt,
          matchId: persistedMatchId,
          teamId: entry.teamId,
          side: entry.side,
          score: entry.score,
          isWinner: entry.isWinner,
        };

        return Number(persistedMatchTeam?.id) > 0
          ? apiMatchTeams.update(Number(persistedMatchTeam.id), matchTeamPayload)
          : apiMatchTeams.create(matchTeamPayload);
      }),
    );

    await Promise.all(
      matchTeamsToDelete.map((matchTeamId) => apiMatchTeams.deleteRecord(matchTeamId)),
    );

    queryClient.invalidateQueries({ queryKey: ["matches", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["matches"] });
    queryClient.invalidateQueries({ queryKey: ["match-teams", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["match-teams"] });
    queryClient.invalidateQueries({ queryKey: ["matchteams"] });
    queryClient.invalidateQueries({ queryKey: ["bracket-matches", user?.id, selectedTourney] });
    queryClient.invalidateQueries({ queryKey: ["teams", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["teams"] });
    toast.success(successMessage || `Slot ${position} atualizado`);
  };

  const handleBracketDrop = async (
    position: string,
    teamField: "teamAId" | "teamBId",
    teamId: number,
  ) => {
    if (!teamId) return;

    const currentMatch = effectiveBracketMatchMap.get(position) as any;
    const matchIsLocked = Number(currentMatch?.winnerTeamId) > 0;

    if (matchIsLocked) {
      toast.error("Essa partida já foi decidida e não pode receber novos times.");
      return;
    }

    const teamAlreadyInCurrentMatch =
      Number(currentMatch?.teamAId) === teamId || Number(currentMatch?.teamBId) === teamId;
    const teamAlreadyAssignedElsewhere =
      assignedBracketTeamIds.has(teamId) && !teamAlreadyInCurrentMatch;

    if (teamAlreadyAssignedElsewhere) {
      toast.error("Este time já está em outro slot do chaveamento.");
      return;
    }

    const previousPatch = optimisticBracketSlots[position];

    setOptimisticBracketSlots((current) => ({
      ...current,
      [position]: {
        ...current[position],
        [teamField]: teamId,
        winnerTeamId: 0,
        finishedAt: null,
      },
    }));

    try {
      await saveBracketMatch(
        position,
        { [teamField]: teamId, winnerTeamId: 0, finishedAt: null },
        `Time alocado em ${position}`,
      );
    } catch (error: any) {
      setOptimisticBracketSlots((current) => {
        if (previousPatch) {
          return { ...current, [position]: previousPatch };
        }

        const next = { ...current };
        delete next[position];
        return next;
      });
      toast.error(error?.message || "Erro ao posicionar time no slot");
    }
  };

  const handleBracketRemove = async (position: string, teamField: "teamAId" | "teamBId") => {
    const currentMatch = effectiveBracketMatchMap.get(position) as any;
    const matchIsLocked = Number(currentMatch?.winnerTeamId) > 0;

    if (matchIsLocked) {
      toast.error("Essa partida já foi decidida e não pode ter times removidos.");
      return;
    }

    try {
      setOptimisticBracketSlots((current) => ({
        ...current,
        [position]: {
          ...current[position],
          [teamField]: null,
          winnerTeamId: 0,
          finishedAt: null,
          statusId: scheduledStatusId,
        },
      }));

      await saveBracketMatch(
        position,
        {
          [teamField]: null,
          winnerTeamId: 0,
          finishedAt: null,
          statusId: scheduledStatusId,
        },
        `Time removido do ${position}`,
      );
    } catch (error: any) {
      toast.error(error?.message || "Erro ao remover time do slot");
    }
  };

  const handleMatchWinner = async (position: string, teamField: "teamAId" | "teamBId") => {
    const currentMatch = effectiveBracketMatchMap.get(position) as any;
    const winnerTeamId = Number(currentMatch?.[teamField]) || 0;
    const loserTeamField = teamField === "teamAId" ? "teamBId" : "teamAId";
    const loserTeamId = Number(currentMatch?.[loserTeamField]) || 0;

    if (Number(currentMatch?.winnerTeamId) > 0) {
      toast.error("Essa partida já possui vencedor definido.");
      return;
    }

    if (!currentMatch?.id || !winnerTeamId) {
      toast.error("Preencha os dois slots antes de definir o vencedor.");
      return;
    }

    try {
      const nextSlot = BRACKET_PROGRESS_MAP[position];
      const loserSlot = isDoubleEliminationTournament
        ? BRACKET_LOSER_PROGRESS_MAP[position]
        : undefined;

      await saveBracketMatch(
        position,
        {
          winnerTeamId,
          statusId: finishedStatusId,
          finishedAt: formatApiUtcTimestamp(new Date()),
        },
        `Vencedor definido em ${position}`,
      );

      if (loserSlot && loserTeamId) {
        setOptimisticBracketSlots((current) => ({
          ...current,
          [loserSlot.nextPosition]: {
            ...current[loserSlot.nextPosition],
            [loserSlot.teamField]: loserTeamId,
            winnerTeamId: 0,
            bracketPosition: loserSlot.nextPosition,
            tournamentId: Number(selectedTourney) || 0,
            statusId: activeStatusId,
            gameId: Number(selectedTournament?.gameId) || Number(gamesData[0]?.id) || 0,
            bestOf: Number(currentMatch?.bestOf) || 1,
            startedAt:
              current[loserSlot.nextPosition]?.startedAt || formatApiUtcTimestamp(new Date()),
            finishedAt: null,
            stageId:
              current[loserSlot.nextPosition]?.stageId ||
              getStageIdForBracketPosition(loserSlot.nextPosition),
          },
        }));

        await saveBracketMatch(
          loserSlot.nextPosition,
          {
            [loserSlot.teamField]: loserTeamId,
            winnerTeamId: 0,
            statusId: activeStatusId,
            bestOf: Number(currentMatch?.bestOf) || 1,
            startedAt: formatApiUtcTimestamp(new Date()),
            finishedAt: null,
            stageId: getStageIdForBracketPosition(loserSlot.nextPosition),
          },
          `${getTeamLabel(loserTeamId)} caiu para ${loserSlot.nextPosition}`,
        );
      }

      if (nextSlot) {
        setOptimisticBracketSlots((current) => ({
          ...current,
          [nextSlot.nextPosition]: {
            ...current[nextSlot.nextPosition],
            [nextSlot.teamField]: winnerTeamId,
            winnerTeamId: 0,
            bracketPosition: nextSlot.nextPosition,
            tournamentId: Number(selectedTourney) || 0,
            statusId: activeStatusId,
            gameId: Number(selectedTournament?.gameId) || Number(gamesData[0]?.id) || 0,
            bestOf: Number(currentMatch?.bestOf) || 1,
            startedAt:
              current[nextSlot.nextPosition]?.startedAt || formatApiUtcTimestamp(new Date()),
            finishedAt: null,
            stageId:
              current[nextSlot.nextPosition]?.stageId ||
              getStageIdForBracketPosition(nextSlot.nextPosition),
          },
        }));

        await saveBracketMatch(
          nextSlot.nextPosition,
          {
            [nextSlot.teamField]: winnerTeamId,
            winnerTeamId: 0,
            statusId: activeStatusId,
            bestOf: Number(currentMatch?.bestOf) || 1,
            startedAt: formatApiUtcTimestamp(new Date()),
            finishedAt: null,
            stageId: getStageIdForBracketPosition(nextSlot.nextPosition),
          },
          `${getTeamLabel(winnerTeamId)} avançou para ${nextSlot.nextPosition}`,
        );
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao definir vencedor");
    }
  };

  useEffect(() => {
    if (tournamentsData.length > 0 && !selectedTourney) {
      setSelectedTourney(tournamentsData[0].id);
    }
  }, [tournamentsData, selectedTourney]);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedTourney) return;

    setIsBracketLayoutHydrated(false);
    try {
      const raw = window.localStorage.getItem(BRACKET_STORAGE_KEY);
      const layouts = raw ? JSON.parse(raw) : {};
      setOptimisticBracketSlots(layouts[String(selectedTourney)] || {});
    } catch {
      setOptimisticBracketSlots({});
    } finally {
      setIsBracketLayoutHydrated(true);
    }
  }, [selectedTourney]);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedTourney || !isBracketLayoutHydrated) return;

    try {
      const raw = window.localStorage.getItem(BRACKET_STORAGE_KEY);
      const layouts = raw ? JSON.parse(raw) : {};
      layouts[String(selectedTourney)] = optimisticBracketSlots;
      window.localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(layouts));
    } catch {
      // Ignora falha de persistência local.
    }
  }, [isBracketLayoutHydrated, optimisticBracketSlots, selectedTourney]);

  useEffect(() => {
    setOptimisticBracketSlots((current) => {
      const nextEntries = Object.entries(current).filter(([position, patch]) => {
        const persistedMatch = bracketMatchMap.get(position) as any;
        if (!persistedMatch) return true;
        return !Object.entries(patch).every(([key, value]) => persistedMatch?.[key] === value);
      });

      return nextEntries.length === Object.keys(current).length
        ? current
        : Object.fromEntries(nextEntries);
    });
  }, [bracketMatchMap]);

  useEffect(() => {
    if (!newTourney.gameId && gamesData.length > 0) {
      setNewTourney((current) => ({ ...current, gameId: Number(gamesData[0].id) || 0 }));
    }
  }, [gamesData, newTourney.gameId]);

  useEffect(() => {
    if (!newTourney.statusId && statusesData.length > 0) {
      setNewTourney((current) => ({ ...current, statusId: Number(statusesData[0].id) || 0 }));
    }
  }, [newTourney.statusId, statusesData]);

  useEffect(() => {
    if (!teamGameId && gamesData.length > 0) {
      setTeamGameId(Number(gamesData[0].id) || 0);
    }
  }, [gamesData, teamGameId]);

  useEffect(() => {
    setTeamParticipants((current) =>
      current.map((participant) => {
        const roleStillAvailable = availableRoles.some((role: any) => Number(role.id) === Number(participant.roleId));
        return roleStillAvailable ? participant : { ...participant, roleId: 0 };
      }),
    );
  }, [availableRoles]);

  const fakeAct = (label: string) => () => toast.success(`${label} (mock)`);

  const requestDelete = (id: string, entity: string) => {
    setDeleteTarget({ id, entity });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const controllers: Record<string, any> = {
      Tournaments: apiTournaments,
      Players: apiPlayers,
      Teams: apiTeams,
      Matches: apiMatches,
      Highlights: apiHighlights,
      Gallery: apiGallery,
    };

    const { id, entity } = deleteTarget;
    const ctrl = controllers[entity] || apiMatches;

    const res = await ctrl.deleteRecord(id);
    setDeleteTarget(null);

    if (res !== false) {
      const queryKey = entity.toLowerCase();
      queryClient.invalidateQueries({ queryKey: [queryKey, user?.id] });
      queryClient.invalidateQueries({ queryKey: [queryKey] });

      if (entity === "Teams" || entity === "Matches") {
        queryClient.invalidateQueries({ queryKey: ["teams", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["teams"] });
      }

      toast.success("Removido com sucesso!");
    }
  };

  const PAGE = 8;

  return {
    user,
    isAdmin,
    token,
    tab,
    setTab,
    q,
    setQ,
    page,
    setPage,
    isCreatingTourney,
    setIsCreatingTourney,
    newTourney,
    setNewTourney,
    isCreatingTeam,
    setIsCreatingTeam,
    newTeam,
    setNewTeam,
    teamGameId,
    setTeamGameId,
    teamParticipants,
    updateTeamParticipant,
    addTeamParticipant,
    removeTeamParticipant,
    viewingTeamId,
    setViewingTeamId,
    editingTeamId,
    editTeamRosterHydrated,
    editingEntity,
    setEditingEntity,
    editTournamentDraft,
    setEditTournamentDraft,
    editTeamDraft,
    setEditTeamDraft,
    editTeamGameId,
    setEditTeamGameId,
    editTeamMatchStatsDraft,
    editTeamParticipants,
    editPlayerDraft,
    setEditPlayerDraft,
    editPlayerStatsMatchId,
    setEditPlayerStatsMatchId,
    editMatchDraft,
    setEditMatchDraft,
    deleteTarget,
    setDeleteTarget,
    isCreatingPlayer,
    setIsCreatingPlayer,
    newPlayer,
    setNewPlayer,
    draggingTeamId,
    setDraggingTeamId,
    previewSlotKey,
    setPreviewSlotKey,
    optimisticBracketSlots,
    setOptimisticBracketSlots,
    isBracketLayoutHydrated,
    apiTournaments,
    apiPlayers,
    apiTeams,
    apiRoles,
    apiTeamParticipants,
    apiPlayerMatchStats,
    apiTeamMatchStats,
    apiUsers,
    apiGameAccounts,
    apiGames,
    apiStages,
    apiStatus,
    apiMatches,
    apiMatchTeams,
    apiMatchLineups,
    apiMatchLineupPlayers,
    apiHighlights,
    apiGallery,
    tournamentsData,
    playersData,
    teamsData,
    rolesData,
    teamParticipantsData,
    playerMatchStatsData,
    teamMatchStatsData,
    usersData,
    gameAccountsData,
    gamesData,
    stagesData,
    statusesData,
    matchesData,
    matchTeamsData,
    matchLineupsData,
    matchLineupPlayersData,
    highlightsData,
    galleryData,
    linkedUserIds,
    selectedUser,
    availableRoles,
    editAvailableRoles,
    linkedPlayerIdsInDraft,
    linkedPlayerIdsInEditDraft,
    viewingTeam,
    viewingTeamParticipants,
    getUserLabel,
    getTournamentStatusLabel,
    getGameLabel,
    getTournamentLabel,
    getStageLabel,
    getTeamLabel,
    playerStatsById,
    getPlayerTeam,
    getPlayerTeamId,
    getLatestMatchForTeam,
    getLatestStatsRecordForPlayer,
    getTeamMatchStatsRecord,
    getLatestTeamMatchStatsRecord,
    editingPlayerTeamId,
    playerStatsMatchOptions,
    teamStatsMatchOptions,
    resolveMatchTeamId,
    openTournamentEdit,
    openTeamEdit,
    openPlayerEdit,
    openMatchEdit,
    closeEditModal,
    updateEditTeamMatchStatsMatch,
    updateEditTeamParticipant,
    addEditTeamParticipant,
    removeEditTeamParticipant,
    saveEdit,
    getTeamById,
    draggingTeam,
    getStatusIdByLabel,
    handlePlayerUserChange,
    handleBracketDrop,
    handleBracketRemove,
    handleMatchWinner,
    loading,
    selectedTourney,
    setSelectedTourney,
    selectedTournament,
    selectedTournamentBracketType,
    isDoubleEliminationTournament,
    bracketMatchesByTournament,
    bracketMatches,
    bracketMatchMap,
    effectiveBracketMatchMap,
    assignedBracketTeamIds,
    bracketTeams,
    scheduledStatusId,
    activeStatusId,
    finishedStatusId,
    getBracketPhaseLabel,
    getStageIdForBracketPosition,
    getMatchTeamByMatchAndTeamId,
    PAGE,
    fakeAct,
    requestDelete,
    confirmDelete,
    filt,
    paginate,
  };
}
