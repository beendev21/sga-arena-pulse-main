import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { StatusBadge } from "@/components/sga/StatusBadge";
import { Trophy, Users, Swords, Activity, Image as Img, Film, Plus, Search, Upload, Trash2, Pencil, ShieldAlert, ChevronRight, Crown, Save, Eye } from "lucide-react";
import { StatsCard } from "@/components/sga/StatsCard";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import useApiController from "../API/controler";
import ApiService from "../API/service";
import { motion } from "framer-motion";
import { formatDateBR } from "@/lib/dateUtils";

/**
 * Definição da rota '/admin' utilizando TanStack Router.
 * O meta-dado 'head' garante SEO e títulos dinâmicos.
 */
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — SGA" }] }),
  component: Admin,
});

/**
 * Configuração estática das abas de navegação interna.
 * O uso de 'as const' garante tipagem forte para as chaves (tabs).
 */
const tabs = [
  { k: "campeonatos", label: "Campeonatos" },
  { k: "times", label: "Times" },
  { k: "jogadores", label: "Jogadores" },
  { k: "partidas", label: "Partidas" },
  { k: "chaveamentos", label: "Chaveamentos" },
  { k: "highlights", label: "Highlights" },
  { k: "galeria", label: "Galeria" },
] as const;

const createEmptyPlayer = () => ({
  name: "",
  avatarUrl: "https://picsum.photos/seed/sga/200/200",
  userId: 0,
  isProfilePublic: true,
});

const createEmptyTeam = () => ({
  name: "",
  description: "",
  tag: "",
  logoUrl: "",
});

const createEmptyTeamParticipant = () => ({
  roleId: 0,
  playerId: 0,
  isActive: true,
  isStarter: true,
  isCaptain: false,
  isSubstitute: false,
});

const createEmptyTournament = () => ({
  name: "",
  description: "",
  bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
  startDate: "",
  endDate: "",
  createdBy: "SGA_ADMIN",
  format: "Eliminação Simples",
  bracketType: "Single Elimination",
  maxTeams: 0,
  organizer: "Santos Games Arena",
  rulebookUrl: "",
  prizePool: 0,
  region: "Brasil",
  timezone: "UTC-3",
  patchVersion: "Current",
  rosterLockAt: "",
  statusId: 0,
  gameId: 0,
});

const createEmptyMatch = () => ({
  stageId: 0,
  tournamentId: 0,
  statusId: 0,
  winnerTeamId: 0,
  gameId: 0,
  bestOf: 1,
  startedAt: "",
  finishedAt: "",
});

const BRACKET_ROUNDS = [
  {
    key: "quarters",
    title: "01. Quartas de Final",
    accentClass: "text-primary",
    lineClass: "bg-primary/40",
    cardClass: "bg-white/5 border-white/10 hover:border-primary/40",
    positions: ["QF-1", "QF-2", "QF-3", "QF-4"],
  },
  {
    key: "semis",
    title: "02. Semifinais",
    accentClass: "text-neon",
    lineClass: "bg-neon/40",
    cardClass: "bg-neon/5 border-neon/10 hover:border-neon/40",
    positions: ["SF-1", "SF-2"],
  },
  {
    key: "final",
    title: "03. Final",
    accentClass: "text-warning",
    lineClass: "bg-warning/40",
    cardClass: "bg-warning/5 border-warning/10 hover:border-warning/40",
    positions: ["F-1"],
  },
] as const;

const BRACKET_PROGRESS_MAP: Record<string, { nextPosition: string; teamField: "teamAId" | "teamBId" }> = {
  "QF-1": { nextPosition: "SF-1", teamField: "teamAId" },
  "QF-2": { nextPosition: "SF-1", teamField: "teamBId" },
  "QF-3": { nextPosition: "SF-2", teamField: "teamAId" },
  "QF-4": { nextPosition: "SF-2", teamField: "teamBId" },
  "SF-1": { nextPosition: "F-1", teamField: "teamAId" },
  "SF-2": { nextPosition: "F-1", teamField: "teamBId" },
};

const BRACKET_PHASE_LABELS: Record<string, string> = {
  QF: "Quartas de Final",
  SF: "Semifinal",
  F: "Final",
};

const BRACKET_STAGE_HINTS: Record<string, string[]> = {
  QF: ["quart", "quarter"],
  SF: ["semi", "semi-final", "semifinal"],
  F: ["final"],
};

const BRACKET_STORAGE_KEY = "sga-admin-bracket-layouts";

const formatApiTimestamp = (value?: string | Date | null) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const formatApiUtcTimestamp = (value?: string | Date | null) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
};

function Admin() {
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);
  const nav = useNavigate();

  console.log("[SGA DEBUG] Usuário atual:", user?.email, "| Cargo:", user?.role);

  // Gerenciamento de estado local para UI e filtros.
  // Em produção, 'page' e 'q' poderiam ser movidos para a URL (Search Params)
  // para permitir que o usuário compartilhe links de busca.
  const [tab, setTab] = useState<(typeof tabs)[number]["k"]>("campeonatos");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [isCreatingTourney, setIsCreatingTourney] = useState(false);
  const [newTourney, setNewTourney] = useState(createEmptyTournament());

  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeam, setNewTeam] = useState(createEmptyTeam());
  const [teamGameId, setTeamGameId] = useState(0);
  const [teamParticipants, setTeamParticipants] = useState([createEmptyTeamParticipant()]);
  const [viewingTeamId, setViewingTeamId] = useState<number | null>(null);

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
  const apiUsers = useApiController("User");
  const apiGames = useApiController("Games");
  const apiStages = useApiController("Stages");
  const apiStatus = useApiController("Status");
  const apiMatches = useApiController("Matches");
  const apiMatchTeams = useApiController("Matchteams");
  const apiHighlights = useApiController("Highlights");
  const apiGallery = useApiController("Gallery");

  const queryClient = useQueryClient();

  // Sincronização Global via TanStack Query
  const { data: tr, isLoading: l1 } = useQuery({ queryKey: ["tournaments", token], queryFn: () => apiTournaments.getAll() });
  const { data: pr, isLoading: l2 } = useQuery({ queryKey: ["players", token], queryFn: () => apiPlayers.getAll(), enabled: !!token });
  const { data: ter, isLoading: l3 } = useQuery({ queryKey: ["teams", token], queryFn: () => apiTeams.getAll() });
  const { data: rr } = useQuery({ queryKey: ["roles", token], queryFn: () => apiRoles.getAll(), enabled: !!token });
  const { data: tpr } = useQuery({ queryKey: ["team-participants", token], queryFn: () => apiTeamParticipants.getAll(), enabled: !!token });
  const { data: ur } = useQuery({ queryKey: ["users", token], queryFn: () => apiUsers.getAll(), enabled: !!token });
  const { data: gar } = useQuery({ queryKey: ["games", token], queryFn: () => apiGames.getAll(), enabled: !!token });
  const { data: str } = useQuery({ queryKey: ["stages", token], queryFn: () => apiStages.getAll(), enabled: !!token });
  const { data: sr } = useQuery({ queryKey: ["statuses", token], queryFn: () => apiStatus.getAll(), enabled: !!token });
  const { data: mr, isLoading: l4 } = useQuery({ queryKey: ["matches", token], queryFn: () => apiMatches.getAll() });
  const { data: hr } = useQuery({ queryKey: ["highlights", token], queryFn: () => apiHighlights.getAll() });
  const { data: gr } = useQuery({ queryKey: ["gallery", token], queryFn: () => apiGallery.getAll() });

  const parse = (r: any) => {
    if (!r) return [];
    if (Array.isArray(r)) return r;

    const list = r?.result;
    if (Array.isArray(list)) return list;

    return list?.$values || [];
  };

  const tournamentsData = useMemo(() => parse(tr), [tr]);
  const playersData = useMemo(() => parse(pr), [pr]);
  const teamsData = useMemo(() => parse(ter), [ter]);
  const rolesData = useMemo(() => parse(rr), [rr]);
  const teamParticipantsData = useMemo(() => parse(tpr), [tpr]);
  const usersData = useMemo(() => parse(ur), [ur]);
  const gamesData = useMemo(() => parse(gar), [gar]);
  const stagesData = useMemo(() => parse(str), [str]);
  const statusesData = useMemo(() => parse(sr), [sr]);
  const matchesData = useMemo(() => parse(mr), [mr]);
  const highlightsData = useMemo(() => parse(hr), [hr]);
  const galleryData = useMemo(() => parse(gr), [gr]);

  const linkedUserIds = useMemo(
    () => new Set(playersData.map((player: any) => Number(player.userId)).filter(Boolean)),
    [playersData]
  );

  const selectedUser = useMemo(
    () => usersData.find((candidate: any) => Number(candidate.id) === Number(newPlayer.userId)),
    [newPlayer.userId, usersData]
  );

  const availableRoles = useMemo(
    () => rolesData.filter((role: any) => !teamGameId || Number(role.gameId) === Number(teamGameId)),
    [rolesData, teamGameId]
  );

  const linkedPlayerIdsInDraft = useMemo(
    () => new Set(teamParticipants.map((participant) => Number(participant.playerId)).filter(Boolean)),
    [teamParticipants]
  );

  const viewingTeam = useMemo(
    () => teamsData.find((team: any) => Number(team.id) === Number(viewingTeamId)),
    [teamsData, viewingTeamId]
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

  const getTeamById = (teamId: number) => {
    return teamsData.find((candidate: any) => Number(candidate.id) === Number(teamId));
  };

  const draggingTeam = useMemo(
    () => (draggingTeamId ? getTeamById(draggingTeamId) : null),
    [draggingTeamId, teamsData]
  );

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

  const updateTeamParticipant = (index: number, patch: Partial<(typeof teamParticipants)[number]>) => {
    setTeamParticipants((current) =>
      current.map((participant, participantIndex) =>
        participantIndex === index ? { ...participant, ...patch } : participant
      )
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

  const extractEntity = (response: any) => {
    if (!response) return null;
    if (response.result && !Array.isArray(response.result)) return response.result;
    if (response.data && !Array.isArray(response.data)) return response.data;
    if (!Array.isArray(response) && response.id) return response;
    return null;
  };

  const loading = l1 || l2 || l3 || l4;

  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [newMatch, setNewMatch] = useState(createEmptyMatch());

  const [selectedTourney, setSelectedTourney] = useState("");

  const { data: bmr } = useQuery({
    queryKey: ["bracket-matches", token, selectedTourney],
    queryFn: () => ApiService.get(`api/Matches/GetMatchesByTournamentId/${selectedTourney}`),
    enabled: !!token && !!selectedTourney,
  });

  const availableStages = useMemo(
    () => stagesData.filter((stage: any) => !newMatch.tournamentId || Number(stage.tournamentId) === Number(newMatch.tournamentId)),
    [newMatch.tournamentId, stagesData]
  );

  const selectedTournament = useMemo(
    () => tournamentsData.find((candidate: any) => Number(candidate.id) === Number(selectedTourney)),
    [selectedTourney, tournamentsData]
  );

  const bracketMatchesByTournament = useMemo(() => {
    return parse(bmr).map((match: any) => {
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
    [bracketMatchesByTournament]
  );

  const bracketMatchMap = useMemo(
    () => new Map(bracketMatches.map((match: any) => [String(match.bracketPosition), match])),
    [bracketMatches]
  );

  const effectiveBracketMatchMap = useMemo(() => {
    const nextMap = new Map(bracketMatchMap);

    Object.entries(optimisticBracketSlots).forEach(([position, patch]) => {
      const currentMatch = (nextMap.get(position) as any) || { bracketPosition: position, tournamentId: Number(selectedTourney) || 0 };
      nextMap.set(position, { ...currentMatch, ...patch });
    });

    return nextMap;
  }, [bracketMatchMap, optimisticBracketSlots, selectedTourney]);

  const assignedBracketTeamIds = useMemo(
    () =>
      new Set(
        Array.from(effectiveBracketMatchMap.values())
          .flatMap((match: any) => [Number(match.teamAId), Number(match.teamBId)])
          .filter(Boolean)
      ),
    [effectiveBracketMatchMap]
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
    [statusesData]
  );

  const activeStatusId = useMemo(
    () => getStatusIdByLabel(["ativo", "andam", "progres", "curso", "abert"]) || scheduledStatusId,
    [scheduledStatusId, statusesData]
  );

  const finishedStatusId = useMemo(
    () => getStatusIdByLabel(["encerr", "conclu", "finaliz"]) || scheduledStatusId,
    [scheduledStatusId, statusesData]
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
      const response = await ApiService.get(`api/MatchTeams/GetTeamsByMatchAndTeamId?matchId=${matchId}&teamId=${teamId}`);
      const entity = extractEntity(response);

      if (entity) return entity;

      const list = parse(response);
      return list[0] || null;
    } catch {
      return null;
    }
  };

  const saveBracketMatch = async (position: string, patch: Record<string, any>, successMessage?: string) => {
    const currentMatch = effectiveBracketMatchMap.get(position) as any;
    const { teamA, teamB, tournament, stage, status, game, teams, winnerTeam, ...existingMatch } = currentMatch || {};
    const resolvedExistingStageId = Number(existingMatch?.stageId) || Number(stage?.id) || 0;
    const existingTeams = Array.isArray(teams) ? teams : [];

    const resolvedStartedAt =
      patch.startedAt === undefined
        ? existingMatch?.startedAt || formatApiUtcTimestamp(new Date())
        : patch.startedAt;

    const resolvedFinishedAt = patch.finishedAt === undefined ? existingMatch?.finishedAt || null : patch.finishedAt;

    const payload = {
      ...existingMatch,
      ...patch,
      bracketPosition: position,
      tournamentId: Number(existingMatch?.tournamentId) || Number(selectedTourney) || 0,
      statusId: Number(patch.statusId) || Number(existingMatch?.statusId) || scheduledStatusId,
      gameId: Number(patch.gameId) || Number(existingMatch?.gameId) || Number(selectedTournament?.gameId) || Number(gamesData[0]?.id) || 0,
      bestOf: Number(patch.bestOf) || Number(existingMatch?.bestOf) || 1,
      startedAt: formatApiUtcTimestamp(resolvedStartedAt),
      finishedAt: resolvedFinishedAt ? formatApiUtcTimestamp(resolvedFinishedAt) : null,
      winnerTeamId: patch.winnerTeamId === undefined ? Number(existingMatch?.winnerTeamId) || 0 : Number(patch.winnerTeamId) || 0,
      stageId: Number(patch.stageId) || resolvedExistingStageId || getStageIdForBracketPosition(position) || 0,
    };

    if (payload.stageId === 0) {
      let fallbackStage = stagesData.find((s: any) => Number(s.tournamentId) === Number(selectedTourney));
      
      if (!fallbackStage && stagesData.length > 0) {
        fallbackStage = stagesData[0]; // Fallback extremo
      }

      if (fallbackStage) {
        payload.stageId = Number(fallbackStage.id);
      }
    }

    const resolvedTeamAId = Number(patch.teamAId) || Number(existingMatch?.teamAId) || 0;
    const resolvedTeamBId = Number(patch.teamBId) || Number(existingMatch?.teamBId) || 0;

    if (!payload.tournamentId || !payload.statusId || !payload.gameId) {
      throw new Error("Cadastre o torneio, status e jogo antes de montar o chaveamento.");
    }

    const resolvedWinnerTeamId = Number(payload.winnerTeamId) || 0;
    const teamAScore = patch.scoreA ?? existingMatch?.scoreA ?? existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "A")?.score ?? null;
    const teamBScore = patch.scoreB ?? existingMatch?.scoreB ?? existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "B")?.score ?? null;
    const matchTeamsPayload = [
      resolvedTeamAId
        ? {
          id:
            Number(existingMatch?.matchTeamAId) ||
            Number(existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "A")?.id) ||
            0,
          createdAt:
            existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "A")?.createdAt ||
            formatApiUtcTimestamp(new Date()),
          updatedAt: formatApiUtcTimestamp(new Date()),
          teamId: resolvedTeamAId,
          side: "A",
          score: teamAScore ?? 0,
          isWinner: resolvedWinnerTeamId === resolvedTeamAId,
        }
        : null,
      resolvedTeamBId
        ? {
          id:
            Number(existingMatch?.matchTeamBId) ||
            Number(existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "B")?.id) ||
            0,
          createdAt:
            existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "B")?.createdAt ||
            formatApiUtcTimestamp(new Date()),
          updatedAt: formatApiUtcTimestamp(new Date()),
          teamId: resolvedTeamBId,
          side: "B",
          score: teamBScore ?? 0,
          isWinner: resolvedWinnerTeamId === resolvedTeamBId,
        }
        : null,
    ].filter(Boolean);

    payload.teamAId = resolvedTeamAId || undefined;
    payload.teamBId = resolvedTeamBId || undefined;
    payload.scoreA = teamAScore;
    payload.scoreB = teamBScore;
    delete payload.teams;

    if (!payload.tournamentId || !payload.statusId || !payload.gameId) {
      throw new Error("Cadastre o torneio, status e jogo antes de montar o chaveamento.");
    }

    const matchResponse = currentMatch?.id
      ? await apiMatches.update(currentMatch.id, payload)
      : await apiMatches.create(payload);

    const persistedMatchId = Number(currentMatch?.id) || Number(extractEntity(matchResponse)?.id) || 0;

    if (!persistedMatchId) {
      throw new Error("Não foi possível identificar a partida para salvar os times.");
    }

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
      })
    );

    queryClient.invalidateQueries({ queryKey: ["matches"] });
    queryClient.invalidateQueries({ queryKey: ["bracket-matches", token, selectedTourney] });
    queryClient.invalidateQueries({ queryKey: ["teams"] });
    toast.success(successMessage || `Slot ${position} atualizado`);
  };

  const handleBracketDrop = async (position: string, teamField: "teamAId" | "teamBId", teamId: number) => {
    if (!teamId) return;

    const currentMatch = effectiveBracketMatchMap.get(position) as any;
    const matchIsLocked = Number(currentMatch?.winnerTeamId) > 0;

    if (matchIsLocked) {
      toast.error("Essa partida já foi decidida e não pode receber novos times.");
      return;
    }

    const teamAlreadyInCurrentMatch = Number(currentMatch?.teamAId) === teamId || Number(currentMatch?.teamBId) === teamId;
    const teamAlreadyAssignedElsewhere = assignedBracketTeamIds.has(teamId) && !teamAlreadyInCurrentMatch;

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
      await saveBracketMatch(position, { [teamField]: teamId, winnerTeamId: 0, finishedAt: null }, `Time alocado em ${position}`);
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

  const handleMatchWinner = async (position: string, teamField: "teamAId" | "teamBId") => {
    const currentMatch = effectiveBracketMatchMap.get(position) as any;
    const winnerTeamId = Number(currentMatch?.[teamField]) || 0;

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

      await saveBracketMatch(
        position,
        {
          winnerTeamId,
          statusId: finishedStatusId,
          finishedAt: formatApiUtcTimestamp(new Date()),
        },
        `Vencedor definido em ${position}`
      );

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
            startedAt: current[nextSlot.nextPosition]?.startedAt || formatApiUtcTimestamp(new Date()),
            finishedAt: null,
            stageId: current[nextSlot.nextPosition]?.stageId || getStageIdForBracketPosition(nextSlot.nextPosition),
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
          `${getTeamLabel(winnerTeamId)} avançou para ${nextSlot.nextPosition}`
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

      return nextEntries.length === Object.keys(current).length ? current : Object.fromEntries(nextEntries);
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
    if (!newMatch.gameId && gamesData.length > 0) {
      setNewMatch((current) => ({ ...current, gameId: Number(gamesData[0].id) || 0 }));
    }
  }, [gamesData, newMatch.gameId]);

  useEffect(() => {
    if (!newMatch.statusId && statusesData.length > 0) {
      setNewMatch((current) => ({ ...current, statusId: Number(statusesData[0].id) || 0 }));
    }
  }, [newMatch.statusId, statusesData]);

  useEffect(() => {
    setNewMatch((current) => {
      if (!current.stageId) return current;

      const stageStillAvailable = availableStages.some((stage: any) => Number(stage.id) === Number(current.stageId));
      return stageStillAvailable ? current : { ...current, stageId: 0 };
    });
  }, [availableStages]);

  useEffect(() => {
    setTeamParticipants((current) =>
      current.map((participant) => {
        const roleStillAvailable = availableRoles.some((role: any) => Number(role.id) === Number(participant.roleId));
        return roleStillAvailable ? participant : { ...participant, roleId: 0 };
      })
    );
  }, [availableRoles]);

  // Guard de Autenticação Admin - Verificação dinâmica por Role (Administrador)
  // Posicionado após TODOS os Hooks para evitar o erro "Rendered more hooks than during the previous render"
  if (!user || user.role !== "Administrador") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#06070a] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md border border-white/5 bg-[#0a0a0c]/80 p-10 backdrop-blur-xl relative group shadow-2xl"
        >
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t border-l border-primary group-hover:w-10 group-hover:h-10 transition-all" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b border-r border-primary group-hover:w-10 group-hover:h-10 transition-all" />

          <ShieldAlert className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
          <h1 className="font-display text-4xl font-black italic uppercase text-white mb-4 tracking-tighter">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-8 uppercase tracking-[0.2em] text-[10px] italic leading-relaxed">
            Identificação de nível Administrador necessária para acessar o núcleo de comando_ <br />
            <span className="text-[8px] opacity-30 mt-2 block">Terminal restrito a usuários com permissão de gestão via API.</span>
          </p>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 w-full h-12 uppercase tracking-[0.2em] font-black italic shadow-neon">
              Autenticar Terminal
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const PAGE = 8;

  /**
   * Ponto de Integração: Mock de ações (Create/Edit/Delete).
   * Em uma API real, estas funções seriam mutações (useMutation do TanStack Query).
   */
  const fakeAct = (label: string) => () => toast.success(`${label} (mock)`);

  // Função real de exclusão que limpa o cache global
  const handleDelete = async (id: string, entity: string) => {
    // Mapeamento de controladores baseado na entidade
    const controllers: Record<string, any> = {
      "Tournaments": apiTournaments,
      "Players": apiPlayers,
      "Teams": apiTeams,
      "Matches": apiMatches,
      "Highlights": apiHighlights,
      "Gallery": apiGallery
    };

    const ctrl = controllers[entity] || apiMatches;

    if (confirm("Confirmar exclusão definitiva?")) {
      const res = await ctrl.deleteRecord(id);
      if (res !== false) {
        // Invalida a query específica para forçar o refetch
        const queryKey = entity.toLowerCase();
        queryClient.invalidateQueries({ queryKey: [queryKey] });

        // Se deletar um time ou uma partida, o ranking (teams) deve ser recalculado
        if (entity === "Teams" || entity === "Matches") {
          queryClient.invalidateQueries({ queryKey: ["teams"] });
        }

        toast.success("Removido com sucesso!");
      }
    }
  };

  /**
   * Lógica de Paginação Client-Side.
   * Engenharia: Idealmente substituída por paginação Server-Side (API com limit/offset).
   */
  function paginate<T>(arr: T[]) {
    const start = (page - 1) * PAGE;
    return { items: arr.slice(start, start + PAGE), pages: Math.ceil(arr.length / PAGE) };
  }

  /**
   * Componente de Cabeçalho Funcional.
   * Encapsula a lógica de busca e botões de ação globais da aba.
   */
  function HeaderBar({ create, onCreate }: { create: string; onCreate?: () => void }) {
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filtrar..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>
        <Button variant="outline" onClick={fakeAct("Upload realizado")}><Upload className="h-4 w-4 mr-1" /> Upload</Button>
        <Button className="bg-neon shadow-neon" onClick={onCreate || (create.includes("partida") ? () => setIsCreatingMatch(true) : () => setIsCreatingTourney(true))}><Plus className="h-4 w-4 mr-1" /> {create}</Button>
      </div>
    );
  }

  function Pagination({ pages }: { pages: number }) {
    return (
      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
        <span className="text-muted-foreground">{page} / {pages}</span>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
      </div>
    );
  }

  function RowActions({ id, entity }: { id: string; entity: string }) {
    return (
      <div className="flex justify-end gap-1">
        <Button size="icon" variant="ghost" onClick={fakeAct("Editado")}><Pencil className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" onClick={() => handleDelete(id, entity)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    );
  }

  /**
   * Helper de Filtragem Local.
   * Integração: O filtro 'q' deve ser enviado como parâmetro para a API em ambientes produtivos.
   */
  const filt = (arr: any[], key: string) => arr.filter((x) => String(x[key]).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10">
      <Dialog open={viewingTeamId !== null} onOpenChange={(open) => !open && setViewingTeamId(null)}>
        <DialogContent className="max-w-3xl border-white/10 bg-[#0a0a0c] text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase italic">
              {viewingTeam?.name || "Lineup do time"}
            </DialogTitle>
            <DialogDescription className="text-white/50 uppercase tracking-widest text-[10px]">
              Players relacionados ao time selecionado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {viewingTeamParticipants.length === 0 && (
              <div className="border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                Nenhum player relacionado a este time.
              </div>
            )}
            {viewingTeamParticipants.map((participant: any) => (
              <div key={participant.id} className="grid grid-cols-[1.4fr_1fr_1fr] gap-3 border border-white/10 bg-white/5 p-4">
                <div>
                  <div className="font-display text-lg">{participant.player?.name || `Player #${participant.playerId}`}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">
                    Entrou em {formatDateBR(participant.joinedAt)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Role</div>
                  <div>{participant.role?.name || `Role #${participant.roleId}`}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Status</div>
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase">
                    {participant.isStarter && <span className="border border-primary/40 px-2 py-1 text-primary">Titular</span>}
                    {participant.isCaptain && <span className="border border-warning/40 px-2 py-1 text-warning">Capitão</span>}
                    {participant.isSubstitute && <span className="border border-neon/40 px-2 py-1 text-neon">Reserva</span>}
                    {participant.isActive && <span className="border border-success/40 px-2 py-1 text-success">Ativo</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <img src="https://santos-games.com/encontre-um-time/assets/sga-logo-B5SOul8E.png" alt="SGA Logo" className="h-12 w-auto" />
          <h1 className="font-display text-3xl uppercase tracking-widest">Painel de controle</h1>
        </div>
      </div>

      {/* Dashboard de Visão Geral utilizando StatsCards reutilizáveis */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Campeonatos" value={tournamentsData.length} icon={Trophy} accent />
        <StatsCard label="Times" value={teamsData.length} icon={Users} />
        <StatsCard label="Jogadores" value={playersData.length} icon={Activity} />
        <StatsCard label="Partidas" value={matchesData.length} icon={Swords} />
      </div>

      {/* Sistema de Tabulação por Estado */}
      <div className="mt-8 flex flex-wrap gap-1 border-b border-border/60">
        {tabs.map((t) => (
          <button key={t.k} onClick={() => { setTab(t.k); setPage(1); }}
            className={`px-4 py-2 text-xs uppercase tracking-widest -mb-px border-b-2 transition ${tab === t.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>{t.label}</button>
        ))}
      </div>

      <div className="mt-6">
        {/* 
            Blocos de Renderização Condicional por Aba.
            Pontos de Integração: Cada 'f' (filtro) consome dados de '@/mocks/data'.
        */}
        {tab === "campeonatos" && (() => {
          const f = filt(tournamentsData, "name");
          const { items, pages } = paginate(f);
          return (
            <>
              {isCreatingTourney && (
                <div className="mb-8 p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
                  <h3 className="font-display text-xl uppercase italic text-primary">Configurar Novo Campeonato</h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Nome</label>
                      <Input placeholder="Título do Evento" value={newTourney.name} onChange={e => setNewTourney({ ...newTourney, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Premiação Total (Número)</label>
                      <Input type="number" placeholder="Ex: 5000" value={newTourney.prizePool} onChange={e => setNewTourney({ ...newTourney, prizePool: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Vagas</label>
                      <Input type="number" value={newTourney.maxTeams} onChange={e => setNewTourney({ ...newTourney, maxTeams: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Início</label>
                      <Input type="datetime-local" value={newTourney.startDate} onChange={e => setNewTourney({ ...newTourney, startDate: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Término</label>
                      <Input type="datetime-local" value={newTourney.endDate} onChange={e => setNewTourney({ ...newTourney, endDate: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Roster Lock</label>
                      <Input type="datetime-local" value={newTourney.rosterLockAt} onChange={e => setNewTourney({ ...newTourney, rosterLockAt: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Jogo</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={newTourney.gameId}
                        onChange={e => setNewTourney({ ...newTourney, gameId: Number(e.target.value) })}
                      >
                        <option value={0}>Selecionar Jogo...</option>
                        {gamesData.map((game: any) => (
                          <option key={game.id} value={game.id}>{game.name || game.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Status</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={newTourney.statusId}
                        onChange={e => setNewTourney({ ...newTourney, statusId: Number(e.target.value) })}
                      >
                        <option value={0}>Selecionar Status...</option>
                        {statusesData.map((status: any) => (
                          <option key={status.id} value={status.id}>{status.name || status.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Organizador</label>
                      <Input placeholder="Ex: Santos Games" value={newTourney.organizer} onChange={e => setNewTourney({ ...newTourney, organizer: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Descrição</label>
                      <Input placeholder="Sobre o campeonato..." value={newTourney.description} onChange={e => setNewTourney({ ...newTourney, description: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">URL do Banner</label>
                      <Input placeholder="https://..." value={newTourney.bannerUrl} onChange={e => setNewTourney({ ...newTourney, bannerUrl: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsCreatingTourney(false)}>Cancelar</Button>
                    <Button className="bg-primary" onClick={async () => {
                      try {
                        if (!newTourney.name.trim()) throw new Error("O nome do campeonato é obrigatório.");
                        if (!newTourney.gameId) throw new Error("Selecione um jogo para o campeonato.");
                        if (!newTourney.statusId) throw new Error("Selecione o status do campeonato.");

                        const payload = {
                          ...newTourney,
                          name: newTourney.name.trim(),
                          description: newTourney.description.trim(),
                          bannerUrl: newTourney.bannerUrl.trim(),
                          startDate: formatApiTimestamp(newTourney.startDate),
                          endDate: formatApiTimestamp(newTourney.endDate),
                          rosterLockAt: formatApiTimestamp(newTourney.rosterLockAt),
                          createdBy: user?.login || user?.name || user?.email || "SGA_ADMIN",
                        };

                        const result = await apiTournaments.create(payload);
                        if (!result?.result && result !== true && result !== null) {
                          throw new Error("Erro ao criar campeonato");
                        }

                        toast.success("Campeonato criado com sucesso!");
                        setIsCreatingTourney(false);
                        setNewTourney(createEmptyTournament());

                        // Gatilho de atualização automática
                        queryClient.invalidateQueries({ queryKey: ["tournaments"] });
                        queryClient.invalidateQueries({ queryKey: ["matches"] }); // Partidas podem mudar com novos torneios
                      } catch (err: any) {
                        console.error("Erro detalhado da API:", err);
                        toast.error(err.message || "Erro ao criar campeonato");
                      }
                    }}>Salvar</Button>
                  </div>
                </div>
              )}
              <HeaderBar create="Novo campeonato" />
              <div className="overflow-x-auto rounded-xl border border-border/60 bg-card-grad">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr><th className="px-4 py-3 text-left">Nome</th><th className="text-left">Status</th><th>Times</th><th>Premiação</th><th>Início</th><th /></tr>
                  </thead>
                  <tbody>
                    {items.map((t) => (
                      <tr key={t.id} className="border-t border-border/40 hover:bg-muted/30">
                        <td className="px-4 py-3 font-display">{t.name}</td>
                        <td><StatusBadge status={getTournamentStatusLabel(t.statusId)} /></td>
                        <td className="text-center">{t.maxTeams}</td>
                        <td className="text-center">{t.prizePool}</td>
                        <td className="text-center">{formatDateBR(t.startDate)}</td>
                        <td className="px-4 py-3"><RowActions id={t.id} entity="Tournaments" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pages={pages} />
            </>
          );
        })()}

        {tab === "chaveamentos" && (
          <div className="animate-in fade-in duration-700 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary">
                  <Swords className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl uppercase italic font-black text-white leading-none">Gestão de <span className="text-primary">Chaveamentos</span></h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic mt-1">Playoff_Matrix_Control // Protocol_9.9</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start">
              {/* Lista de Seleção */}
              <div className="space-y-4">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Tournament_Stream</span>
                <div className="grid gap-2">
                  {tournamentsData.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTourney(t.id)}
                      className={`p-4 text-left border transition-all relative group ${selectedTourney === t.id ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(248,109,131,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                    >
                      <div className="text-sm font-display uppercase italic font-bold tracking-tight">{t.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <StatusBadge status={getTournamentStatusLabel(t.statusId)} />
                      </div>
                      {selectedTourney === t.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />}
                    </button>
                  ))}
                </div>

                <div className="border border-white/10 bg-white/5 p-4 space-y-3">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.35em] text-white/30 italic">Times Disponíveis</div>
                    <div className="text-xs text-white/50 mt-2">
                      Arraste um time para um slot vazio. O pool usa os times disponíveis no painel e bloqueia duplicidades no mesmo chaveamento.
                    </div>
                  </div>
                  <div className="grid gap-2 max-h-[420px] overflow-y-auto pr-1">
                    {bracketTeams.map((team: any) => {
                      const isAssigned = assignedBracketTeamIds.has(Number(team.id));

                      return (
                        <div
                          key={team.id}
                          draggable={!isAssigned}
                          onDragStart={(event) => {
                            setDraggingTeamId(Number(team.id));
                            event.dataTransfer.setData("text/team-id", String(team.id));
                            event.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setDraggingTeamId(null);
                            setPreviewSlotKey(null);
                          }}
                          className={`flex items-center gap-3 border px-3 py-3 transition ${isAssigned ? "cursor-not-allowed border-white/5 bg-black/20 opacity-40" : "cursor-grab border-white/10 bg-black/30 hover:border-primary/40 hover:bg-primary/5 active:cursor-grabbing"}`}
                        >
                          <TeamLogo team={{ tag: team.tag || team.name?.slice(0, 3) || "SGA", bannerColor: "#f86d83" }} size={32} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-display text-sm uppercase italic text-white">{team.name}</div>
                            <div className="truncate text-[10px] uppercase tracking-widest text-white/35">{team.tag || "Sem tag"}</div>
                          </div>
                          {isAssigned && <span className="text-[9px] font-black uppercase tracking-widest text-warning">Em uso</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Workspace do Editor */}
              <div className="bg-[#0a0a0c]/60 backdrop-blur-md border border-white/5 p-8 relative">
                <div className="flex flex-col gap-12">
                  {!selectedTournament && (
                    <div className="border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/50">
                      Selecione um torneio para montar o chaveamento.
                    </div>
                  )}

                  {selectedTournament && BRACKET_ROUNDS.map((round) => (
                    <div key={round.key} className="space-y-6">
                      <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] italic flex items-center gap-3 ${round.accentClass}`}>
                        <div className={`w-8 h-px ${round.lineClass}`} /> {round.title}
                      </h4>

                      <div className={`grid gap-4 ${round.positions.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1 max-w-xl"}`}>
                        {round.positions.map((position) => {
                          const match = effectiveBracketMatchMap.get(position) as any;
                          const teamA = getTeamById(Number(match?.teamAId));
                          const teamB = getTeamById(Number(match?.teamBId));
                          const matchIsLocked = Number(match?.winnerTeamId) > 0;

                          const renderDropSlot = (teamField: "teamAId" | "teamBId", label: string, team: any) => (
                            <div
                              onDragEnter={() => {
                                if (matchIsLocked) return;
                                setPreviewSlotKey(`${position}:${teamField}`);
                              }}
                              onDragOver={(event) => {
                                if (matchIsLocked) return;
                                event.preventDefault();
                                setPreviewSlotKey(`${position}:${teamField}`);
                              }}
                              onDragLeave={(event) => {
                                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                                setPreviewSlotKey((current) => (current === `${position}:${teamField}` ? null : current));
                              }}
                              onDrop={(event) => {
                                if (matchIsLocked) return;
                                event.preventDefault();
                                const teamId = Number(event.dataTransfer.getData("text/team-id")) || 0;
                                setPreviewSlotKey(null);
                                setDraggingTeamId(null);
                                void handleBracketDrop(position, teamField, teamId);
                              }}
                              className={`min-h-16 border px-3 py-3 transition ${team ? "border-white/10 bg-black/40" : "border-dashed border-white/15 bg-black/20 hover:border-primary/40"} ${previewSlotKey === `${position}:${teamField}` && draggingTeam ? "border-primary bg-primary/10" : ""} ${matchIsLocked ? "cursor-not-allowed opacity-70" : ""}`}
                            >
                              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">{label}</div>
                              {previewSlotKey === `${position}:${teamField}` && draggingTeam ? (
                                <div className="flex items-center gap-3 opacity-80">
                                  <TeamLogo team={{ tag: draggingTeam.tag || draggingTeam.name?.slice(0, 3) || "SGA", bannerColor: "#f86d83" }} size={28} />
                                  <div className="min-w-0">
                                    <div className="truncate font-display text-sm uppercase italic text-white">{draggingTeam.name}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-primary">Preview</div>
                                  </div>
                                </div>
                              ) : team ? (
                                <div className="flex items-center gap-3">
                                  <TeamLogo team={{ tag: team.tag || team.name?.slice(0, 3) || "SGA", bannerColor: "#f86d83" }} size={28} />
                                  <div className="min-w-0">
                                    <div className="truncate font-display text-sm uppercase italic text-white">{team.name}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/35">{team.tag || "Sem tag"}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-white/35">{matchIsLocked ? "Partida encerrada" : "Arraste um time para este slot"}</div>
                              )}
                            </div>
                          );

                          return (
                            <div key={position} className={`p-4 border transition-all relative ${round.cardClass}`}>
                              <div className="flex justify-between items-start gap-3 mb-4">
                                <div>
                                  <div className="text-[8px] font-black text-white/30 tracking-widest uppercase">Slot {position}</div>
                                  <div className="text-[10px] uppercase tracking-widest text-white/20 mt-1">
                                    {getBracketPhaseLabel(position)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {match?.statusId ? <StatusBadge status={getTournamentStatusLabel(match.statusId)} /> : <span className="text-[9px] uppercase tracking-widest text-white/25">Pendente</span>}
                                  <Save className="w-3 h-3 text-white/10" />
                                </div>
                              </div>

                              <div className="space-y-3">
                                {renderDropSlot("teamAId", "Slot A", teamA)}
                                <div className="flex items-center gap-4 py-1">
                                  <div className="h-px flex-1 bg-white/5" />
                                  <span className="text-[8px] font-black text-white/10 italic tracking-tighter">VERSUS</span>
                                  <div className="h-px flex-1 bg-white/5" />
                                </div>
                                {renderDropSlot("teamBId", "Slot B", teamB)}
                              </div>

                              <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
                                <div className="text-[9px] font-black uppercase tracking-[0.35em] text-white/30 italic">Quem ganhou?</div>
                                <div className="grid sm:grid-cols-2 gap-2">
                                  <Button
                                    variant="outline"
                                    disabled={!teamA || !teamB || matchIsLocked}
                                    onClick={() => void handleMatchWinner(position, "teamAId")}
                                    className={`justify-start ${Number(match?.winnerTeamId) === Number(match?.teamAId) && teamA ? "border-primary bg-primary/10 text-white" : ""}`}
                                  >
                                    {teamA ? teamA.name : "Aguardando Time A"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    disabled={!teamA || !teamB || matchIsLocked}
                                    onClick={() => void handleMatchWinner(position, "teamBId")}
                                    className={`justify-start ${Number(match?.winnerTeamId) === Number(match?.teamBId) && teamB ? "border-primary bg-primary/10 text-white" : ""}`}
                                  >
                                    {teamB ? teamB.name : "Aguardando Time B"}
                                  </Button>
                                </div>

                                {Number(match?.winnerTeamId) > 0 && (
                                  <div className="text-xs text-white/55">
                                    Avançando: <span className="font-display uppercase italic text-white">{getTeamLabel(Number(match.winnerTeamId))}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "times" && (() => {
          const f = filt(teamsData, "name");
          const { items, pages } = paginate(f);
          return (
            <>
              {isCreatingTeam && (
                <div className="mb-8 p-6 border border-neon/20 bg-neon/5 rounded-xl space-y-4">
                  <h3 className="font-display text-xl uppercase italic text-neon">Registrar Nova Equipe</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Nome da Equipe</label>
                      <Input placeholder="Ex: Pulse Elite" value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Descrição</label>
                      <Input placeholder="Ex: Organização competitiva" value={newTeam.description} onChange={e => setNewTeam({ ...newTeam, description: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">TAG</label>
                      <Input placeholder="Ex: PULSE" value={newTeam.tag} onChange={e => setNewTeam({ ...newTeam, tag: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Logo URL</label>
                      <Input placeholder="https://cdn..." value={newTeam.logoUrl} onChange={e => setNewTeam({ ...newTeam, logoUrl: e.target.value })} />
                    </div>
                  </div>
                  <div className="border border-white/10 bg-black/20 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/70 italic">Formação Inicial</h4>
                      <div className="flex items-center gap-2">
                        <select
                          className="flex h-10 rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={teamGameId}
                          onChange={e => setTeamGameId(Number(e.target.value))}
                        >
                          <option value={0}>Selecionar jogo dos roles...</option>
                          {gamesData.map((game: any) => (
                            <option key={game.id} value={game.id}>{game.name || game.title}</option>
                          ))}
                        </select>
                        <Button type="button" variant="outline" onClick={addTeamParticipant}>Adicionar player</Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {teamParticipants.map((participant, index) => (
                        <div key={index} className="grid md:grid-cols-[1.3fr_1fr_auto_auto_auto_auto_auto] gap-3 items-center border border-white/5 p-3">
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            value={participant.playerId || ""}
                            onChange={e => updateTeamParticipant(index, { playerId: Number(e.target.value) || 0 })}
                          >
                            <option value="">Selecionar player...</option>
                            {playersData.map((player: any) => {
                              const playerId = Number(player.id);
                              const selectedElsewhere = linkedPlayerIdsInDraft.has(playerId) && playerId !== Number(participant.playerId);
                              return (
                                <option key={player.id} value={player.id} disabled={selectedElsewhere}>
                                  {player.name}{selectedElsewhere ? " (já escalado)" : ""}
                                </option>
                              );
                            })}
                          </select>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            value={participant.roleId || ""}
                            onChange={e => updateTeamParticipant(index, { roleId: Number(e.target.value) || 0 })}
                            disabled={!teamGameId}
                          >
                            <option value="">Selecionar role...</option>
                            {availableRoles.map((role: any) => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                          <label className="text-[10px] uppercase text-white/70 flex items-center gap-2">
                            <input type="checkbox" checked={participant.isStarter} onChange={e => updateTeamParticipant(index, { isStarter: e.target.checked, isSubstitute: e.target.checked ? false : participant.isSubstitute })} /> Titular
                          </label>
                          <label className="text-[10px] uppercase text-white/70 flex items-center gap-2">
                            <input type="checkbox" checked={participant.isCaptain} onChange={e => updateTeamParticipant(index, { isCaptain: e.target.checked })} /> Capitão
                          </label>
                          <label className="text-[10px] uppercase text-white/70 flex items-center gap-2">
                            <input type="checkbox" checked={participant.isSubstitute} onChange={e => updateTeamParticipant(index, { isSubstitute: e.target.checked, isStarter: e.target.checked ? false : participant.isStarter })} /> Reserva
                          </label>
                          <label className="text-[10px] uppercase text-white/70 flex items-center gap-2">
                            <input type="checkbox" checked={participant.isActive} onChange={e => updateTeamParticipant(index, { isActive: e.target.checked })} /> Ativo
                          </label>
                          <Button type="button" variant="ghost" onClick={() => removeTeamParticipant(index)}>Remover</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsCreatingTeam(false)}>Cancelar</Button>
                    <Button className="bg-neon text-black font-black" onClick={async () => {
                      try {
                        if (!newTeam.name || !newTeam.tag) throw new Error("Nome e TAG são obrigatórios.");

                        const payload = {
                          ...newTeam,
                          name: newTeam.name.trim(),
                          description: newTeam.description.trim(),
                          tag: newTeam.tag.trim(),
                          logoUrl: newTeam.logoUrl.trim(),
                        };
                        const result = await apiTeams.create(payload);
                        const createdTeam = extractEntity(result);
                        if (!createdTeam?.id) {
                          throw new Error("Erro ao registrar time");
                        }

                        const participantsToCreate = teamParticipants.filter((participant) => participant.playerId && participant.roleId);

                        for (const participant of participantsToCreate) {
                          const participantPayload = {
                            roleId: participant.roleId,
                            playerId: participant.playerId,
                            teamId: createdTeam.id,
                            joinedAt: formatApiTimestamp(new Date()),
                            leftAt: null,
                            isActive: participant.isActive,
                            isStarter: participant.isStarter,
                            isCaptain: participant.isCaptain,
                            isSubstitute: participant.isSubstitute,
                          };

                          const participantResult = await apiTeamParticipants.create(participantPayload);
                          if (!participantResult?.result && participantResult !== true && participantResult !== null) {
                            throw new Error("Time criado, mas houve erro ao vincular jogadores.");
                          }
                        }

                        toast.success("Equipe registrada!");
                        setIsCreatingTeam(false);
                        setNewTeam(createEmptyTeam());
                        setTeamParticipants([createEmptyTeamParticipant()]);

                        // Gatilho de atualização automática (afeta squads e rankings)
                        queryClient.invalidateQueries({ queryKey: ["teams"] });
                        queryClient.invalidateQueries({ queryKey: ["players"] });
                      } catch (err: any) {
                        toast.error(err.message || "Erro ao registrar time");
                      }
                    }}>Finalizar Registro</Button>
                  </div>
                </div>
              )}
              <HeaderBar create="Novo time" onCreate={() => setIsCreatingTeam(true)} />
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card-grad">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr><th className="px-4 py-3 text-left">Time</th><th>Tag</th><th>Descrição</th><th>Criado em</th><th /></tr>
                  </thead>
                  <tbody>
                    {items.map((t) => (
                      <tr key={t.id} className="border-t border-border/40 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {t.logoUrl ? (
                              <img src={t.logoUrl} alt={t.name} className="h-7 w-7 rounded-full object-cover" />
                            ) : (
                              <TeamLogo team={{ tag: t.tag, bannerColor: "#f86d83" }} size={28} />
                            )}
                            <span className="font-display">{t.name}</span>
                          </div>
                        </td>
                        <td className="text-center text-primary font-display">{t.tag}</td>
                        <td className="text-center">{t.description || "-"}</td>
                        <td className="text-center">{formatDateBR(t.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => setViewingTeamId(Number(t.id))}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={fakeAct("Editado")}><Pencil className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(t.id, "Teams")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pages={pages} />
            </>
          );
        })()}

        {tab === "jogadores" && (() => {
          const f = filt(playersData, "name");
          const { items, pages } = paginate(f);
          return (
            <>
              {isCreatingPlayer && (
                <div className="mb-8 p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
                  <h3 className="font-display text-xl uppercase italic text-primary">Contratar Novo Atleta</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Usuário Vinculado</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={newPlayer.userId || ""}
                        onChange={e => handlePlayerUserChange(e.target.value)}
                      >
                        <option value="">Selecionar usuário para relacionar</option>
                        {usersData.map((candidate: any) => {
                          const candidateId = Number(candidate.id);
                          const alreadyLinked = linkedUserIds.has(candidateId) && candidateId !== Number(newPlayer.userId);

                          return (
                            <option key={candidate.id} value={candidate.id} disabled={alreadyLinked}>
                              {getUserLabel(candidate)}{candidate.email ? ` - ${candidate.email}` : ""}{alreadyLinked ? " (já vinculado)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      {selectedUser && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          {selectedUser.login || selectedUser.email || `ID ${selectedUser.id}`} · {selectedUser.email || `ROLE ${selectedUser.role}`}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Nome do Player</label>
                      <Input placeholder="Ex: Igor Caetano" value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Avatar URL</label>
                      <Input placeholder="https://..." value={newPlayer.avatarUrl} onChange={e => setNewPlayer({ ...newPlayer, avatarUrl: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Perfil Público</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={String(newPlayer.isProfilePublic)}
                        onChange={e => setNewPlayer({ ...newPlayer, isProfilePublic: e.target.value === "true" })}
                      >
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsCreatingPlayer(false)}>Cancelar</Button>
                    <Button className="bg-primary font-black" onClick={async () => {
                      try {
                        if (!newPlayer.userId) throw new Error("Selecione um usuário para vincular ao player.");
                        if (!newPlayer.name.trim()) throw new Error("O nome do player é obrigatório.");

                        const payload = {
                          ...newPlayer,
                          name: newPlayer.name.trim(),
                          avatarUrl: newPlayer.avatarUrl?.trim() || "https://picsum.photos/seed/sga/200/200",
                          updatedAt: formatApiTimestamp(new Date()),
                        };

                        const result = await apiPlayers.create(payload);

                        if (result?.result || result === true || result === null) {
                          toast.success("Jogador contratado!");
                          setIsCreatingPlayer(false);
                          setNewPlayer(createEmptyPlayer());

                          queryClient.invalidateQueries({ queryKey: ["players"] });
                          return;
                        }

                        toast.error("Erro ao criar jogador");
                      } catch (err: any) {
                        toast.error(err.message || "Erro ao criar jogador");
                      }
                    }}>Salvar Perfil</Button>
                  </div>
                </div>
              )}
              <HeaderBar create="Novo jogador" onCreate={() => setIsCreatingPlayer(true)} />
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card-grad">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr><th className="px-4 py-3 text-left">Jogador</th><th>Usuário</th><th>Visibilidade</th><th>Criado em</th><th /></tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="border-t border-border/40 hover:bg-muted/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={p.avatarUrl && p.avatarUrl !== "null" ? p.avatarUrl : "https://picsum.photos/seed/sga/200/200"} className="h-7 w-7 rounded-full object-cover" alt="" />
                            <span className="font-display">{p.name}</span>
                          </div>
                        </td>
                        <td className="text-center">{getUserLabel(usersData.find((candidate: any) => Number(candidate.id) === Number(p.userId)))}</td>
                        <td className="text-center">{p.isProfilePublic ? "Público" : "Privado"}</td>
                        <td className="text-center">{formatDateBR(p.createdAt)}</td>
                        <td className="px-4 py-3"><RowActions id={p.id} entity="Players" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pages={pages} />
            </>
          );
        })()}

        {tab === "partidas" && (() => {
          const f = matchesData.filter((match: any) => {
            const target = `${getTournamentLabel(match.tournamentId)} ${getStageLabel(match.stageId)} ${getTournamentStatusLabel(match.statusId)} ${getGameLabel(match.gameId)}`.toLowerCase();
            return target.includes(q.toLowerCase());
          });
          const { items, pages } = paginate(f);
          return (
            <>
              {isCreatingMatch && (
                <div className="mb-8 p-6 border border-secondary/20 bg-secondary/5 rounded-xl space-y-4">
                  <h3 className="font-display text-xl uppercase italic text-secondary">Agendar Novo Confronto</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Campeonato</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm" value={newMatch.tournamentId || ""} onChange={e => setNewMatch({ ...newMatch, tournamentId: Number(e.target.value) || 0, stageId: 0 })}>
                        <option value="">Selecionar...</option>
                        {tournamentsData.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Stage</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm" value={newMatch.stageId || ""} onChange={e => setNewMatch({ ...newMatch, stageId: Number(e.target.value) || 0 })}>
                        <option value="">Selecionar...</option>
                        {availableStages.map((stage: any) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Status</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm" value={newMatch.statusId || ""} onChange={e => setNewMatch({ ...newMatch, statusId: Number(e.target.value) || 0 })}>
                        <option value="">Selecionar...</option>
                        {statusesData.map((status: any) => <option key={status.id} value={status.id}>{status.name || status.title}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Jogo</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm" value={newMatch.gameId || ""} onChange={e => setNewMatch({ ...newMatch, gameId: Number(e.target.value) || 0 })}>
                        <option value="">Selecionar...</option>
                        {gamesData.map((game: any) => <option key={game.id} value={game.id}>{game.name || game.title}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Melhor de</label>
                      <Input type="number" min={1} value={newMatch.bestOf} onChange={e => setNewMatch({ ...newMatch, bestOf: Number(e.target.value) || 1 })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Vencedor</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm" value={newMatch.winnerTeamId || ""} onChange={e => setNewMatch({ ...newMatch, winnerTeamId: Number(e.target.value) || 0 })}>
                        <option value="">Definir depois</option>
                        {teamsData.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Início</label>
                      <Input type="datetime-local" value={newMatch.startedAt} onChange={e => setNewMatch({ ...newMatch, startedAt: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-muted-foreground italic">Fim</label>
                      <Input type="datetime-local" value={newMatch.finishedAt} onChange={e => setNewMatch({ ...newMatch, finishedAt: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsCreatingMatch(false)}>Cancelar</Button>
                    <Button className="bg-secondary text-black font-black" onClick={async () => {
                      try {
                        if (!newMatch.tournamentId || !newMatch.stageId || !newMatch.statusId || !newMatch.gameId) throw new Error("Preencha os campos obrigatórios");
                        const payload = {
                          ...newMatch,
                          startedAt: formatApiUtcTimestamp(newMatch.startedAt),
                          finishedAt: formatApiUtcTimestamp(newMatch.finishedAt),
                        };
                        await apiMatches.create(payload);
                        toast.success("Partida agendada!");
                        setIsCreatingMatch(false);
                        setNewMatch(createEmptyMatch());

                        // Gatilho de atualização automática
                        queryClient.invalidateQueries({ queryKey: ["matches"] });
                      } catch (err: any) {
                        toast.error(err.message || "Erro ao agendar partida");
                      }
                    }}>Confirmar Agenda</Button>
                  </div>
                </div>
              )}
              <HeaderBar create="Nova partida" onCreate={() => setIsCreatingMatch(true)} />
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card-grad">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr><th className="px-4 py-3 text-left">Campeonato</th><th>Stage</th><th>Bo</th><th>Vencedor</th><th>Status</th><th>Início</th><th /></tr>
                  </thead>
                  <tbody>
                    {items.map((m: any) => (
                      <tr key={m.id} className="border-t border-border/40 hover:bg-muted/30">
                        <td className="px-4 py-3 font-display">{getTournamentLabel(m.tournamentId)}</td>
                        <td className="text-center">{getStageLabel(m.stageId)}</td>
                        <td className="text-center">MD{m.bestOf || 1}</td>
                        <td className="text-center">{m.winnerTeamId ? getTeamLabel(m.winnerTeamId) : "-"}</td>
                        <td className="text-center"><StatusBadge status={getTournamentStatusLabel(m.statusId)} /></td>
                        <td className="text-center">{m.startedAt ? formatDateBR(m.startedAt) : "-"}</td>
                        <td className="px-4 py-3"><RowActions id={m.id} entity="Matches" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pages={pages} />
            </>
          );
        })()}

        {tab === "highlights" && (
          <>
            <HeaderBar create="Novo highlight" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {highlightsData.map((h: any) => (
                <div key={h.id} className="rounded-xl overflow-hidden border border-border/60 bg-card-grad">
                  <div className="relative aspect-video"><img src={h.thumbnail} className="h-full w-full object-cover" alt="" /><Film className="absolute top-2 right-2 h-5 w-5 text-primary" /></div>
                  <div className="p-3">
                    <div className="text-sm font-display truncate">{h.title}</div>
                    <div className="mt-2 flex justify-end"><RowActions id={h.id} entity="Highlights" /></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "galeria" && (
          <>
            <HeaderBar create="Adicionar imagem" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {galleryData.map((src: string, i: number) => (
                <div key={i} className="relative group rounded-lg overflow-hidden">
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                  <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <Button size="icon" variant="ghost" onClick={fakeAct("Editado")}><Img className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(String(i), "Gallery")}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
