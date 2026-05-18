import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, Check, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TeamLogo } from "@/components/sga/TeamLogo";
import ApiService from "@/API/service";
import useApiController from "@/API/controler";

type AiMode = "existing" | "new" | "bracket";

type AiPlayerDraft = {
  playerName: string | null;
  nickname: string | null;
  tag: string | null;
  roleName: string | null;
  characterName: string | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  adr: number | null;
  acs: number | null;
  hsPercentage: number | null;
  kast: number | null;
  firstKills: number | null;
};

type AiTeamDraft = {
  teamName: string | null;
  side: string | null;
  score: number | null;
  isWinner: boolean | null;
  roundsWon: number | null;
  roundsLost: number | null;
  plants: number | null;
  defuses: number | null;
  players: AiPlayerDraft[];
};

type AiAnalysisDraft = {
  tournamentName: string | null;
  matchName: string | null;
  mapName: string | null;
  bestOf: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  teams: AiTeamDraft[];
  warnings: string[];
  confidence: number | null;
};

type ResolvedPlayerDraft = AiPlayerDraft & {
  resolvedPlayerId: number;
  resolvedPlayerLabel: string;
  resolvedGameAccountId: number;
  candidateOptions: Array<{ id: number; label: string; gameAccountId: number }>;
};

type ResolvedTeamDraft = AiTeamDraft & {
  resolvedTeamId: number;
  resolvedTeamLabel: string;
  rosterLabel?: string;
  candidateOptions: Array<{ id: number; label: string }>;
  players: ResolvedPlayerDraft[];
};

type ResolvedDraft = AiAnalysisDraft & {
  teams: ResolvedTeamDraft[];
  derivedScoreboard: string;
};

type AiBracketMatchDraft = {
  matchNumber: number | null;
  bracketPosition: string | null;
  roundLabel: string | null;
  teamAName: string | null;
  teamBName: string | null;
  winnerTeamName: string | null;
  teamAScore: number | null;
  teamBScore: number | null;
  bestOf: number | null;
  status: string | null;
};

type AiBracketAnalysisDraft = {
  tournamentName: string | null;
  bracketType: string | null;
  matches: AiBracketMatchDraft[];
  warnings: string[];
  confidence: number | null;
};

type ResolvedBracketMatchDraft = AiBracketMatchDraft & {
  resolvedTeamAId: number;
  resolvedTeamALabel: string;
  resolvedTeamBId: number;
  resolvedTeamBLabel: string;
  resolvedWinnerTeamId: number;
  resolvedWinnerTeamLabel: string;
  teamACandidateOptions: Array<{ id: number; label: string }>;
  teamBCandidateOptions: Array<{ id: number; label: string }>;
  winnerCandidateOptions: Array<{ id: number; label: string }>;
};

type ResolvedBracketDraft = AiBracketAnalysisDraft & {
  matches: ResolvedBracketMatchDraft[];
  resolvedTournamentLabel: string;
};

type AiMatchTabProps = {
  token: string | null;
  teamsData: any[];
  playersData: any[];
  gameAccountsData: any[];
  matchTeamsData: any[];
  tournamentsData: any[];
  stagesData: any[];
  statusesData: any[];
  gamesData: any[];
  matchesData: any[];
  teamMatchStatsData: any[];
  playerMatchStatsData: any[];
  matchLineupsData: any[];
  matchLineupPlayersData: any[];
  teamParticipantsData: any[];
};

const defaultPrompt = `Analise a imagem da partida e retorne somente JSON válido.

Quero identificar:
- nomes dos times, mesmo quando o placar não mostrar a label completa; nesse caso, inferir pelo nick dos jogadores e pelo roster
- lado de cada time
- placar final
- vencedor
- nicks dos jogadores
- kills, deaths, assists, ACS, ADR, HS%, KAST, first kills
- rounds won/lost, plants e defuses quando estiverem visíveis

Não invente IDs. Se algo não estiver visível, use null.`;

const defaultBracketPrompt = `Analise a imagem do chaveamento completo e retorne somente JSON válido.

Quero identificar:
- cada partida do bracket
- posição da partida no bracket
- nomes dos dois times
- vencedor de cada confronto
- placar, se estiver visível
- ordem das fases do chaveamento

Não invente IDs. Se algo não estiver visível, use null.`;

const DEFAULT_BRACKET_MATCH_COUNT = 13;

const emptyMatchMeta = {
  tournamentId: 0,
  stageId: 0,
  statusId: 0,
  gameId: 0,
  bestOf: 1,
  startedAt: "",
  finishedAt: "",
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

const scoreMatch = (needle: string, haystack: string[]) => {
  const target = normalize(needle);
  if (!target) return 0;

  let score = 0;
  for (const token of haystack) {
    const normalized = normalize(token);
    if (!normalized) continue;
    if (normalized === target) score = Math.max(score, 100);
    else if (normalized.includes(target) || target.includes(normalized)) score = Math.max(score, 85);
    else {
      const targetTokens = target.split(/(\d+)/).filter(Boolean);
      if (targetTokens.some((part) => part && normalized.includes(part))) {
        score = Math.max(score, 65);
      }
    }
  }

  return score;
};

const normalizeBracketKey = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

const toNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toIsoTimestamp = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getPlayerCandidates = (playersData: any[], gameAccountsData: any[]) => {
  const playerById = new Map<number, any>();
  playersData.forEach((player) => playerById.set(Number(player.id), player));

  const linkedCandidates = gameAccountsData.map((account: any) => {
    const player = playerById.get(Number(account.playerId));
    const label = [
      account.nickname,
      account.tag,
      player?.name,
      player?.nickname,
    ]
      .filter(Boolean)
      .join(" • ");

    return {
      id: Number(player?.id) || Number(account.playerId) || 0,
      gameAccountId: Number(account.id) || 0,
      label,
      tokens: [account.nickname, account.tag, player?.name, player?.nickname],
    };
  });

  const fallbackCandidates = playersData.map((player: any) => ({
    id: Number(player.id) || 0,
    gameAccountId: Number(
      gameAccountsData.find((account: any) => Number(account.playerId) === Number(player.id))?.id,
    ) || 0,
    label: [player.name, player.nickname].filter(Boolean).join(" • ") || `Player #${player.id}`,
    tokens: [player.name, player.nickname],
  }));

  return [...linkedCandidates, ...fallbackCandidates];
};

const getTeamRosterCandidates = (
  teamsData: any[],
  teamParticipantsData: any[],
  playersData: any[],
  gameAccountsData: any[],
) => {
  const playerById = new Map<number, any>();
  playersData.forEach((player) => playerById.set(Number(player.id), player));

  const accountsByPlayerId = new Map<number, any[]>();
  gameAccountsData.forEach((account: any) => {
    const playerId = Number(account.playerId) || 0;
    if (!playerId) return;
    const list = accountsByPlayerId.get(playerId) ?? [];
    list.push(account);
    accountsByPlayerId.set(playerId, list);
  });

  const participantsByTeamId = new Map<number, any[]>();
  teamParticipantsData.forEach((participant: any) => {
    const teamId = Number(participant.teamId) || 0;
    if (!teamId) return;
    const list = participantsByTeamId.get(teamId) ?? [];
    list.push(participant);
    participantsByTeamId.set(teamId, list);
  });

  return teamsData.map((team: any) => {
    const participants = participantsByTeamId.get(Number(team.id)) ?? [];
    const tokens = participants.flatMap((participant: any) => {
      const player = playerById.get(Number(participant.playerId));
      const accounts = accountsByPlayerId.get(Number(participant.playerId)) ?? [];

      return [
        team.name,
        team.tag,
        player?.name,
        player?.nickname,
        ...accounts.flatMap((account: any) => [account.nickname, account.tag]),
      ].filter(Boolean);
    });

    const label = [team.name, team.tag].filter(Boolean).join(" • ") || `Time #${team.id}`;
    const rosterLabel = participants
      .slice(0, 5)
      .map((participant: any) => {
        const player = playerById.get(Number(participant.playerId));
        const accounts = accountsByPlayerId.get(Number(participant.playerId)) ?? [];
        return [
          player?.name,
          player?.nickname,
          ...accounts.flatMap((account: any) => [account.nickname, account.tag]),
        ]
          .filter(Boolean)
          .join(" / ");
      })
      .filter(Boolean)
      .join(", ");

    return {
      id: Number(team.id) || 0,
      label: label || `Time #${team.id}`,
      rosterLabel,
      tokens,
    };
  });
};

const getTeamPlayerRosterCandidates = (
  teamId: number,
  playersData: any[],
  gameAccountsData: any[],
  teamParticipantsData: any[],
) => {
  if (!teamId) return [];

  const playerById = new Map<number, any>();
  playersData.forEach((player) => playerById.set(Number(player.id), player));

  const accountsByPlayerId = new Map<number, any[]>();
  gameAccountsData.forEach((account: any) => {
    const playerId = Number(account.playerId) || 0;
    if (!playerId) return;
    const list = accountsByPlayerId.get(playerId) ?? [];
    list.push(account);
    accountsByPlayerId.set(playerId, list);
  });

  return teamParticipantsData
    .filter((participant: any) => Number(participant.teamId) === Number(teamId))
    .map((participant: any) => {
      const player = playerById.get(Number(participant.playerId));
      const accounts = accountsByPlayerId.get(Number(participant.playerId)) ?? [];
      const mainAccount = accounts[0] || null;
      const label = [
        player?.name,
        player?.nickname,
        mainAccount?.nickname,
        mainAccount?.tag ? `#${mainAccount.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • ");

      return {
        id: Number(player?.id) || Number(participant.playerId) || 0,
        gameAccountId: Number(mainAccount?.id) || Number(accounts[0]?.id) || 0,
        label: label || `Player #${participant.playerId}`,
        tokens: [
          player?.name,
          player?.nickname,
          mainAccount?.nickname,
          mainAccount?.tag,
        ].filter(Boolean),
      };
    })
    .filter((candidate: any) => candidate.id > 0);
};

const getTeamMatchScore = (team: AiTeamDraft, candidate: { tokens: string[] }) => {
  const playerTokens = (team.players || [])
    .flatMap((player) => [player.playerName, player.nickname, player.tag])
    .filter(Boolean)
    .join(" ");

  const baseScore = scoreMatch(team.teamName || "", candidate.tokens);
  const rosterScore = scoreMatch(playerTokens, candidate.tokens);
  const uniqueMentions = new Set(
    (team.players || [])
      .flatMap((player) => [player.playerName, player.nickname, player.tag])
      .filter(Boolean)
      .map((value) => normalize(value)),
  );
  const candidateTokens = candidate.tokens.map((value) => normalize(value));
  const hitCount = candidateTokens.filter((token) => token && uniqueMentions.has(token)).length;

  return baseScore + rosterScore + hitCount * 25;
};

function resolveDraft(
  draft: AiAnalysisDraft,
  teamsData: any[],
  playersData: any[],
  gameAccountsData: any[],
  teamParticipantsData: any[],
): ResolvedDraft {
  const teamCandidates = getTeamRosterCandidates(teamsData, teamParticipantsData, playersData, gameAccountsData);
  const resolvedTeams = (draft.teams || []).map((team) => {
    const bestTeam = teamCandidates
      .map((candidate) => ({
        ...candidate,
        score: getTeamMatchScore(team, candidate),
      }))
      .sort((a, b) => b.score - a.score)[0];

    const teamPlayerCandidates = bestTeam?.id
      ? getTeamPlayerRosterCandidates(bestTeam.id, playersData, gameAccountsData, teamParticipantsData)
      : [];

    const resolvedPlayers = (team.players || []).map((player) => {
      const bestCandidates = teamPlayerCandidates
        .map((candidate) => ({
          ...candidate,
          score: scoreMatch(
            [player.playerName, player.nickname, player.tag, player.characterName].filter(Boolean).join(" "),
            candidate.tokens,
          ),
        }))
        .sort((a, b) => b.score - a.score);

      const bestPlayer = bestCandidates[0];
      return {
        ...player,
        resolvedPlayerId: bestPlayer?.score >= 65 ? bestPlayer.id : 0,
        resolvedPlayerLabel: bestPlayer?.score >= 65 ? bestPlayer.label : "Sem vínculo",
        resolvedGameAccountId: bestPlayer?.score >= 65 ? bestPlayer.gameAccountId : 0,
        candidateOptions: bestCandidates.map((candidate) => ({
          id: candidate.id,
          label: candidate.label,
          gameAccountId: candidate.gameAccountId,
        })),
      };
    });

    return {
      ...team,
      teamName: team.teamName || (normalize(team.side) === "a" ? "Team A" : normalize(team.side) === "b" ? "Team B" : null),
      resolvedTeamId: bestTeam?.score >= 65 ? bestTeam.id : 0,
      resolvedTeamLabel: bestTeam?.score >= 65 ? bestTeam.label : "Sem vínculo",
      candidateOptions: teamCandidates.map((candidate) => ({
        id: candidate.id,
        label: candidate.label,
      })),
      rosterLabel: bestTeam?.rosterLabel || "",
      players: resolvedPlayers,
    };
  });

  const score = resolvedTeams
    .map((team) => {
      const side = normalize(team.side);
      return `${side}:${team.score ?? "-"}`;
    })
    .join(" | ");

  return {
    ...draft,
    teams: resolvedTeams,
    derivedScoreboard: score || "-",
  };
}

function AiPlayerRow({
  player,
  teamId,
  playersData,
  gameAccountsData,
  teamParticipantsData,
  usedPlayerIds,
  onChange,
}: {
  player: ResolvedPlayerDraft;
  teamId: number;
  playersData: any[];
  gameAccountsData: any[];
  teamParticipantsData: any[];
  usedPlayerIds: number[];
  onChange: (patch: Partial<ResolvedPlayerDraft>) => void;
}) {
  const playerOptions = useMemo(
    () => getTeamPlayerRosterCandidates(teamId, playersData, gameAccountsData, teamParticipantsData),
    [teamId, playersData, gameAccountsData, teamParticipantsData],
  );

  return (
    <Collapsible className="rounded-lg border border-white/10 bg-black/20">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left">
        <div className="min-w-0">
          <div className="text-sm font-display uppercase italic text-white">
            {player.playerName || player.nickname || "Jogador"}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 truncate">
            {player.resolvedPlayerLabel}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/45">
          <span>K/D/A {player.kills ?? 0}/{player.deaths ?? 0}/{player.assists ?? 0}</span>
          <span className="text-white/25">▼</span>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-3">
        <div className="grid gap-3">
          <div className="grid gap-2 md:grid-cols-[110px_1fr]">
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">Jogador do time</div>
              <Select
                value={player.resolvedPlayerId ? String(player.resolvedPlayerId) : "unlinked"}
                onValueChange={(value) => {
                  if (value === "unlinked") {
                    onChange({
                      resolvedPlayerId: 0,
                      resolvedGameAccountId: 0,
                      resolvedPlayerLabel: "Sem vínculo",
                    });
                    return;
                  }

                  const selectedId = Number(value) || 0;
                  const selectedCandidate = playerOptions.find((candidate) => Number(candidate.id) === selectedId);
                  onChange({
                    resolvedPlayerId: selectedId,
                    resolvedGameAccountId: Number(selectedCandidate?.gameAccountId) || 0,
                    resolvedPlayerLabel: selectedCandidate?.label || "Sem vínculo",
                  });
                }}
              >
                <SelectTrigger className="h-10 border-input bg-black/40">
                  <SelectValue
                    placeholder={
                      teamId
                        ? playerOptions.length > 0
                          ? "Selecionar jogador..."
                          : "Sem jogadores vinculados"
                        : "Defina o time primeiro"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlinked">Sem vínculo</SelectItem>
                  {playerOptions.map((candidate) => (
                    <SelectItem
                      key={`${candidate.id}-${candidate.gameAccountId}`}
                      value={String(candidate.id)}
                      disabled={usedPlayerIds.includes(Number(candidate.id)) && Number(candidate.id) !== Number(player.resolvedPlayerId)}
                    >
                      {candidate.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">Vínculo</div>
              <div className="mt-1 text-xs text-white/70">{player.resolvedPlayerLabel}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">K</div>
              <Input type="number" value={player.kills ?? ""} onChange={(e) => onChange({ kills: toNumber(e.target.value) })} />
            </div>
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">D</div>
              <Input type="number" value={player.deaths ?? ""} onChange={(e) => onChange({ deaths: toNumber(e.target.value) })} />
            </div>
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">A</div>
              <Input type="number" value={player.assists ?? ""} onChange={(e) => onChange({ assists: toNumber(e.target.value) })} />
            </div>
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">ACS</div>
              <Input type="number" value={player.acs ?? ""} onChange={(e) => onChange({ acs: toNumber(e.target.value) })} />
            </div>
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">ADR</div>
              <Input type="number" value={player.adr ?? ""} onChange={(e) => onChange({ adr: toNumber(e.target.value) })} />
            </div>
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">HS%</div>
              <Input type="number" value={player.hsPercentage ?? ""} onChange={(e) => onChange({ hsPercentage: toNumber(e.target.value) })} />
            </div>
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">KAST</div>
              <Input type="number" value={player.kast ?? ""} onChange={(e) => onChange({ kast: toNumber(e.target.value) })} />
            </div>
            <div className="rounded-md border border-white/5 bg-white/5 p-2">
              <div className="text-[9px] uppercase tracking-widest text-white/30">FK</div>
              <Input type="number" value={player.firstKills ?? ""} onChange={(e) => onChange({ firstKills: toNumber(e.target.value) })} />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AiMatchTab({
  token,
  teamsData,
  playersData,
  gameAccountsData,
  matchTeamsData,
  tournamentsData,
  stagesData,
  statusesData,
  gamesData,
  matchesData,
  teamMatchStatsData,
  playerMatchStatsData,
  matchLineupsData,
  matchLineupPlayersData,
  teamParticipantsData,
}: AiMatchTabProps) {
  const queryClient = useQueryClient();
  const apiMatches = useApiController("Matches");
  const apiMatchTeams = useApiController("Matchteams");
  const apiTeamMatchStats = useApiController("TeamMatchStats");
  const apiPlayerMatchStats = useApiController("PlayerMatchStats");
  const apiMatchLineups = useApiController("MatchLineups");
  const apiMatchLineupPlayers = useApiController("MatchLineupPlayers");

  const [mode, setMode] = useState<AiMode>("existing");
  const [selectedTournamentId, setSelectedTournamentId] = useState(0);
  const [selectedMatchId, setSelectedMatchId] = useState(0);
  const [matchMeta, setMatchMeta] = useState(emptyMatchMeta);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResolvedDraft | null>(null);
  const [bracketAnalysis, setBracketAnalysis] = useState<ResolvedBracketDraft | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageFile = (file: File | null) => {
    setImageFile(file);
  };

  const matchesForSelectedTournament = useMemo(() => {
    const base = selectedTournamentId
      ? matchesData.filter((match: any) => Number(match.tournamentId) === Number(selectedTournamentId))
      : matchesData;
    return [...base].sort((a: any, b: any) => {
      const ta = new Date(a.startedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.startedAt || b.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [matchesData, selectedTournamentId]);

  const selectedMatch = useMemo(
    () => matchesData.find((match: any) => Number(match.id) === Number(selectedMatchId)),
    [matchesData, selectedMatchId],
  );

  const selectedTournament = useMemo(
    () => tournamentsData.find((candidate: any) => Number(candidate.id) === Number(selectedTournamentId)),
    [selectedTournamentId, tournamentsData],
  );

  const selectedTournamentBracketType = String(
    selectedTournament?.bracketType || selectedTournament?.format || "",
  ).toLowerCase();

  const scheduledStatusId = useMemo(
    () =>
      statusesData.find((status: any) => {
        const label = String(status?.name || status?.title || "").toLowerCase();
        return ["agend", "abert", "penden"].some((term) => label.includes(term));
      })?.id || Number(statusesData[0]?.id) || 0,
    [statusesData],
  );

  const activeStatusId = useMemo(
    () =>
      statusesData.find((status: any) => {
        const label = String(status?.name || status?.title || "").toLowerCase();
        return ["ativo", "andam", "progres", "curso", "abert"].some((term) => label.includes(term));
      })?.id || scheduledStatusId,
    [scheduledStatusId, statusesData],
  );

  const finishedStatusId = useMemo(
    () =>
      statusesData.find((status: any) => {
        const label = String(status?.name || status?.title || "").toLowerCase();
        return ["encerr", "conclu", "finaliz"].some((term) => label.includes(term));
      })?.id || scheduledStatusId,
    [scheduledStatusId, statusesData],
  );

  useEffect(() => {
    if (!selectedMatch) return;

    setMatchMeta({
      tournamentId: Number(selectedMatch.tournamentId) || 0,
      stageId: Number(selectedMatch.stageId) || 0,
      statusId: Number(selectedMatch.statusId) || 0,
      gameId: Number(selectedMatch.gameId) || 0,
      bestOf: Number(selectedMatch.bestOf) || 1,
      startedAt: selectedMatch.startedAt ? String(selectedMatch.startedAt).slice(0, 16) : "",
      finishedAt: selectedMatch.finishedAt ? String(selectedMatch.finishedAt).slice(0, 16) : "",
    });

    if (!selectedTournamentId) {
      setSelectedTournamentId(Number(selectedMatch.tournamentId) || 0);
    }
  }, [selectedMatch, selectedTournamentId]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const clipboardItems = Array.from(event.clipboardData?.items || []);
      const imageItem = clipboardItems.find((item) => item.type.startsWith("image/"));

      if (!imageItem) return;

      const target = event.target as HTMLElement | null;
      const isTextField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        Boolean(target?.closest("[contenteditable='true']"));

      if (isTextField && target?.closest("textarea, input, [contenteditable='true']")) {
        event.preventDefault();
      } else {
        event.preventDefault();
      }

      const file = imageItem.getAsFile();
      if (!file) return;

      handleImageFile(new File([file], file.name || `clipboard-${Date.now()}.${file.type.split("/")[1] || "png"}`, { type: file.type || "image/png" }));
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const updateTeam = (index: number, patch: Partial<ResolvedTeamDraft>) => {
    setAnalysis((current) => {
      if (!current) return current;
      const teams = [...current.teams];
      const nextTeam = { ...teams[index], ...patch } as ResolvedTeamDraft;

      if (Object.prototype.hasOwnProperty.call(patch, "isWinner") && patch.isWinner) {
        teams.forEach((team, teamIndex) => {
          if (teamIndex !== index) {
            teams[teamIndex] = { ...team, isWinner: false } as ResolvedTeamDraft;
          }
        });
      }

      teams[index] = nextTeam;
      return { ...current, teams };
    });
  };

  const updatePlayer = (teamIndex: number, playerIndex: number, patch: Partial<ResolvedPlayerDraft>) => {
    setAnalysis((current) => {
      if (!current) return current;
      const teams = [...current.teams];
      const team = { ...teams[teamIndex] };
      const players = [...team.players];
      players[playerIndex] = { ...players[playerIndex], ...patch } as ResolvedPlayerDraft;
      team.players = players;
      teams[teamIndex] = team;
      return { ...current, teams };
    });
  };

  const updateBracketMatch = (index: number, patch: Partial<ResolvedBracketMatchDraft>) => {
    setBracketAnalysis((current) => {
      if (!current) return current;
      const matches = [...current.matches];
      matches[index] = { ...matches[index], ...patch } as ResolvedBracketMatchDraft;
      return { ...current, matches };
    });
  };

  const analyzeImage = async () => {
    if (!imageFile) {
      toast.error("Envie uma imagem antes de analisar.");
      return;
    }

    if ((mode === "new" || mode === "bracket") && !selectedTournamentId) {
      toast.error("Selecione um campeonato antes de analisar.");
      return;
    }

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("imagem", imageFile);
      formData.append("prompt", prompt);
      formData.append("mode", mode);
      if (selectedTournamentId) formData.append("tournamentId", String(selectedTournamentId));
      if (selectedMatchId) formData.append("matchId", String(selectedMatchId));

      const response = await ApiService.postImage("api/AiMatchAnalysis/analyze", formData);
      const draft = response?.draft || response?.result?.draft || response?.result || null;
      if (!draft) {
        throw new Error("A IA não retornou um rascunho válido.");
      }

      if (mode === "bracket") {
        const resolved = resolveBracketDraft(draft);
        setBracketAnalysis(resolved);
        setAnalysis(null);
        if (prompt !== defaultBracketPrompt) {
          setPrompt(defaultBracketPrompt);
        }
      } else {
        const resolved = resolveDraft(draft, teamsData, playersData, gameAccountsData, teamParticipantsData);
        setAnalysis(resolved);
        setBracketAnalysis(null);

        if (mode === "new") {
          setMatchMeta((current) => ({
            ...current,
            tournamentId: selectedTournamentId || current.tournamentId,
            bestOf: Number(draft.bestOf) || current.bestOf || 1,
            startedAt: draft.startedAt ? String(draft.startedAt).slice(0, 16) : current.startedAt,
            finishedAt: draft.finishedAt ? String(draft.finishedAt).slice(0, 16) : current.finishedAt,
          }));
        }
      }

      toast.success("Imagem analisada.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao analisar a imagem.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTeamMatchStatsRecord = (teamId: number, matchId: number) =>
    teamMatchStatsData.find(
      (entry: any) =>
        Number(entry.teamId) === Number(teamId) && Number(entry.matchId) === Number(matchId),
    );

  const getPlayerMatchStatsRecord = (playerId: number, matchId: number) =>
    playerMatchStatsData.find(
      (entry: any) =>
        Number(entry.playerId) === Number(playerId) && Number(entry.matchId) === Number(matchId),
    );

  const getMatchLineupRecord = (matchId: number, teamId: number) =>
    matchLineupsData.find(
      (entry: any) => Number(entry.matchId) === Number(matchId) && Number(entry.teamId) === Number(teamId),
    );

  const getMatchLineupPlayerRecord = (matchLineupId: number, playerId: number) =>
    matchLineupPlayersData.find(
      (entry: any) =>
        Number(entry.matchLineupId) === Number(matchLineupId) && Number(entry.playerId) === Number(playerId),
    );

  const getBracketMatchRecord = (position: string) =>
    matchesData.find(
      (entry: any) =>
        Number(entry.tournamentId) === Number(selectedTournamentId) &&
        String(entry.bracketPosition || "").toUpperCase() === String(position || "").toUpperCase(),
    );

  const getBracketStageId = (position: string) => {
    const phaseKey = String(position || "").split("-")[0].toLowerCase();
    const hints: Record<string, string[]> = {
      qf: ["quart", "quarter"],
      sf: ["semi"],
      f: ["final"],
      lb: ["lower", "repesc", "desemp"],
      ub: ["upper", "cima", "superior"],
    };

    const tournamentStages = stagesData.filter((candidate: any) => {
      const candidateTournamentId = Number(candidate?.tournamentId) || 0;
      return !candidateTournamentId || candidateTournamentId === Number(selectedTournamentId);
    });

    const stagePool = tournamentStages.length > 0 ? tournamentStages : stagesData;
    const stage = stagePool.find((candidate: any) => {
      const label = String(candidate?.name || candidate?.title || "").toLowerCase();
      return (hints[phaseKey] || []).some((hint) => label.includes(hint));
    });

    return Number(stage?.id) || Number(stagePool[0]?.id) || 0;
  };

  const buildTeamCandidates = (teamName: string | null | undefined) => {
    const candidates = getTeamRosterCandidates(teamsData, teamParticipantsData, playersData, gameAccountsData);
    return candidates
      .map((candidate) => ({
        ...candidate,
        score: scoreMatch(teamName || "", candidate.tokens),
      }))
      .sort((a, b) => b.score - a.score);
  };

  const createEmptyBracketMatch = (matchNumber: number): ResolvedBracketMatchDraft => ({
    matchNumber,
    bracketPosition: `JOGO ${matchNumber}`,
    roundLabel: matchNumber <= 3
      ? "Upper - Round 1"
      : matchNumber <= 8
        ? "Upper - Mid Bracket"
        : matchNumber <= 13
          ? "Lower / Final"
          : null,
    teamAName: null,
    teamBName: null,
    winnerTeamName: null,
    teamAScore: null,
    teamBScore: null,
    bestOf: null,
    status: null,
    resolvedTeamAId: 0,
    resolvedTeamALabel: "Sem vínculo",
    resolvedTeamBId: 0,
    resolvedTeamBLabel: "Sem vínculo",
    resolvedWinnerTeamId: 0,
    resolvedWinnerTeamLabel: "Sem vínculo",
    teamACandidateOptions: [],
    teamBCandidateOptions: [],
    winnerCandidateOptions: [],
  });

  const resolveBracketDraft = (draft: AiBracketAnalysisDraft): ResolvedBracketDraft => {
    const draftMatches = draft.matches || [];
    const byNumber = new Map<number, AiBracketMatchDraft>();
    const byKey = new Map<string, AiBracketMatchDraft>();

    draftMatches.forEach((match) => {
      const matchNumber = Number(match.matchNumber) || 0;
      if (matchNumber > 0) byNumber.set(matchNumber, match);
      const key = normalizeBracketKey(match.bracketPosition);
      if (key) byKey.set(key, match);
    });

    const orderedMatches = Array.from({ length: DEFAULT_BRACKET_MATCH_COUNT }, (_, index) => {
      const matchNumber = index + 1;
      return byNumber.get(matchNumber) || byKey.get(normalizeBracketKey(`JOGO ${matchNumber}`)) || createEmptyBracketMatch(matchNumber);
    });

    const resolvedMatches = orderedMatches.map((match) => {
      const teamACandidates = buildTeamCandidates(match.teamAName);
      const teamBCandidates = buildTeamCandidates(match.teamBName);
      const winnerCandidates = buildTeamCandidates(match.winnerTeamName);
      const bestTeamA = teamACandidates[0];
      const bestTeamB = teamBCandidates[0];
      const bestWinner = winnerCandidates[0];

      return {
        ...match,
        resolvedTeamAId: bestTeamA?.score >= 65 ? bestTeamA.id : 0,
        resolvedTeamALabel: bestTeamA?.score >= 65 ? bestTeamA.label : "Sem vínculo",
        resolvedTeamBId: bestTeamB?.score >= 65 ? bestTeamB.id : 0,
        resolvedTeamBLabel: bestTeamB?.score >= 65 ? bestTeamB.label : "Sem vínculo",
        resolvedWinnerTeamId: bestWinner?.score >= 65 ? bestWinner.id : 0,
        resolvedWinnerTeamLabel: bestWinner?.score >= 65 ? bestWinner.label : "Sem vínculo",
        teamACandidateOptions: teamACandidates.slice(0, 5).map((candidate) => ({
          id: candidate.id,
          label: candidate.label,
        })),
        teamBCandidateOptions: teamBCandidates.slice(0, 5).map((candidate) => ({
          id: candidate.id,
          label: candidate.label,
        })),
        winnerCandidateOptions: winnerCandidates.slice(0, 5).map((candidate) => ({
          id: candidate.id,
          label: candidate.label,
        })),
      } as ResolvedBracketMatchDraft;
    });

    return {
      ...draft,
      matches: resolvedMatches,
      resolvedTournamentLabel:
        tournamentsData.find((candidate: any) => Number(candidate.id) === Number(selectedTournamentId))
          ?.name || "Campeonato selecionado",
    };
  };

  const saveDraft = async () => {
    if (mode === "bracket") {
      if (!bracketAnalysis) {
        toast.error("Análise do chaveamento ainda não disponível.");
        return;
      }

      if (!selectedTournamentId) {
        toast.error("Selecione um campeonato para preencher o chaveamento.");
        return;
      }

      const validMatches = bracketAnalysis.matches.filter(
        (match) => match.bracketPosition && match.resolvedTeamAId > 0 && match.resolvedTeamBId > 0,
      );

      if (validMatches.length === 0) {
        toast.error("Resolva ao menos uma partida do chaveamento antes de salvar.");
        return;
      }

      try {
        setIsSaving(true);

        const gameId = Number(selectedTournament?.gameId) || Number(gamesData[0]?.id) || 0;
        if (!gameId) {
          throw new Error("Selecione um jogo válido para salvar o chaveamento.");
        }

        for (const match of validMatches) {
          const bracketPosition = String(match.bracketPosition || "").trim();
          if (!bracketPosition) continue;

          const existingMatch = getBracketMatchRecord(bracketPosition);
          const teamAId = Number(match.resolvedTeamAId) || 0;
          const teamBId = Number(match.resolvedTeamBId) || 0;
          const winnerTeamId = Number(match.resolvedWinnerTeamId) || 0;
          const stageId = Number(existingMatch?.stageId) || getBracketStageId(bracketPosition);
          const statusId = winnerTeamId ? finishedStatusId : activeStatusId;
          const bestOf = Number(match.bestOf) || Number(existingMatch?.bestOf) || 1;
          const startedAt = existingMatch?.startedAt || new Date().toISOString();
          const finishedAt = winnerTeamId ? existingMatch?.finishedAt || new Date().toISOString() : null;

          const matchPayload = {
            id: Number(existingMatch?.id) || 0,
            stageId,
            tournamentId: Number(selectedTournamentId),
            statusId,
            winnerTeamId,
            gameId,
            bestOf,
            bracketPosition,
            startedAt,
            finishedAt,
            teamAId,
            teamBId,
            updatedAt: new Date().toISOString(),
          };

          const persistedMatch = existingMatch
            ? await apiMatches.update(Number(existingMatch.id), matchPayload)
            : await apiMatches.create(matchPayload);

          const persistedMatchId = Number(
            (persistedMatch as any)?.result?.id || (persistedMatch as any)?.id || existingMatch?.id || 0,
          );

          if (!persistedMatchId) {
            throw new Error(`Não foi possível salvar a partida ${bracketPosition}.`);
          }

          const existingMatchTeamA = matchTeamsData.find(
            (entry: any) =>
              Number(entry.matchId) === Number(persistedMatchId) &&
              Number(entry.teamId) === Number(teamAId),
          );
          const existingMatchTeamB = matchTeamsData.find(
            (entry: any) =>
              Number(entry.matchId) === Number(persistedMatchId) &&
              Number(entry.teamId) === Number(teamBId),
          );

          await Promise.all(
            [
              {
                existing: existingMatchTeamA,
                teamId: teamAId,
                side: "A",
                score: match.teamAScore,
                isWinner: winnerTeamId === teamAId,
              },
              {
                existing: existingMatchTeamB,
                teamId: teamBId,
                side: "B",
                score: match.teamBScore,
                isWinner: winnerTeamId === teamBId,
              },
            ].map(async (entry) => {
              const payload = {
                id: Number(entry.existing?.id) || 0,
                matchId: persistedMatchId,
                teamId: entry.teamId,
                side: entry.side,
                score: entry.score === null || entry.score === undefined ? null : Number(entry.score),
                isWinner: Boolean(entry.isWinner),
              };

              return entry.existing
                ? apiMatchTeams.update(Number(entry.existing.id), payload)
                : apiMatchTeams.create(payload);
            }),
          );
        }

        queryClient.invalidateQueries({ queryKey: ["matches", token] });
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["match-teams", token] });
        queryClient.invalidateQueries({ queryKey: ["match-teams"] });
        queryClient.invalidateQueries({ queryKey: ["bracket-matches", token, selectedTournamentId] });
        toast.success("Chaveamento preenchido com sucesso.");
      } catch (error: any) {
        toast.error(error.message || "Erro ao aplicar o chaveamento.");
      } finally {
        setIsSaving(false);
      }

      return;
    }

    if (!analysis) {
      toast.error("Análise ainda não disponível.");
      return;
    }

    if (mode === "new") {
      if (!matchMeta.tournamentId || !matchMeta.stageId || !matchMeta.statusId || !matchMeta.gameId) {
        toast.error("Preencha campeonato, stage, status e jogo para criar a partida.");
        return;
      }
    } else if (!selectedMatchId) {
      toast.error("Selecione uma partida existente para atualizar.");
      return;
    }

    try {
      setIsSaving(true);

      const resolvedTeams = analysis.teams.filter((team) => team.resolvedTeamId > 0);
      if (resolvedTeams.length < 2) {
        throw new Error("É necessário resolver os dois times antes de salvar.");
      }

      const sideA = resolvedTeams.find((team) => normalize(team.side) === "a") || resolvedTeams[0];
      const sideB = resolvedTeams.find((team) => normalize(team.side) === "b") || resolvedTeams[1];
      const winner = resolvedTeams.find((team) => team.isWinner) || sideA;

      const baseMatch = mode === "existing" && selectedMatch
        ? selectedMatch
        : {
            tournamentId: matchMeta.tournamentId,
            stageId: matchMeta.stageId,
            statusId: matchMeta.statusId,
            gameId: matchMeta.gameId,
            bestOf: matchMeta.bestOf,
            startedAt: matchMeta.startedAt,
            finishedAt: matchMeta.finishedAt,
          };

      const matchPayload = {
        ...(mode === "existing" && selectedMatch ? selectedMatch : {}),
        tournamentId: Number(baseMatch.tournamentId) || selectedTournamentId || 0,
        stageId: Number(baseMatch.stageId) || 0,
        statusId: Number(baseMatch.statusId) || 0,
        winnerTeamId: Number(winner?.resolvedTeamId) || 0,
        teamAId: Number(sideA?.resolvedTeamId) || 0,
        teamBId: Number(sideB?.resolvedTeamId) || 0,
        gameId: Number(baseMatch.gameId) || 0,
        bestOf: Number(baseMatch.bestOf) || 1,
        startedAt: toIsoTimestamp(baseMatch.startedAt),
        finishedAt: toIsoTimestamp(baseMatch.finishedAt),
        updatedAt: new Date().toISOString(),
      };

      const persistedMatch = mode === "existing"
        ? await apiMatches.update(Number(selectedMatchId), matchPayload)
        : await apiMatches.create(matchPayload);

      if (persistedMatch === false) {
        throw new Error("Não foi possível salvar a partida.");
      }

      const persistedMatchId = Number((persistedMatch as any)?.result?.id || (persistedMatch as any)?.id || selectedMatchId);

      await Promise.all(
        [sideA, sideB].map(async (team) => {
          const teamPayload = {
            id: Number(getTeamMatchStatsRecord(team.resolvedTeamId, persistedMatchId)?.id) || 0,
            teamId: Number(team.resolvedTeamId) || 0,
            matchId: persistedMatchId,
            roundsWon: Number(team.roundsWon ?? team.score ?? 0) || 0,
            roundsLost: Number(team.roundsLost ?? (resolvedTeams.find((entry) => entry !== team)?.score ?? 0)) || 0,
            plants: Number(team.plants) || 0,
            defuses: Number(team.defuses) || 0,
          };

          const existingStats = getTeamMatchStatsRecord(team.resolvedTeamId, persistedMatchId);
          return existingStats
            ? apiTeamMatchStats.update(Number(existingStats.id), teamPayload)
            : apiTeamMatchStats.create(teamPayload);
        }),
      );

      await Promise.all(
        [sideA, sideB].map(async (team) => {
          const existingMatchTeam = matchTeamsData.find(
            (entry: any) =>
              Number(entry.matchId) === Number(persistedMatchId) &&
              Number(entry.teamId) === Number(team.resolvedTeamId),
          );

          const matchTeamPayload = {
            id: Number(existingMatchTeam?.id) || 0,
            matchId: persistedMatchId,
            teamId: Number(team.resolvedTeamId) || 0,
            side: team.side || null,
            score: team.score === null || team.score === undefined ? null : Number(team.score),
            isWinner: Boolean(team.isWinner),
          };

          return existingMatchTeam
            ? apiMatchTeams.update(Number(existingMatchTeam.id), matchTeamPayload)
            : apiMatchTeams.create(matchTeamPayload);
        }),
      );

      await Promise.all(
        [sideA, sideB].map(async (team) => {
          const lineupPayload = {
            id: Number(getMatchLineupRecord(persistedMatchId, team.resolvedTeamId)?.id) || 0,
            matchId: persistedMatchId,
            teamId: Number(team.resolvedTeamId) || 0,
            matchMapId: null,
            status: "confirmed",
            source: "ai",
            submittedByUserId: null,
            lockedAt: new Date().toISOString(),
          };

          const existingLineup = getMatchLineupRecord(persistedMatchId, team.resolvedTeamId);
          const savedLineup = existingLineup
            ? await apiMatchLineups.update(Number(existingLineup.id), lineupPayload)
            : await apiMatchLineups.create(lineupPayload);

          const lineupId = Number((savedLineup as any)?.result?.id || (savedLineup as any)?.id || existingLineup?.id || 0);
          if (!lineupId) return null;

          const existingLineupPlayers = matchLineupPlayersData.filter(
            (entry: any) => Number(entry.matchLineupId) === Number(lineupId),
          );
          const draftPlayerIds = new Set<number>();

          await Promise.all(
            team.players.map(async (player) => {
              if (!player.resolvedPlayerId) return null;
              draftPlayerIds.add(Number(player.resolvedPlayerId));

              const lineupPlayerPayload = {
                id: Number(getMatchLineupPlayerRecord(lineupId, player.resolvedPlayerId)?.id) || 0,
                matchLineupId: lineupId,
                playerId: Number(player.resolvedPlayerId) || 0,
                gameAccountId: Number(player.resolvedGameAccountId) || null,
                roleId: null,
                isStarter: true,
                isCaptain: false,
                isSubstitute: false,
              };

              const existingLineupPlayer = getMatchLineupPlayerRecord(lineupId, player.resolvedPlayerId);
              return existingLineupPlayer
                ? apiMatchLineupPlayers.update(Number(existingLineupPlayer.id), lineupPlayerPayload)
                : apiMatchLineupPlayers.create(lineupPlayerPayload);
            }),
          );

          await Promise.all(
            existingLineupPlayers
              .filter((entry: any) => !draftPlayerIds.has(Number(entry.playerId)))
              .map((entry: any) => apiMatchLineupPlayers.deleteRecord(Number(entry.id))),
          );

          return null;
        }),
      );

      await Promise.all(
        resolvedTeams.flatMap((team) =>
          team.players
            .filter((player) => player.resolvedPlayerId)
            .map(async (player) => {
              const existingStats = getPlayerMatchStatsRecord(player.resolvedPlayerId, persistedMatchId);
              const payload = {
                id: Number(existingStats?.id) || 0,
                playerId: Number(player.resolvedPlayerId) || 0,
                gameAccountId: Number(player.resolvedGameAccountId) || null,
                matchId: persistedMatchId,
                matchMapId: null,
                kills: Number(player.kills) || 0,
                deaths: Number(player.deaths) || 0,
                assists: Number(player.assists) || 0,
                adr: Number(player.adr) || 0,
                hsPercentage: Number(player.hsPercentage) || 0,
                firstKills: Number(player.firstKills) || 0,
                kast: Number(player.kast) || 0,
                acs: Number(player.acs) || 0,
                roleName: player.roleName || null,
                characterName: player.characterName || null,
                statsJson: null,
              };

              return existingStats
                ? apiPlayerMatchStats.update(Number(existingStats.id), payload)
                : apiPlayerMatchStats.create(payload);
            }),
        ),
      );

      toast.success(mode === "existing" ? "Partida atualizada pelo rascunho da IA." : "Partida criada pelo rascunho da IA.");

      queryClient.invalidateQueries({ queryKey: ["matches", token] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["match-teams", token] });
      queryClient.invalidateQueries({ queryKey: ["match-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-match-stats", token] });
      queryClient.invalidateQueries({ queryKey: ["team-match-stats"] });
      queryClient.invalidateQueries({ queryKey: ["player-match-stats", token] });
      queryClient.invalidateQueries({ queryKey: ["player-match-stats"] });
      queryClient.invalidateQueries({ queryKey: ["match-lineups", token] });
      queryClient.invalidateQueries({ queryKey: ["match-lineups"] });
      queryClient.invalidateQueries({ queryKey: ["match-lineup-players", token] });
      queryClient.invalidateQueries({ queryKey: ["match-lineup-players"] });
    } catch (error: any) {
      toast.error(error.message || "Erro ao aplicar o rascunho.");
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = mode === "bracket"
    ? Boolean(bracketAnalysis) && !isAnalyzing && !isSaving
    : Boolean(analysis) && !isAnalyzing && !isSaving;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-2xl uppercase italic font-black text-white leading-none">
              Análise com <span className="text-primary">IA</span>
            </h3>

          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="grid gap-2">
              <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                Modo
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                value={mode}
                onChange={(e) => {
                  const nextMode = e.target.value as AiMode;
                  setMode(nextMode);
                  if (nextMode === "new") setSelectedMatchId(0);
                  if (nextMode === "bracket") {
                    setSelectedMatchId(0);
                    setPrompt(defaultBracketPrompt);
                  } else if (prompt === defaultBracketPrompt) {
                    setPrompt(defaultPrompt);
                  }
                }}
              >
                <option value="existing">Atualizar partida existente</option>
                <option value="new">Criar nova partida</option>
                <option value="bracket">Preencher chaveamento</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                Campeonato
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                value={selectedTournamentId || ""}
                onChange={(e) => setSelectedTournamentId(Number(e.target.value) || 0)}
              >
                <option value="">Selecionar...</option>
                {tournamentsData.map((tournament: any) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>

            {mode === "existing" ? (
              <div className="grid gap-2">
                <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                  Partida
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                  value={selectedMatchId || ""}
                  onChange={(e) => setSelectedMatchId(Number(e.target.value) || 0)}
                >
                  <option value="">Selecionar...</option>
                  {matchesForSelectedTournament.map((match: any) => (
                    <option key={match.id} value={match.id}>
                      #{match.id} • {match.bestOf ? `MD${match.bestOf}` : "MD?"} •{" "}
                      {match.winnerTeamId ? `Vencedor #${match.winnerTeamId}` : "sem vencedor"}
                    </option>
                  ))}
                </select>
              </div>
            ) : mode === "new" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                    Stage
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                    value={matchMeta.stageId || ""}
                    onChange={(e) => setMatchMeta({ ...matchMeta, stageId: Number(e.target.value) || 0 })}
                  >
                    <option value="">Selecionar...</option>
                    {stagesData.map((stage: any) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                    Status
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                    value={matchMeta.statusId || ""}
                    onChange={(e) =>
                      setMatchMeta({ ...matchMeta, statusId: Number(e.target.value) || 0 })
                    }
                  >
                    <option value="">Selecionar...</option>
                    {statusesData.map((status: any) => (
                      <option key={status.id} value={status.id}>
                        {status.name || status.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                    Jogo
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                    value={matchMeta.gameId || ""}
                    onChange={(e) => setMatchMeta({ ...matchMeta, gameId: Number(e.target.value) || 0 })}
                  >
                    <option value="">Selecionar...</option>
                    {gamesData.map((game: any) => (
                      <option key={game.id} value={game.id}>
                        {game.name || game.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                    Melhor de
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={matchMeta.bestOf}
                    onChange={(e) => setMatchMeta({ ...matchMeta, bestOf: Number(e.target.value) || 1 })}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs uppercase tracking-widest text-white/50">
                Modo de chaveamento ativo. Selecione o campeonato e envie o bracket completo para preencher
                os slots do torneio.
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                Prompt
              </label>
              <Textarea
                rows={8}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Escreva o prompt de análise"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                Imagem
              </label>
              <div className="border border-dashed border-white/15 bg-black/20 rounded-xl p-4 flex flex-col gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files?.[0] || null)}
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full rounded-lg border border-white/10 object-cover"
                  />
                ) : (
                  <div className="text-xs text-white/40">
                    Envie um print da partida para análise.
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => {
                handleImageFile(null);
                setAnalysis(null);
                setBracketAnalysis(null);
                setSelectedMatchId(0);
                setMatchMeta(emptyMatchMeta);
              }}>
                Limpar
              </Button>
              <Button type="button" onClick={() => void analyzeImage()} disabled={isAnalyzing}>
                {isAnalyzing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analisar
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mode === "bracket" ? (
            !bracketAnalysis ? (
              <div className="border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/50">
                Envie a imagem e rode a análise para gerar o rascunho do chaveamento.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-primary/70">
                        Bracket da IA
                      </div>
                      <div className="font-display text-lg uppercase italic text-white">
                        {bracketAnalysis.tournamentName || selectedTournament?.name || "Chaveamento analisado"}
                      </div>
                    </div>
                    <div className="text-xs text-white/60">
                      Confiança: {bracketAnalysis.confidence ?? "n/a"}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-white/50">
                    {bracketAnalysis.warnings.length > 0 ? bracketAnalysis.warnings.join(" • ") : "Sem avisos."}
                  </div>
                  <div className="mt-3 text-[11px] uppercase tracking-widest text-white/40">
                    Tipo do bracket: {bracketAnalysis.bracketType || selectedTournamentBracketType || "n/a"}
                  </div>
                </div>

                <div className="grid gap-4">
                  {bracketAnalysis.matches
                    .slice()
                    .sort((a, b) => Number(a.matchNumber) - Number(b.matchNumber))
                    .map((match, matchIndex) => (
                    <div key={`${match.bracketPosition || matchIndex}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-white/40">
                            {match.roundLabel || "Round"}
                          </div>
                          <div className="text-sm font-display uppercase italic text-white">
                            {match.bracketPosition || `JOGO ${match.matchNumber || matchIndex + 1}`}
                          </div>
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40">
                          Status: {match.status || "n/a"}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-[1fr_1fr_1fr] gap-3">
                        <div className="rounded-md border border-white/5 bg-black/20 p-3 space-y-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Time A</div>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                            value={match.resolvedTeamAId || ""}
                            onChange={(e) =>
                              updateBracketMatch(matchIndex, {
                                resolvedTeamAId: Number(e.target.value) || 0,
                              })
                            }
                          >
                            <option value="">Selecionar time...</option>
                            {match.teamACandidateOptions.map((candidate) => (
                              <option key={candidate.id} value={candidate.id}>
                                {candidate.label}
                              </option>
                            ))}
                          </select>
                          <div className="text-[10px] uppercase tracking-widest text-white/35">
                            {match.resolvedTeamALabel}
                          </div>
                        </div>

                        <div className="rounded-md border border-white/5 bg-black/20 p-3 space-y-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Winner</div>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                            value={match.resolvedWinnerTeamId || ""}
                            onChange={(e) =>
                              updateBracketMatch(matchIndex, {
                                resolvedWinnerTeamId: Number(e.target.value) || 0,
                              })
                            }
                          >
                            <option value="">Selecionar vencedor...</option>
                            {[
                              {
                                id: match.resolvedTeamAId,
                                label: match.resolvedTeamALabel,
                              },
                              {
                                id: match.resolvedTeamBId,
                                label: match.resolvedTeamBLabel,
                              },
                            ]
                              .filter((candidate) => candidate.id > 0)
                              .map((candidate) => (
                                <option key={candidate.id} value={candidate.id}>
                                  {candidate.label}
                                </option>
                              ))}
                          </select>
                          <div className="text-[10px] uppercase tracking-widest text-white/35">
                            {match.resolvedWinnerTeamLabel}
                          </div>
                        </div>

                        <div className="rounded-md border border-white/5 bg-black/20 p-3 space-y-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Time B</div>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                            value={match.resolvedTeamBId || ""}
                            onChange={(e) =>
                              updateBracketMatch(matchIndex, {
                                resolvedTeamBId: Number(e.target.value) || 0,
                              })
                            }
                          >
                            <option value="">Selecionar time...</option>
                            {match.teamBCandidateOptions.map((candidate) => (
                              <option key={candidate.id} value={candidate.id}>
                                {candidate.label}
                              </option>
                            ))}
                          </select>
                          <div className="text-[10px] uppercase tracking-widest text-white/35">
                            {match.resolvedTeamBLabel}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Score A</div>
                          <Input
                            type="number"
                            value={match.teamAScore ?? ""}
                            onChange={(e) => updateBracketMatch(matchIndex, { teamAScore: toNumber(e.target.value) })}
                          />
                        </div>
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Score B</div>
                          <Input
                            type="number"
                            value={match.teamBScore ?? ""}
                            onChange={(e) => updateBracketMatch(matchIndex, { teamBScore: toNumber(e.target.value) })}
                          />
                        </div>
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Best of</div>
                          <Input
                            type="number"
                            value={match.bestOf ?? ""}
                            onChange={(e) => updateBracketMatch(matchIndex, { bestOf: toNumber(e.target.value) })}
                          />
                        </div>
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Round</div>
                          <Input
                            value={match.roundLabel || ""}
                            onChange={(e) => updateBracketMatch(matchIndex, { roundLabel: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setBracketAnalysis(null)}>
                    Descartar rascunho
                  </Button>
                  <Button type="button" onClick={() => void saveDraft()} disabled={!canSave}>
                    <Check className="mr-2 h-4 w-4" />
                    Aplicar chaveamento
                  </Button>
                </div>
              </div>
            )
          ) : !analysis ? (
            <div className="border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/50">
              Envie a imagem e rode a análise para gerar o rascunho da partida.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-primary/70">
                      Rascunho da IA
                    </div>
                    <div className="font-display text-lg uppercase italic text-white">
                      {analysis.matchName || analysis.mapName || "Partida analisada"}
                    </div>
                  </div>
                  <div className="text-xs text-white/60">
                    Confiança: {analysis.confidence ?? "n/a"}
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/50">
                  {analysis.warnings.length > 0 ? analysis.warnings.join(" • ") : "Sem avisos."}
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-widest text-white/40">
                  Scoreboard derivado: {analysis.derivedScoreboard}
                </div>
              </div>

              <div className="grid gap-4">
                {analysis.teams.map((team, teamIndex) => (
                  <div key={`${team.side || teamIndex}-${teamIndex}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                    <div className="grid md:grid-cols-[1fr_auto] gap-3 items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <TeamLogo
                            team={{
                              name: team.resolvedTeamLabel,
                              tag: team.teamName?.slice(0, 3) || "IA",
                              bannerColor: "#f86d83",
                            }}
                            size={34}
                          />
                          <div>
                            <div className="text-sm font-display uppercase italic">{team.teamName || "Time sem nome"}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">
                              {team.resolvedTeamLabel}
                            </div>
                            {team.rosterLabel ? (
                              <div className="mt-1 text-[10px] uppercase tracking-widest text-white/25">
                                {team.rosterLabel}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm"
                          value={team.resolvedTeamId || ""}
                          onChange={(e) => updateTeam(teamIndex, { resolvedTeamId: Number(e.target.value) || 0 })}
                        >
                          <option value="">Selecionar time...</option>
                          {team.candidateOptions.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {candidate.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full md:w-[260px]">
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Score</div>
                          <Input
                            type="number"
                            value={team.score ?? ""}
                            onChange={(e) => updateTeam(teamIndex, { score: toNumber(e.target.value) })}
                          />
                        </div>
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Winner</div>
                          <Input
                            type="checkbox"
                            className="h-4 w-4 mt-2"
                            checked={Boolean(team.isWinner)}
                            onChange={(e) => updateTeam(teamIndex, { isWinner: e.target.checked })}
                          />
                        </div>
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Rounds Won</div>
                          <Input
                            type="number"
                            value={team.roundsWon ?? ""}
                            onChange={(e) => updateTeam(teamIndex, { roundsWon: toNumber(e.target.value) })}
                          />
                        </div>
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Rounds Lost</div>
                          <Input
                            type="number"
                            value={team.roundsLost ?? ""}
                            onChange={(e) => updateTeam(teamIndex, { roundsLost: toNumber(e.target.value) })}
                          />
                        </div>
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Plants</div>
                          <Input
                            type="number"
                            value={team.plants ?? ""}
                            onChange={(e) => updateTeam(teamIndex, { plants: toNumber(e.target.value) })}
                          />
                        </div>
                        <div className="rounded-md border border-white/5 bg-black/20 p-2">
                          <div className="text-[9px] uppercase tracking-widest text-white/30">Defuses</div>
                          <Input
                            type="number"
                            value={team.defuses ?? ""}
                            onChange={(e) => updateTeam(teamIndex, { defuses: toNumber(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {team.players.map((player, playerIndex) => (
                        <div key={`${player.nickname || "player"}-${playerIndex}`}>
                          <AiPlayerRow
                            player={player}
                            teamId={team.resolvedTeamId}
                            playersData={playersData}
                            gameAccountsData={gameAccountsData}
                            teamParticipantsData={teamParticipantsData}
                            usedPlayerIds={team.players
                              .map((candidate) => Number(candidate.resolvedPlayerId) || 0)
                              .filter((id) => id > 0 && id !== Number(player.resolvedPlayerId))}
                            onChange={(patch) => updatePlayer(teamIndex, playerIndex, patch)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAnalysis(null)}>
                  Descartar rascunho
                </Button>
                <Button type="button" onClick={() => void saveDraft()} disabled={!canSave}>
                  <Check className="mr-2 h-4 w-4" />
                  Aplicar rascunho
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
