import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { StatusBadge } from "@/components/sga/StatusBadge";
import {
  Trophy,
  Users,
  Swords,
  Activity,
  Image as Img,
  Film,
  Plus,
  Search,
  Upload,
  Trash2,
  Pencil,
  ShieldAlert,
  ChevronRight,
  Crown,
  Save,
  Eye,
} from "lucide-react";
import { StatsCard } from "@/components/sga/StatsCard";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import useApiController from "../API/controler";
import ApiService from "../API/service";
import { motion } from "framer-motion";
import { formatDateBR } from "@/lib/dateUtils";
import { AiMatchTab } from "@/components/admin/AiMatchTab";

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
  { k: "chaveamentos", label: "Chaveamentos" },
  { k: "monitoramento", label: "Monitoramento Ao Vivo" },
  { k: "highlights", label: "Highlights" },
  { k: "galeria", label: "Galeria" },
  { k: "ia", label: "IA" },
] as const;

  const createEmptyPlayer = () => ({
    name: "",
    avatarUrl: "https://picsum.photos/seed/sga/200/200",
    userId: 0,
    isProfilePublic: true,
    kills: 0,
    deaths: 0,
    assists: 0,
    adr: 0,
    hsPercentage: 0,
    firstKills: 0,
    kast: 0,
    acs: 0,
  });

const createEmptyTeam = () => ({
  name: "",
  description: "",
  tag: "",
  logoUrl: "",
  bannerColor: "#f86d83",
  gameId: 0,
  elo: 0,
});

const createEmptyTeamMatchStats = () => ({
  id: 0,
  teamId: 0,
  matchId: 0,
  roundsWon: 0,
  roundsLost: 0,
  plants: 0,
  defuses: 0,
});

const createEmptyTeamParticipant = () => ({
  roleId: 0,
  playerId: 0,
  isActive: true,
  isStarter: true,
  isCaptain: false,
  isSubstitute: false,
});

const createEmptyTeamParticipantDraft = () => ({
  id: 0,
  roleId: 0,
  playerId: 0,
  playerName: "",
  roleName: "",
  isActive: true,
  isStarter: true,
  isCaptain: false,
  isSubstitute: false,
  joinedAt: "",
  leftAt: null as string | null,
});

const createEmptyTournament = () => ({
  name: "",
  description: "",
  bannerUrl:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
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
  teamAId: 0,
  teamBId: 0,
  gameId: 0,
  bestOf: 1,
  startedAt: "",
  finishedAt: "",
});

const BRACKET_UPPER_ROUNDS = [
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

const BRACKET_LOWER_ROUNDS = [
  {
    key: "lower-r1",
    title: "04. Lower Bracket - Round 1",
    accentClass: "text-valorant",
    lineClass: "bg-valorant/40",
    cardClass: "bg-valorant/5 border-valorant/10 hover:border-valorant/40",
    positions: ["LB-1", "LB-2"],
  },
  {
    key: "lower-r2",
    title: "05. Lower Bracket - Round 2",
    accentClass: "text-cs2",
    lineClass: "bg-cs2/40",
    cardClass: "bg-cs2/5 border-cs2/10 hover:border-cs2/40",
    positions: ["LB-3", "LB-4"],
  },
  {
    key: "lower-final",
    title: "06. Lower Final",
    accentClass: "text-primary",
    lineClass: "bg-primary/40",
    cardClass: "bg-primary/5 border-primary/10 hover:border-primary/40",
    positions: ["LB-F"],
  },
] as const;

const BRACKET_PROGRESS_MAP: Record<
  string,
  { nextPosition: string; teamField: "teamAId" | "teamBId" }
> = {
  "QF-1": { nextPosition: "SF-1", teamField: "teamAId" },
  "QF-2": { nextPosition: "SF-1", teamField: "teamBId" },
  "QF-3": { nextPosition: "SF-2", teamField: "teamAId" },
  "QF-4": { nextPosition: "SF-2", teamField: "teamBId" },
  "SF-1": { nextPosition: "F-1", teamField: "teamAId" },
  "SF-2": { nextPosition: "F-1", teamField: "teamBId" },
  "LB-1": { nextPosition: "LB-3", teamField: "teamAId" },
  "LB-2": { nextPosition: "LB-4", teamField: "teamAId" },
  "LB-3": { nextPosition: "LB-F", teamField: "teamAId" },
  "LB-4": { nextPosition: "LB-F", teamField: "teamBId" },
};

const BRACKET_LOSER_PROGRESS_MAP: Record<
  string,
  { nextPosition: string; teamField: "teamAId" | "teamBId" }
> = {
  "QF-1": { nextPosition: "LB-1", teamField: "teamAId" },
  "QF-2": { nextPosition: "LB-1", teamField: "teamBId" },
  "QF-3": { nextPosition: "LB-2", teamField: "teamAId" },
  "QF-4": { nextPosition: "LB-2", teamField: "teamBId" },
  "SF-1": { nextPosition: "LB-3", teamField: "teamBId" },
  "SF-2": { nextPosition: "LB-4", teamField: "teamBId" },
};

const BRACKET_PHASE_LABELS: Record<string, string> = {
  QF: "Quartas de Final",
  SF: "Semifinal",
  F: "Final",
  LB: "Lower Bracket",
};

const BRACKET_STAGE_HINTS: Record<string, string[]> = {
  QF: ["quart", "quarter"],
  SF: ["semi", "semi-final", "semifinal"],
  F: ["final"],
  LB: ["lower", "loser", "repesc", "repech"],
};

type AdminBracketRound = {
  key: string;
  title: string;
  accentClass: string;
  lineClass: string;
  cardClass: string;
  positions: readonly string[];
};

type AdminBracketPositionedMatch = {
  position: string;
  roundIndex: number;
  positionIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

const ADMIN_BRACKET_CARD_WIDTH = 290;
const ADMIN_BRACKET_FINAL_CARD_WIDTH = 360;
const ADMIN_BRACKET_CARD_HEIGHT = 420; 
const ADMIN_BRACKET_FINAL_CARD_HEIGHT = 320; 
const ADMIN_BRACKET_COLUMN_GAP = 155;
const ADMIN_BRACKET_ROW_GAP = 600; 
const ADMIN_BRACKET_SECTION_PADDING_X = 130;
const ADMIN_BRACKET_SECTION_PADDING_Y = 92;
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

const toDateTimeLocalValue = (value?: string | Date | null) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

type HeaderBarProps = {
  create: string;
  q: string;
  setQ: Dispatch<SetStateAction<string>>;
  onCreate?: () => void;
  onUpload?: () => void;
};

function HeaderBar({ create, q, setQ, onCreate, onUpload }: HeaderBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filtrar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-8"
        />
      </div>
      <Button variant="outline" onClick={onUpload || (() => {})}>
        <Upload className="h-4 w-4 mr-1" /> Upload
      </Button>
      <Button
        className="bg-neon shadow-neon"
        onClick={
          onCreate ||
          (create.includes("partida")
            ? () => undefined
            : () => undefined)
        }
      >
        <Plus className="h-4 w-4 mr-1" /> {create}
      </Button>
    </div>
  );
}

function buildAdminBracketLayout(rounds: readonly AdminBracketRound[]) {
  const boardTopOffset = 66;
  const positioned: AdminBracketPositionedMatch[] = [];
  const roundLayouts = rounds.map((round, roundIndex) => {
    const isFinalRound = round.key === "final" || round.key === "lower-final";
    const cardWidth = isFinalRound ? ADMIN_BRACKET_FINAL_CARD_WIDTH : ADMIN_BRACKET_CARD_WIDTH;
    const cardHeight = isFinalRound ? ADMIN_BRACKET_FINAL_CARD_HEIGHT : ADMIN_BRACKET_CARD_HEIGHT;
    const columnWidth = isFinalRound ? 400 : 330;

    return {
      key: round.key,
      title: round.title,
      accentClass: round.accentClass,
      lineClass: round.lineClass,
      cardClass: round.cardClass,
      roundIndex,
      isFinalRound,
      cardWidth,
      cardHeight,
      columnWidth,
      x: ADMIN_BRACKET_SECTION_PADDING_X + roundIndex * (columnWidth + ADMIN_BRACKET_COLUMN_GAP),
    };
  });

  for (const round of roundLayouts) {
    for (
      let positionIndex = 0;
      positionIndex < rounds[round.roundIndex]!.positions.length;
      positionIndex += 1
    ) {
      const position = rounds[round.roundIndex]!.positions[positionIndex]!;
      let centerY =
        positionIndex * (round.cardHeight + ADMIN_BRACKET_ROW_GAP) + round.cardHeight / 2;

      if (round.roundIndex > 0) {
        const prevRound = roundLayouts[round.roundIndex - 1];
        const prevA = positioned.find(
          (item) =>
            item.roundIndex === round.roundIndex - 1 && item.positionIndex === positionIndex * 2,
        );
        const prevB = positioned.find(
          (item) =>
            item.roundIndex === round.roundIndex - 1 &&
            item.positionIndex === positionIndex * 2 + 1,
        );

        if (prevA && prevB) {
          centerY = (prevA.y + prevA.height / 2 + prevB.y + prevB.height / 2) / 2;
        } else if (prevA) {
          centerY = prevA.y + prevA.height / 2;
        } else if (prevB) {
          centerY = prevB.y + prevB.height / 2;
        }

        if (
          prevRound?.roundIndex === round.roundIndex - 1 &&
          rounds[prevRound.roundIndex]!.positions.length === 1
        ) {
          const prev = positioned.find((item) => item.roundIndex === round.roundIndex - 1);
          if (prev) centerY = prev.y + prev.height / 2;
        }
      }

      positioned.push({
        position,
        roundIndex: round.roundIndex,
        positionIndex,
        x: round.x,
        y: boardTopOffset + centerY - round.cardHeight / 2,
        width: round.cardWidth,
        height: round.cardHeight,
      });
    }
  }

  const width =
    roundLayouts.reduce((max, round) => Math.max(max, round.x + round.cardWidth), 0) +
    ADMIN_BRACKET_SECTION_PADDING_X;
  const height =
    positioned.reduce((max, item) => Math.max(max, item.y + item.height), 0) +
    ADMIN_BRACKET_SECTION_PADDING_Y;

  return { positioned, roundLayouts, width, height };
}

function AdminBracketMatchCard({
  match,
  position,
  positionIndex,
  isLower,
  isFinalRound,
  cardClass,
  getTeamById,
  draggingTeam,
  previewSlotKey,
  setPreviewSlotKey,
  setDraggingTeamId,
  handleBracketDrop,
  handleBracketRemove,
  handleMatchWinner,
  handleEditMatch,
  getBracketPhaseLabel,
  getTournamentStatusLabel,
  getTeamLabel,
}: {
  match: any;
  position: string;
  positionIndex: number;
  isLower: boolean;
  isFinalRound: boolean;
  cardClass: string;
  getTeamById: (id: number) => any;
  draggingTeam: any;
  previewSlotKey: string | null;
  setPreviewSlotKey: Dispatch<SetStateAction<string | null>>;
  setDraggingTeamId: Dispatch<SetStateAction<number | null>>;
  handleBracketDrop: (
    position: string,
    teamField: "teamAId" | "teamBId",
    teamId: number,
  ) => Promise<void>;
  handleBracketRemove: (position: string, teamField: "teamAId" | "teamBId") => Promise<void>;
  handleMatchWinner: (position: string, teamField: "teamAId" | "teamBId") => Promise<void>;
  handleEditMatch: (match: any) => void;
  getBracketPhaseLabel: (position: string) => string;
  getTournamentStatusLabel: (statusId: number) => string;
  getTeamLabel: (teamId: number) => string;
}) {
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
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
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
      className={`min-h-[44px] border px-3 py-2 transition-all duration-300 relative ${
        team
          ? "border-white/10 bg-black/40"
          : "border-dashed border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]"
      } ${
        previewSlotKey === `${position}:${teamField}` && draggingTeam
          ? "border-primary bg-primary/10 ring-1 ring-primary/20"
          : ""
      } ${matchIsLocked ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <div className="mb-1 text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
        {label}
      </div>
      {previewSlotKey === `${position}:${teamField}` && draggingTeam ? (
        <div className="flex items-center gap-3 opacity-80">
          <TeamLogo
            team={{
              tag: draggingTeam.tag || draggingTeam.name?.slice(0, 3) || "SGA",
              bannerColor: "#f86d83",
            }}
            size={28}
          />
          <div className="min-w-0">
            <div className="truncate font-display text-sm uppercase italic text-white">
              {draggingTeam.name}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-primary animate-pulse">Sync_Preview</div>
          </div>
        </div>
      ) : team ? (
        <div className="flex items-center gap-3">
          <TeamLogo
            team={{
              tag: team.tag || team.name?.slice(0, 3) || "SGA",
              bannerColor: "#f86d83",
            }}
            size={28}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-sm uppercase italic text-white">
              {team.name}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-white/35">
              {team.tag || "Sem tag"}
            </div>
          </div>
          {!matchIsLocked && (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/45 hover:border-destructive/40 hover:text-destructive"
              onClick={() => void handleBracketRemove(position, teamField)}
            >
              <Trash2 className="h-3 w-3" />
              Remover
            </button>
          )}
        </div>
      ) : (
        <div className="text-xs text-white/35">
          {matchIsLocked ? "Partida encerrada" : "Arraste um time para este slot"}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`relative border transition-all duration-500 group/match ${isFinalRound ? "p-6" : "p-5"} ${cardClass} shadow-xl hover:shadow-2xl`}
      style={{
        minWidth: isFinalRound ? ADMIN_BRACKET_FINAL_CARD_WIDTH : ADMIN_BRACKET_CARD_WIDTH,
        minHeight: isFinalRound ? ADMIN_BRACKET_FINAL_CARD_HEIGHT : ADMIN_BRACKET_CARD_HEIGHT,
        background: 'linear-gradient(145deg, rgba(10,10,12,0.95), rgba(6,7,10,0.95))',
      }}
    >
      {/* Tech Corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10 group-hover/match:border-primary/40 transition-colors" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/10 group-hover/match:border-primary/40 transition-colors" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[8px] font-black uppercase tracking-widest text-white/30">
            JOGO {positionIndex + 1}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-white/20">
            {getBracketPhaseLabel(position)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {match?.statusId ? (
            <StatusBadge status={getTournamentStatusLabel(match.statusId)} />
          ) : (
            <span className="text-[9px] uppercase tracking-widest text-white/25">Pendente</span>
          )}
          <Save className="h-3 w-3 text-white/10" />
        </div>
      </div>

      <div className="space-y-2">
        {renderDropSlot("teamAId", "Slot A", teamA)}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[7px] font-black italic tracking-tighter text-white/10">
            VERSUS
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        {renderDropSlot("teamBId", "Slot B", teamB)}
      </div>

      <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
        <div className="text-[9px] font-black uppercase tracking-[0.35em] italic text-white/30">
          Quem ganhou?
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            disabled={!teamA || !teamB || matchIsLocked}
            onClick={() => void handleMatchWinner(position, "teamAId")}
            className={`justify-start py-2 text-xs ${
              Number(match?.winnerTeamId) === Number(match?.teamAId) && teamA
                ? "border-primary bg-primary/10 text-white"
                : ""
            }`}
          >
            {teamA ? teamA.name : "Aguardando Time A"}
          </Button>
          <Button
            variant="outline"
            disabled={!teamA || !teamB || matchIsLocked}
            onClick={() => void handleMatchWinner(position, "teamBId")}
            className={`justify-start py-2 text-xs ${
              Number(match?.winnerTeamId) === Number(match?.teamBId) && teamB
                ? "border-primary bg-primary/10 text-white"
                : ""
            }`}
          >
            {teamB ? teamB.name : "Aguardando Time B"}
          </Button>
        </div>

        {Number(match?.winnerTeamId) > 0 && (
          <div className="text-xs text-white/55">
            Avançando:{" "}
            <span className="font-display uppercase italic text-white">
              {getTeamLabel(Number(match.winnerTeamId))}
            </span>
          </div>
        )}

        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full text-xs"
            disabled={!match}
            onClick={() => match && handleEditMatch(match)}
          >
            <Pencil className="h-3.5 w-3.5 mr-2" /> Editar partida
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminBracketSection({
  title,
  subtitle,
  rounds,
  isLower,
  effectiveBracketMatchMap,
  getTeamById,
  draggingTeam,
  previewSlotKey,
  setPreviewSlotKey,
  setDraggingTeamId,
  handleBracketDrop,
  handleBracketRemove,
  handleMatchWinner,
  handleEditMatch,
  getBracketPhaseLabel,
  getTournamentStatusLabel,
  getTeamLabel,
}: {
  title: string;
  subtitle: string;
  rounds: readonly AdminBracketRound[];
  isLower: boolean;
  effectiveBracketMatchMap: Map<any, any>;
  getTeamById: (id: number) => any;
  draggingTeam: any;
  previewSlotKey: string | null;
  setPreviewSlotKey: Dispatch<SetStateAction<string | null>>;
  setDraggingTeamId: Dispatch<SetStateAction<number | null>>;
  handleBracketDrop: (
    position: string,
    teamField: "teamAId" | "teamBId",
    teamId: number,
  ) => Promise<void>;
  handleBracketRemove: (position: string, teamField: "teamAId" | "teamBId") => Promise<void>;
  handleMatchWinner: (position: string, teamField: "teamAId" | "teamBId") => Promise<void>;
  handleEditMatch: (match: any) => void;
  getBracketPhaseLabel: (position: string) => string;
  getTournamentStatusLabel: (statusId: number) => string;
  getTeamLabel: (teamId: number) => string;
}) {
  const layout = useMemo(() => buildAdminBracketLayout(rounds), [rounds]);
  const boardWidth = layout.width;

  const lines = useMemo(() => {
    const result: Array<{
      key: string;
      points: string;
      stroke: string;
      strokeWidth: number;
      opacity: number;
    }> = [];

    for (const item of layout.positioned) {
      const next = layout.positioned.find(
        (candidate) =>
          candidate.roundIndex === item.roundIndex + 1 &&
          candidate.positionIndex === Math.floor(item.positionIndex / 2),
      );

      if (!next) continue;

      const childX = item.x + item.width;
      const childY = item.y + item.height / 2;
      const parentX = next.x;
      const parentY = next.y + next.height / 2;
      const middleX = childX + ADMIN_BRACKET_COLUMN_GAP / 2;

      result.push({
        key: `${item.position}-${next.position}`,
        points: [
          `${childX},${childY}`,
          `${middleX},${childY}`,
          `${middleX},${parentY}`,
          `${parentX},${parentY}`,
        ].join(" "),
        stroke: isLower ? "rgba(255,255,255,0.15)" : "rgba(248,109,131,0.25)",
        strokeWidth: 2,
        opacity: 1,
      });
    }

    return result;
  }, [isLower, layout.positioned]);

  return (
    <section className="rounded-none border border-white/5 bg-[#0a0a0c]/80 p-8 md:p-12 relative overflow-hidden backdrop-blur-md">
      {/* Background Decor */}
      <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none" />
      
      <div className="mb-12 flex items-end gap-6 relative z-10">
        <div className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 italic shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
          {isLower ? "LB" : "UB"}
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
            {title} <span className="text-primary/60">{subtitle}</span>
          </h3>
          <div className="h-0.5 w-12 bg-primary/40" />
        </div>
        <div className="h-px flex-1 bg-white/5 mb-2" />
      </div>

      <div className="relative max-h-[75vh] w-full overflow-x-auto overflow-y-auto pb-6 pr-4 custom-scrollbar">
        <div className="relative" style={{ width: boardWidth, height: layout.height + 30 }}>
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox={`0 0 ${boardWidth} ${layout.height + 30}`}
            preserveAspectRatio="none"
          >
            {lines.map((line) => (
              <polyline
                key={line.key}
                points={line.points}
                fill="none"
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                strokeLinecap="square"
                strokeLinejoin="miter"
                opacity={line.opacity}
              />
            ))}
          </svg>

          {layout.roundLayouts.map((round) => (
            <div
              key={round.key}
              className={`absolute whitespace-nowrap text-[18px] font-black uppercase tracking-tight ${round.accentClass}`}
              style={{
                left: round.x + round.cardWidth / 2,
                top: 4,
                transform: "translateX(-50%) translateY(-100%)",
              }}
            >
              {round.title}
            </div>
          ))}

          {layout.positioned.map((item) => {
            const round = layout.roundLayouts[item.roundIndex]!;
            const match = effectiveBracketMatchMap.get(item.position) as any;

            return (
              <div
                key={item.position}
                className="absolute"
                style={{ left: item.x, top: item.y, width: item.width }}
              >
                <AdminBracketMatchCard
                  match={match}
                  position={item.position}
                  positionIndex={item.positionIndex}
                  isLower={isLower}
                  isFinalRound={round.isFinalRound}
                  cardClass={round.cardClass}
                  getTeamById={getTeamById}
                  draggingTeam={draggingTeam}
                  previewSlotKey={previewSlotKey}
                  setPreviewSlotKey={setPreviewSlotKey}
                  setDraggingTeamId={setDraggingTeamId}
                  handleBracketDrop={handleBracketDrop}
                  handleBracketRemove={handleBracketRemove}
                  handleMatchWinner={handleMatchWinner}
                  handleEditMatch={handleEditMatch}
                  getBracketPhaseLabel={getBracketPhaseLabel}
                  getTournamentStatusLabel={getTournamentStatusLabel}
                  getTeamLabel={getTeamLabel}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Admin() {
  const user = useAuth((s) => s.user);
  const isAdmin = useAuth((s) => s.isAdmin);
  const token = useAuth((s) => s.token);
  const nav = useNavigate();

  console.log("[SGA DEBUG] Usuário atual:", user?.email, "| Cargo:", user?.role);

  // Gerenciamento de estado local para UI e filtros.
  // Em produção, 'page' e 'q' poderiam ser movidos para a URL (Search Params)
  // para permitir que o usuário compartilhe links de busca.
  const [tab, setTab] = useState<(typeof tabs)[number]["k"] | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const shouldLoadTab = (keys: Array<(typeof tabs)[number]["k"]>) => tab !== null && keys.includes(tab);

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
  const [editTeamMatchStatsDraft, setEditTeamMatchStatsDraft] = useState(
    createEmptyTeamMatchStats(),
  );
  const [editTeamParticipants, setEditTeamParticipants] = useState<
    Array<ReturnType<typeof createEmptyTeamParticipantDraft>>
  >([createEmptyTeamParticipantDraft()]);
  const [editPlayerDraft, setEditPlayerDraft] = useState(createEmptyPlayer());
  const [editPlayerStatsMatchId, setEditPlayerStatsMatchId] = useState(0);
  const [editMatchDraft, setEditMatchDraft] = useState(createEmptyMatch());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; entity: string } | null>(null);

  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState(createEmptyPlayer());
  const [draggingTeamId, setDraggingTeamId] = useState<number | null>(null);
  const [previewSlotKey, setPreviewSlotKey] = useState<string | null>(null);
  const [optimisticBracketSlots, setOptimisticBracketSlots] = useState<
    Record<string, Record<string, any>>
  >({});
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

  // Sincronização Global via TanStack Query
  const { data: tr, isLoading: l1 } = useQuery({
    queryKey: ["tournaments", token],
    queryFn: () => apiTournaments.getAll(),
    enabled: !!token && shouldLoadTab(["campeonatos", "chaveamentos", "ia"]),
  });
  const { data: pr, isLoading: l2 } = useQuery({
    queryKey: ["players", token],
    queryFn: () => apiPlayers.getAll(),
    enabled: !!token && shouldLoadTab(["times", "jogadores", "ia"]),
  });
  const { data: ter, isLoading: l3 } = useQuery({
    queryKey: ["teams", token],
    queryFn: () => apiTeams.getAll(),
    enabled: !!token && shouldLoadTab(["times", "chaveamentos", "ia"]),
  });
  const { data: rr } = useQuery({
    queryKey: ["roles", token],
    queryFn: () => apiRoles.getAll(),
    enabled: !!token && shouldLoadTab(["times", "ia"]),
  });
  const { data: tpr } = useQuery({
    queryKey: ["team-participants", token],
    queryFn: () => apiTeamParticipants.getAll(),
    enabled: !!token && shouldLoadTab(["times", "jogadores", "ia"]),
  });
  const { data: pmsr } = useQuery({
    queryKey: ["player-match-stats", token],
    queryFn: () => apiPlayerMatchStats.getAll(),
    enabled: !!token && shouldLoadTab(["jogadores", "ia"]),
  });
  const { data: tmsr } = useQuery({
    queryKey: ["team-match-stats", token],
    queryFn: () => apiTeamMatchStats.getAll(),
    enabled: !!token && shouldLoadTab(["times", "ia"]),
  });
  const { data: ur } = useQuery({
    queryKey: ["users", token],
    queryFn: () => apiUsers.getAll(),
    enabled: !!token && shouldLoadTab(["jogadores", "ia"]),
  });
  const { data: garc } = useQuery({
    queryKey: ["game-accounts", token],
    queryFn: () => apiGameAccounts.getAll(),
    enabled: !!token && shouldLoadTab(["ia"]),
  });
  const { data: gar } = useQuery({
    queryKey: ["games", token],
    queryFn: () => apiGames.getAll(),
    enabled: !!token && shouldLoadTab(["campeonatos", "times", "ia"]),
  });
  const { data: str } = useQuery({
    queryKey: ["stages", token],
    queryFn: () => apiStages.getAll(),
    enabled: !!token && shouldLoadTab(["chaveamentos", "ia"]),
  });
  const { data: sr, isLoading: lStatus } = useQuery({
    queryKey: ["statuses", token],
    queryFn: () => apiStatus.getAll(),
    enabled: !!token && shouldLoadTab(["campeonatos", "monitoramento", "chaveamentos", "ia"]),
  });
  const { data: mr, isLoading: l4 } = useQuery({
    queryKey: ["matches", token],
    queryFn: () => apiMatches.getAll(),
    enabled: !!token && shouldLoadTab(["chaveamentos", "monitoramento", "ia"]),
  });
  const { data: mtr } = useQuery({
    queryKey: ["match-teams", token],
    queryFn: () => apiMatchTeams.getAll(),
    enabled: !!token && shouldLoadTab(["ia"]),
  });
  const { data: mlar } = useQuery({
    queryKey: ["match-lineups", token],
    queryFn: () => apiMatchLineups.getAll(),
    enabled: !!token && shouldLoadTab(["ia"]),
  });
  const { data: mlpar } = useQuery({
    queryKey: ["match-lineup-players", token],
    queryFn: () => apiMatchLineupPlayers.getAll(),
    enabled: !!token && shouldLoadTab(["ia"]),
  });
  const { data: hr } = useQuery({
    queryKey: ["highlights", token],
    queryFn: () => apiHighlights.getAll(),
    enabled: !!token && shouldLoadTab(["highlights"]),
  });
  const { data: gr } = useQuery({
    queryKey: ["gallery", token],
    queryFn: () => apiGallery.getAll(),
    enabled: !!token && shouldLoadTab(["galeria"]),
  });

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
  const playerMatchStatsData = useMemo(() => parse(pmsr), [pmsr]);
  const teamMatchStatsData = useMemo(() => parse(tmsr), [tmsr]);
  const usersData = useMemo(() => parse(ur), [ur]);
  const gameAccountsData = useMemo(() => parse(garc), [garc]);
  const gamesData = useMemo(() => parse(gar), [gar]);
  const stagesData = useMemo(() => parse(str), [str]);
  const statusesData = useMemo(() => parse(sr), [sr]);
  const matchesData = useMemo(() => parse(mr), [mr]);
  const matchTeamsData = useMemo(() => parse(mtr), [mtr]);
  const matchLineupsData = useMemo(() => parse(mlar), [mlar]);
  const matchLineupPlayersData = useMemo(() => parse(mlpar), [mlpar]);
  const highlightsData = useMemo(() => parse(hr), [hr]);
  const galleryData = useMemo(() => parse(gr), [gr]);

  const linkedUserIds = useMemo(
    () => new Set(playersData.map((player: any) => Number(player.userId)).filter(Boolean)),
    [playersData],
  );

  const selectedUser = useMemo(
    () => usersData.find((candidate: any) => Number(candidate.id) === Number(newPlayer.userId)),
    [newPlayer.userId, usersData],
  );

  const availableRoles = useMemo(
    () =>
      rolesData.filter((role: any) => !teamGameId || Number(role.gameId) === Number(teamGameId)),
    [rolesData, teamGameId],
  );

  const editAvailableRoles = useMemo(
    () =>
      rolesData.filter(
        (role: any) => !editTeamGameId || Number(role.gameId) === Number(editTeamGameId),
      ),
    [rolesData, editTeamGameId],
  );

  const linkedPlayerIdsInDraft = useMemo(
    () =>
      new Set(teamParticipants.map((participant) => Number(participant.playerId)).filter(Boolean)),
    [teamParticipants],
  );

  const linkedPlayerIdsInEditDraft = useMemo(
    () =>
      new Set(
        editTeamParticipants.map((participant) => Number(participant.playerId)).filter(Boolean),
      ),
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
        const player = playersData.find(
          (candidate: any) => Number(candidate.id) === Number(participant.playerId),
        );
        const role = rolesData.find(
          (candidate: any) => Number(candidate.id) === Number(participant.roleId),
        );

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
    const tournament = tournamentsData.find(
      (candidate: any) => Number(candidate.id) === Number(tournamentId),
    );
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

      const current = map.get(playerId) || {
        kills: 0,
        deaths: 0,
        assists: 0,
        kda: 0,
      };

      current.kills += Number(stat?.kills) || 0;
      current.deaths += Number(stat?.deaths) || 0;
      current.assists += Number(stat?.assists) || 0;
      current.kda = (current.kills + current.assists) / Math.max(current.deaths, 1);
      map.set(playerId, current);
    }

    return map;
  }, [playerMatchStatsData]);

  const getPlayerTeam = (playerId: number) => {
    const participant = teamParticipantsData.find(
      (candidate: any) => Number(candidate.playerId) === Number(playerId),
    );
    if (!participant) return null;
    return teamsData.find((candidate: any) => Number(candidate.id) === Number(participant.teamId)) || null;
  };

  const getPlayerTeamId = (playerId: number) => {
    const participant = teamParticipantsData.find(
      (candidate: any) => Number(candidate.playerId) === Number(playerId),
    );
    return Number(participant?.teamId) || 0;
  };

  const getLatestMatchForTeam = (teamId: number) => {
    return [...matchesData]
      .filter(
        (match: any) =>
          Number(match.teamAId) === Number(teamId) || Number(match.teamBId) === Number(teamId),
      )
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
      (entry: any) =>
        Number(entry.teamId) === Number(teamId) && Number(entry.matchId) === Number(matchId),
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
          playersData.find(
            (candidate: any) => Number(candidate.id) === Number(participant.playerId),
          )?.name ||
          participant.player?.name ||
          "",
        roleName:
          rolesData.find((candidate: any) => Number(candidate.id) === Number(participant.roleId))
            ?.name ||
          participant.role?.name ||
          "",
        isActive: Boolean(participant.isActive),
        isStarter: Boolean(participant.isStarter),
        isCaptain: Boolean(participant.isCaptain),
        isSubstitute: Boolean(participant.isSubstitute),
        joinedAt: participant.joinedAt || "",
        leftAt: participant.leftAt || null,
      }));

    setEditTeamParticipants(
      currentParticipants.length > 0 ? currentParticipants : [createEmptyTeamParticipantDraft()],
    );
    setEditTeamRosterHydrated(true);
  }, [
    editingEntity?.type,
    editingTeamId,
    editTeamRosterHydrated,
    teamParticipantsData,
    playersData,
    rolesData,
  ]);

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
        queryClient.invalidateQueries({ queryKey: ["tournaments", token] });
        queryClient.invalidateQueries({ queryKey: ["tournaments"] });
        queryClient.invalidateQueries({ queryKey: ["matches", token] });
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
        queryClient.invalidateQueries({ queryKey: ["teams", token] });
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["team-match-stats", token] });
        queryClient.invalidateQueries({ queryKey: ["team-match-stats"] });
        queryClient.invalidateQueries({ queryKey: ["team-participants", token] });
        queryClient.invalidateQueries({ queryKey: ["players", token] });
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
          queryClient.invalidateQueries({ queryKey: ["player-match-stats", token] });
          queryClient.invalidateQueries({ queryKey: ["player-match-stats"] });
        } else {
          toast.warning("Player salvo, mas não havia partida vinculada para gravar stats.");
        }
        queryClient.invalidateQueries({ queryKey: ["players", token] });
        queryClient.invalidateQueries({ queryKey: ["players"] });
        closeEditModal();
        return;
      }

      if (editingEntity.type === "match") {
        if (
          !editMatchDraft.tournamentId ||
          !editMatchDraft.statusId ||
          !editMatchDraft.gameId
        ) {
          throw new Error("Preencha campeonato, stage, status e jogo.");
        }

        const resolvedStageId =
          Number(editMatchDraft.stageId) ||
          Number(editingEntity.data?.stageId) ||
          Number(
            stagesData.find(
              (stage: any) =>
                Number(stage.tournamentId) ===
                  Number(editMatchDraft.tournamentId || selectedTourney),
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
          bracketPosition:
            String(editingEntity.data?.bracketPosition || "") || null,
          startedAt: formatApiUtcTimestamp(editMatchDraft.startedAt),
          finishedAt: editMatchDraft.finishedAt
            ? formatApiUtcTimestamp(editMatchDraft.finishedAt)
            : null,
        };

        const result = await apiMatches.update(Number(editingEntity.data?.id), payload);
        if (result === false) {
          throw new Error("Erro ao atualizar partida");
        }

        toast.success("Partida atualizada!");
        queryClient.invalidateQueries({ queryKey: ["matches", token] });
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["bracket-matches", token, selectedTourney] });
        closeEditModal();
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao confirmar edição");
    }
  };

  const getTeamById = (teamId: number) => {
    return teamsData.find((candidate: any) => Number(candidate.id) === Number(teamId));
  };

  const draggingTeam = useMemo(
    () => (draggingTeamId ? getTeamById(draggingTeamId) : null),
    [draggingTeamId, teamsData],
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

  const extractEntity = (response: any) => {
    if (!response) return null;
    if (response.result && !Array.isArray(response.result)) return response.result;
    if (response.data && !Array.isArray(response.data)) return response.data;
    if (!Array.isArray(response) && response.id) return response;
    return null;
  };

  const loading = l1 || l2 || l3 || l4 || lStatus;

  const [selectedTourney, setSelectedTourney] = useState("");

  const { data: bmr } = useQuery({
    queryKey: ["bracket-matches", token, selectedTourney],
    queryFn: () => ApiService.get(`api/Matches/GetMatchesByTournamentId/${selectedTourney}`),
    enabled: !!token && !!selectedTourney,
  });

  const selectedTournament = useMemo(
    () =>
      tournamentsData.find((candidate: any) => Number(candidate.id) === Number(selectedTourney)),
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
    return parse(bmr).map((match: any) => {
      const teams = Array.isArray(match?.teams) ? match.teams : match?.teams?.$values || [];
      const teamA = teams.find(
        (candidate: any) => String(candidate?.side || "").toUpperCase() === "A",
      );
      const teamB = teams.find(
        (candidate: any) => String(candidate?.side || "").toUpperCase() === "B",
      );
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
    () => getStatusIdByLabel(["vivo", "live", "ativo", "andam", "progres", "curso", "abert"]) || scheduledStatusId,
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

      const list = parse(response);
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
      existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "A") ||
      null;
    const existingTeamBEntry =
      existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "B") ||
      null;

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
      let fallbackStage = stagesData.find(
        (s: any) => Number(s.tournamentId) === Number(selectedTourney),
      );

      if (!fallbackStage && stagesData.length > 0) {
        fallbackStage = stagesData[0]; // Fallback extremo
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

    if (!payload.tournamentId || !payload.statusId || !payload.gameId) {
      throw new Error("Cadastre o torneio, status e jogo antes de montar o chaveamento.");
    }

    const resolvedWinnerTeamId = Number(payload.winnerTeamId) || 0;
    const teamAScore =
      patch.scoreA ??
      existingMatch?.scoreA ??
      existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "A")
        ?.score ??
      null;
    const teamBScore =
      patch.scoreB ??
      existingMatch?.scoreB ??
      existingTeams.find((candidate: any) => String(candidate?.side || "").toUpperCase() === "B")
        ?.score ??
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

    queryClient.invalidateQueries({ queryKey: ["matches", token] });
    queryClient.invalidateQueries({ queryKey: ["matches"] });
    queryClient.invalidateQueries({ queryKey: ["match-teams", token] });
    queryClient.invalidateQueries({ queryKey: ["match-teams"] });
    queryClient.invalidateQueries({ queryKey: ["matchteams"] });
    queryClient.invalidateQueries({ queryKey: ["bracket-matches", token, selectedTourney] });
    queryClient.invalidateQueries({ queryKey: ["teams", token] });
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
        const roleStillAvailable = availableRoles.some(
          (role: any) => Number(role.id) === Number(participant.roleId),
        );
        return roleStillAvailable ? participant : { ...participant, roleId: 0 };
      }),
    );
  }, [availableRoles]);

  // Guard de Autenticação Admin - Verificação dinâmica por Role (Administrador)
  // Posicionado após TODOS os Hooks para evitar o erro "Rendered more hooks than during the previous render"
  if (!user || !isAdmin) {
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
          <h1 className="font-display text-4xl font-black italic uppercase text-white mb-4 tracking-tighter">
            Acesso Restrito
          </h1>
          <p className="text-muted-foreground mb-8 uppercase tracking-[0.2em] text-[10px] italic leading-relaxed">
            Identificação de nível Administrador necessária para acessar o núcleo de comando_ <br />
            <span className="text-[8px] opacity-30 mt-2 block">
              Terminal restrito a usuários com permissão de gestão via API.
            </span>
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

  const requestDelete = (id: string, entity: string) => {
    setDeleteTarget({ id, entity });
  };

  // Função real de exclusão que limpa o cache global
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    // Mapeamento de controladores baseado na entidade
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
      // Invalida a query específica para forçar o refetch
      const queryKey = entity.toLowerCase();
      queryClient.invalidateQueries({ queryKey: [queryKey, token] });
      queryClient.invalidateQueries({ queryKey: [queryKey] });

      // Se deletar um time ou uma partida, o ranking (teams) deve ser recalculado
      if (entity === "Teams" || entity === "Matches") {
        queryClient.invalidateQueries({ queryKey: ["teams", token] });
        queryClient.invalidateQueries({ queryKey: ["teams"] });
      }

      toast.success("Removido com sucesso!");
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

  function Pagination({ pages }: { pages: number }) {
    return (
      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </Button>
        <span className="text-muted-foreground">
          {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </Button>
      </div>
    );
  }

  function RowActions({ id, entity, onEdit }: { id: string; entity: string; onEdit?: () => void }) {
    return (
      <div className="flex justify-end gap-1">
        <Button size="icon" variant="ghost" onClick={onEdit || fakeAct("Editado")}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => requestDelete(id, entity)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    );
  }

  /**
   * Helper de Filtragem Local.
   * Integração: O filtro 'q' deve ser enviado como parâmetro para a API em ambientes produtivos.
   */
  const filt = (arr: any[], key: string) =>
    arr.filter((x) => String(x[key]).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10">
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md border-white/10 bg-[#0a0a0c] text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase italic">
              Confirmar exclusão?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Essa ação remove permanentemente{" "}
              {deleteTarget?.entity ? deleteTarget.entity.toLowerCase() : "o registro"} do sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewingTeamId !== null}
        onOpenChange={(open) => !open && setViewingTeamId(null)}
      >
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
              <div
                key={participant.id}
                className="grid grid-cols-[1.4fr_1fr_1fr] gap-3 border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <div className="font-display text-lg">
                    {participant.player?.name || `Player #${participant.playerId}`}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">
                    Entrou em {formatDateBR(participant.joinedAt)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    Role
                  </div>
                  <div>{participant.role?.name || `Role #${participant.roleId}`}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    Status
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase">
                    {participant.isStarter && (
                      <span className="border border-primary/40 px-2 py-1 text-primary">
                        Titular
                      </span>
                    )}
                    {participant.isCaptain && (
                      <span className="border border-warning/40 px-2 py-1 text-warning">
                        Capitão
                      </span>
                    )}
                    {participant.isSubstitute && (
                      <span className="border border-neon/40 px-2 py-1 text-neon">Reserva</span>
                    )}
                    {participant.isActive && (
                      <span className="border border-success/40 px-2 py-1 text-success">Ativo</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingEntity !== null}
        onOpenChange={(open) => {
          if (!open) closeEditModal();
        }}
      >
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-2.5rem)] md:w-[min(92vw,56rem)] max-h-[90vh] overflow-hidden box-border border-white/10 bg-[#0a0a0c] text-white flex flex-col p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase italic">
              {editingEntity?.type === "tournament"
                ? "Editar campeonato"
                : editingEntity?.type === "team"
                  ? "Editar time"
                  : editingEntity?.type === "player"
                    ? "Editar player"
                    : "Editar partida"}
            </DialogTitle>
            <DialogDescription className="text-white/50 uppercase tracking-widest text-[10px]">
              {editingEntity?.type === "tournament"
                ? "Altera os dados do campeonato e salva direto na API."
                : editingEntity?.type === "team"
                  ? "Altera os dados do time e salva direto na API."
                  : editingEntity?.type === "player"
                    ? "Altera os dados do player e salva direto na API."
                    : "Altera os dados da partida e salva direto na API."}
            </DialogDescription>
          </DialogHeader>

          {editingEntity?.type === "tournament" && (
            <div className="grid gap-4 overflow-y-auto pr-1 max-h-[calc(90vh-10rem)] min-w-0">
              <div className="grid md:grid-cols-2 gap-4 min-w-0">
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Nome
                  </label>
                  <Input
                    value={editTournamentDraft.name}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({ ...current, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Descrição
                  </label>
                  <Textarea
                    value={editTournamentDraft.description}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        description: e.target.value,
                      }))
                    }
                    className="min-h-[88px] resize-y bg-black/40 border-white/10"
                  />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Banner URL
                  </label>
                  <Input
                    value={editTournamentDraft.bannerUrl}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        bannerUrl: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Jogo
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editTournamentDraft.gameId}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        gameId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                    <option value={0} disabled>Selecionar jogo</option>
                    {gamesData.map((game: any) => (
                      <option key={game.id} value={game.id}>
                        {game.name || game.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Status
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editTournamentDraft.statusId}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        statusId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                    <option value={0} disabled>Selecionar status</option>
                    {statusesData.map((status: any) => (
                      <option key={status.id} value={status.id}>
                        {status.name || status.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Tipo de Chaveamento
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editTournamentDraft.bracketType}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        bracketType: e.target.value,
                      }))
                    }
                  >
                    <option value="Single Elimination">Eliminação Simples</option>
                    <option value="Double Elimination">Eliminação Dupla</option>
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Formato
                  </label>
                  <Input
                    value={editTournamentDraft.format}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({ ...current, format: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Premiação
                  </label>
                  <Input
                    type="number"
                    value={editTournamentDraft.prizePool}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        prizePool: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Vagas
                  </label>
                  <Input
                    type="number"
                    value={editTournamentDraft.maxTeams}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        maxTeams: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Organizador
                  </label>
                  <Input
                    value={editTournamentDraft.organizer}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        organizer: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Região
                  </label>
                  <Input
                    value={editTournamentDraft.region}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({ ...current, region: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Timezone
                  </label>
                  <Input
                    value={editTournamentDraft.timezone}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        timezone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Patch
                  </label>
                  <Input
                    value={editTournamentDraft.patchVersion}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        patchVersion: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Roster Lock
                  </label>
                  <Input
                    type="datetime-local"
                    value={editTournamentDraft.rosterLockAt}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        rosterLockAt: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Início
                  </label>
                  <Input
                    type="datetime-local"
                    value={editTournamentDraft.startDate}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({
                        ...current,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Fim
                  </label>
                  <Input
                    type="datetime-local"
                    value={editTournamentDraft.endDate}
                    onChange={(e) =>
                      setEditTournamentDraft((current) => ({ ...current, endDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={closeEditModal}>
                  Cancelar
                </Button>
                <Button className="bg-neon text-black font-black" onClick={saveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar alterações
                </Button>
              </div>
            </div>
          )}

          {editingEntity?.type === "team" && (
            <div className="grid gap-4 overflow-y-auto pr-1 max-h-[calc(90vh-10rem)] min-w-0">
              <div className="grid md:grid-cols-2 gap-4 min-w-0">
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Nome
                  </label>
                  <Input
                    value={editTeamDraft.name}
                    onChange={(e) =>
                      setEditTeamDraft((current) => ({ ...current, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    TAG
                  </label>
                  <Input
                    value={editTeamDraft.tag}
                    onChange={(e) =>
                      setEditTeamDraft((current) => ({ ...current, tag: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Jogo
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editTeamDraft.gameId}
                    onChange={(e) =>
                      setEditTeamDraft((current) => ({
                        ...current,
                        gameId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                    <option value={0}>Selecione um jogo</option>
                    {gamesData.map((game: any) => (
                      <option key={game.id} value={game.id}>
                        {game.name || game.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Descrição
                  </label>
                  <Textarea
                    value={editTeamDraft.description}
                    onChange={(e) =>
                      setEditTeamDraft((current) => ({ ...current, description: e.target.value }))
                    }
                    className="min-h-[88px] resize-y bg-black/40 border-white/10"
                  />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Logo URL
                  </label>
                  <Input
                    value={editTeamDraft.logoUrl}
                    onChange={(e) =>
                      setEditTeamDraft((current) => ({ ...current, logoUrl: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Banner Color
                  </label>
                  <Input
                    value={editTeamDraft.bannerColor}
                    onChange={(e) =>
                      setEditTeamDraft((current) => ({ ...current, bannerColor: e.target.value }))
                    }
                    placeholder="#f86d83"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    ELO
                  </label>
                  <Input
                    type="number"
                    value={editTeamDraft.elo}
                    onChange={(e) =>
                      setEditTeamDraft((current) => ({
                        ...current,
                        elo: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="border border-white/10 bg-black/20 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/70 italic">
                    Stats da partida
                  </h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic">
                    Selecione a partida antes de editar os números.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 min-w-0">
                  <div className="grid gap-1 md:col-span-2">
                    <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                      Partida
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editTeamMatchStatsDraft.matchId}
                      onChange={(e) => updateEditTeamMatchStatsMatch(Number(e.target.value) || 0)}
                    >
                      <option value={0} disabled>
                        Selecione uma partida
                      </option>
                      {teamStatsMatchOptions.map((match: any) => (
                        <option key={match.id} value={match.id}>
                          #{match.id} - {getTournamentLabel(Number(match.tournamentId) || 0)} -{" "}
                          {formatDateBR(match.startedAt || match.createdAt || match.updatedAt)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                      Wins
                    </label>
                    <Input
                      type="number"
                      disabled={!editTeamMatchStatsDraft.matchId}
                      value={editTeamMatchStatsDraft.roundsWon}
                      onChange={(e) =>
                        setEditTeamMatchStatsDraft((current) => ({
                          ...current,
                          roundsWon: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                      Losses
                    </label>
                    <Input
                      type="number"
                      disabled={!editTeamMatchStatsDraft.matchId}
                      value={editTeamMatchStatsDraft.roundsLost}
                      onChange={(e) =>
                        setEditTeamMatchStatsDraft((current) => ({
                          ...current,
                          roundsLost: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                      Plants
                    </label>
                    <Input
                      type="number"
                      disabled={!editTeamMatchStatsDraft.matchId}
                      value={editTeamMatchStatsDraft.plants}
                      onChange={(e) =>
                        setEditTeamMatchStatsDraft((current) => ({
                          ...current,
                          plants: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                      Defuses
                    </label>
                    <Input
                      type="number"
                      disabled={!editTeamMatchStatsDraft.matchId}
                      value={editTeamMatchStatsDraft.defuses}
                      onChange={(e) =>
                        setEditTeamMatchStatsDraft((current) => ({
                          ...current,
                          defuses: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="border border-white/10 bg-black/20 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/70 italic">
                    Formação do Time
                  </h4>
                  <div className="flex items-center gap-2">
                    <select
                      className="flex h-10 rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={editTeamGameId}
                      onChange={(e) => setEditTeamGameId(Number(e.target.value))}
                    >
                      <option value={0} disabled>Selecionar jogo dos roles...</option>
                      {gamesData.map((game: any) => (
                        <option key={game.id} value={game.id}>
                          {game.name || game.title}
                        </option>
                      ))}
                    </select>
                    <Button type="button" variant="outline" onClick={addEditTeamParticipant}>
                      Adicionar player
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {editTeamParticipants.map((participant, index) => (
                    <div
                      key={participant.id || index}
                      className="grid md:grid-cols-[1.8fr_1fr_auto_auto_auto_auto_auto] gap-3 items-center border border-white/5 p-3 min-w-0"
                    >
                      <div className="space-y-1 min-w-0">
                        <select
                          className="flex h-12 w-full rounded-md border border-input bg-black/40 px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={participant.playerId || ""}
                          onChange={(e) => {
                            const playerId = Number(e.target.value) || 0;
                            const playerName =
                              playersData.find(
                                (candidate: any) => Number(candidate.id) === playerId,
                              )?.name || "";
                            updateEditTeamParticipant(index, { playerId, playerName });
                          }}
                        >
                          <option value="" disabled>Selecionar player...</option>
                          {playersData.map((player: any) => {
                            const playerId = Number(player.id);
                            const selectedElsewhere =
                              linkedPlayerIdsInEditDraft.has(playerId) &&
                              playerId !== Number(participant.playerId);
                            return (
                              <option
                                key={player.id}
                                value={player.id}
                                disabled={selectedElsewhere}
                              >
                                {player.name}
                                {selectedElsewhere ? " (já escalado)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={participant.roleId || ""}
                        onChange={(e) => {
                          const roleId = Number(e.target.value) || 0;
                          const roleName =
                            editAvailableRoles.find(
                              (candidate: any) => Number(candidate.id) === roleId,
                            )?.name || "";
                          updateEditTeamParticipant(index, { roleId, roleName });
                        }}
                        disabled={!editTeamGameId}
                      >
                        <option value="" disabled>Selecionar role...</option>
                        {editAvailableRoles.map((role: any) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] uppercase tracking-widest text-white/40 md:col-span-2">
                        {participant.roleName ||
                          editAvailableRoles.find(
                            (candidate: any) => Number(candidate.id) === Number(participant.roleId),
                          )?.name ||
                          "Role não resolvida"}
                      </div>
                      <label className="flex items-center gap-2 text-[10px] uppercase text-white/70">
                        <Checkbox
                          checked={participant.isStarter}
                          onCheckedChange={(checked) =>
                            updateEditTeamParticipant(index, {
                              isStarter: Boolean(checked),
                              isSubstitute: Boolean(checked) ? false : participant.isSubstitute,
                            })
                          }
                        />
                        Titular
                      </label>
                      <label className="flex items-center gap-2 text-[10px] uppercase text-white/70">
                        <Checkbox
                          checked={participant.isCaptain}
                          onCheckedChange={(checked) =>
                            updateEditTeamParticipant(index, { isCaptain: Boolean(checked) })
                          }
                        />
                        Capitão
                      </label>
                      <label className="flex items-center gap-2 text-[10px] uppercase text-white/70">
                        <Checkbox
                          checked={participant.isSubstitute}
                          onCheckedChange={(checked) =>
                            updateEditTeamParticipant(index, {
                              isSubstitute: Boolean(checked),
                              isStarter: Boolean(checked) ? false : participant.isStarter,
                            })
                          }
                        />
                        Reserva
                      </label>
                      <label className="flex items-center gap-2 text-[10px] uppercase text-white/70">
                        <Checkbox
                          checked={participant.isActive}
                          onCheckedChange={(checked) =>
                            updateEditTeamParticipant(index, { isActive: Boolean(checked) })
                          }
                        />
                        Ativo
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeEditTeamParticipant(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={closeEditModal}>
                  Cancelar
                </Button>
                <Button className="bg-neon text-black font-black" onClick={saveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar alterações
                </Button>
              </div>
            </div>
          )}

          {editingEntity?.type === "player" && (
            <div className="grid gap-4 overflow-y-auto pr-1 max-h-[calc(90vh-10rem)] min-w-0">
              <div className="grid md:grid-cols-2 gap-4 min-w-0">
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Nome
                  </label>
                  <Input
                    value={editPlayerDraft.name}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({ ...current, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Avatar URL
                  </label>
                  <Input
                    value={editPlayerDraft.avatarUrl}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({ ...current, avatarUrl: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Usuário vinculado
                  </label>
                  <Input
                    value={getUserLabel(
                      usersData.find(
                        (candidate: any) => Number(candidate.id) === Number(editPlayerDraft.userId),
                      ),
                    )}
                    disabled
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Partida vinculada aos stats
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editPlayerStatsMatchId}
                    onChange={(e) => setEditPlayerStatsMatchId(Number(e.target.value) || 0)}
                  >
                    <option value={0} disabled>Selecionar partida</option>
                    {playerStatsMatchOptions.map((match: any) => (
                      <option key={match.id} value={match.id}>
                        {getTournamentLabel(Number(match.tournamentId))} - {match.bracketPosition || `Partida #${match.id}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Os stats ficam em `PlayerMatchStats`. Selecione a partida que você quer atualizar.
                  </p>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Kills
                  </label>
                  <Input
                    type="number"
                    value={editPlayerDraft.kills}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({
                        ...current,
                        kills: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Deaths
                  </label>
                  <Input
                    type="number"
                    value={editPlayerDraft.deaths}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({
                        ...current,
                        deaths: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Assists
                  </label>
                  <Input
                    type="number"
                    value={editPlayerDraft.assists}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({
                        ...current,
                        assists: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    ADR
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editPlayerDraft.adr}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({
                        ...current,
                        adr: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    HS%
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editPlayerDraft.hsPercentage}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({
                        ...current,
                        hsPercentage: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    First Kills
                  </label>
                  <Input
                    type="number"
                    value={editPlayerDraft.firstKills}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({
                        ...current,
                        firstKills: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    KAST
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editPlayerDraft.kast}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({
                        ...current,
                        kast: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    ACS
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editPlayerDraft.acs}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({
                        ...current,
                        acs: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Perfil público
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={String(editPlayerDraft.isProfilePublic)}
                    onChange={(e) =>
                      setEditPlayerDraft((current) => ({
                        ...current,
                        isProfilePublic: e.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={closeEditModal}>
                  Cancelar
                </Button>
                <Button className="bg-neon text-black font-black" onClick={saveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar alterações
                </Button>
              </div>
            </div>
          )}

          {editingEntity?.type === "match" && (
            <div className="grid gap-4 overflow-y-auto pr-1 max-h-[calc(90vh-10rem)] min-w-0">
              <div className="grid md:grid-cols-2 gap-4 min-w-0">
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Campeonato
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editMatchDraft.tournamentId}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({
                        ...current,
                        tournamentId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                    <option value={0} disabled>Selecionar campeonato</option>
                    {tournamentsData.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Stage
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editMatchDraft.stageId}
                    disabled={!!editMatchDraft.tournamentId}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({
                        ...current,
                        stageId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Status
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editMatchDraft.statusId}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({
                        ...current,
                        statusId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                    <option value={0} disabled>Selecionar status</option>
                    {statusesData.map((status: any) => (
                      <option key={status.id} value={status.id}>
                        {status.name || status.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Jogo
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editMatchDraft.gameId}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({
                        ...current,
                        gameId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                    <option value={0} disabled>Selecionar jogo</option>
                    {gamesData.map((game: any) => (
                      <option key={game.id} value={game.id}>
                        {game.name || game.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Melhor de
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={editMatchDraft.bestOf}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({
                        ...current,
                        bestOf: Number(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Time A
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editMatchDraft.teamAId}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({
                        ...current,
                        teamAId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                    <option value={0} disabled>Selecionar time A</option>
                    {teamsData.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Time B
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editMatchDraft.teamBId}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({
                        ...current,
                        teamBId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                    <option value={0} disabled>Selecionar time B</option>
                    {teamsData.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Vencedor
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={editMatchDraft.winnerTeamId}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({
                        ...current,
                        winnerTeamId: Number(e.target.value) || 0,
                      }))
                    }
                  >
                    <option value={0}>Definir depois</option>
                    {teamsData.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Início
                  </label>
                  <Input
                    type="datetime-local"
                    value={editMatchDraft.startedAt}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({ ...current, startedAt: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-[9px] uppercase font-black text-white/60 tracking-widest">
                    Fim
                  </label>
                  <Input
                    type="datetime-local"
                    value={editMatchDraft.finishedAt}
                    onChange={(e) =>
                      setEditMatchDraft((current) => ({ ...current, finishedAt: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={closeEditModal}>
                  Cancelar
                </Button>
                <Button className="bg-neon text-black font-black" onClick={saveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <img
            src="https://santos-games.com/encontre-um-time/assets/sga-logo-B5SOul8E.png"
            alt="SGA Logo"
            className="h-12 w-auto"
          />
          <h1 className="font-display text-3xl uppercase tracking-widest">Painel de controle</h1>
        </div>
      </div>

      {/* Dashboard de Visão Geral utilizando StatsCards reutilizáveis */}
      {tab ? (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatsCard label="Campeonatos" value={tournamentsData.length} icon={Trophy} accent />
          <StatsCard label="Times" value={teamsData.length} icon={Users} />
          <StatsCard label="Jogadores" value={playersData.length} icon={Activity} />
          <StatsCard label="Partidas" value={matchesData.length} icon={Swords} />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border/60 bg-muted/5 p-6 text-sm text-muted-foreground">
          Selecione uma aba para carregar os dados de administração.
        </div>
      )}

      {/* Sistema de Tabulação por Estado */}
      <div className="mt-8 flex flex-wrap gap-1 border-b border-border/60">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => {
              setTab(t.k);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs uppercase tracking-widest -mb-px border-b-2 transition ${
              tab === t.k
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* 
            Blocos de Renderização Condicional por Aba.
            Pontos de Integração: Cada 'f' (filtro) consome dados de '@/mocks/data'.
        */}
        {tab === "campeonatos" &&
          (() => {
            const f = filt(tournamentsData, "name");
            const { items, pages } = paginate(f);
            return (
              <>
                {isCreatingTourney && (
                  <div className="mb-8 p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
                    <h3 className="font-display text-xl uppercase italic text-primary">
                      Configurar Novo Campeonato
                    </h3>
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Nome
                        </label>
                        <Input
                          placeholder="Título do Evento"
                          value={newTourney.name}
                          onChange={(e) => setNewTourney({ ...newTourney, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Premiação Total (Número)
                        </label>
                        <Input
                          type="number"
                          placeholder="Ex: 5000"
                          value={newTourney.prizePool}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, prizePool: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Vagas
                        </label>
                        <Input
                          type="number"
                          value={newTourney.maxTeams}
                          onChange={(e) =>
                            setNewTourney({
                              ...newTourney,
                              maxTeams: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Início
                        </label>
                        <Input
                          type="datetime-local"
                          value={newTourney.startDate}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, startDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Término
                        </label>
                        <Input
                          type="datetime-local"
                          value={newTourney.endDate}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, endDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Roster Lock
                        </label>
                        <Input
                          type="datetime-local"
                          value={newTourney.rosterLockAt}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, rosterLockAt: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Jogo
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={newTourney.gameId}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, gameId: Number(e.target.value) })
                          }
                        >
                          <option value={0} disabled>Selecionar Jogo...</option>
                          {gamesData.map((game: any) => (
                            <option key={game.id} value={game.id}>
                              {game.name || game.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Tipo de Chaveamento
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={newTourney.bracketType}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, bracketType: e.target.value })
                          }
                        >
                          <option value="Single Elimination">Eliminação Simples</option>
                          <option value="Double Elimination">Eliminação Dupla</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Status
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={newTourney.statusId}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, statusId: Number(e.target.value) })
                          }
                        >
                          <option value={0} disabled>Selecionar Status...</option>
                          {statusesData.map((status: any) => (
                            <option key={status.id} value={status.id}>
                              {status.name || status.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Organizador
                        </label>
                        <Input
                          placeholder="Ex: Santos Games"
                          value={newTourney.organizer}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, organizer: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Descrição
                        </label>
                        <Input
                          placeholder="Sobre o campeonato..."
                          value={newTourney.description}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          URL do Banner
                        </label>
                        <Input
                          placeholder="https://..."
                          value={newTourney.bannerUrl}
                          onChange={(e) =>
                            setNewTourney({ ...newTourney, bannerUrl: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => setIsCreatingTourney(false)}>
                        Cancelar
                      </Button>
                      <Button
                        className="bg-primary"
                        onClick={async () => {
                          try {
                            if (!newTourney.name.trim())
                              throw new Error("O nome do campeonato é obrigatório.");
                            if (!newTourney.gameId)
                              throw new Error("Selecione um jogo para o campeonato.");
                            if (!newTourney.statusId)
                              throw new Error("Selecione o status do campeonato.");

                            const payload = {
                              name: newTourney.name.trim(),
                              description: newTourney.description.trim() || null,
                              bannerUrl: newTourney.bannerUrl.trim() || null,
                              startDate: formatApiUtcTimestamp(newTourney.startDate),
                              endDate: formatApiUtcTimestamp(newTourney.endDate),
                              rosterLockAt: formatApiUtcTimestamp(newTourney.rosterLockAt),
                              createdBy: user?.login || user?.name || user?.email || "SGA_ADMIN",
                              format: newTourney.format.trim() || null,
                              bracketType: newTourney.bracketType.trim() || null,
                              maxTeams: Number(newTourney.maxTeams) || null,
                              organizer: newTourney.organizer.trim() || null,
                              rulebookUrl: newTourney.rulebookUrl.trim() || null,
                              prizePool: Number(newTourney.prizePool) || null,
                              region: newTourney.region.trim() || null,
                              timezone: newTourney.timezone.trim() || null,
                              patchVersion: newTourney.patchVersion.trim() || null,
                              statusId: Number(newTourney.statusId) || null,
                              gameId: Number(newTourney.gameId) || null,
                            };

                            const result = await apiTournaments.create(payload);
                            if (!result?.result && result !== true && result !== null) {
                              throw new Error("Erro ao criar campeonato");
                            }

                            toast.success("Campeonato criado com sucesso!");
                            setIsCreatingTourney(false);
                            setNewTourney(createEmptyTournament());

                            // Gatilho de atualização automática
                            queryClient.invalidateQueries({ queryKey: ["tournaments", token] });
                            queryClient.invalidateQueries({ queryKey: ["tournaments"] });
                            queryClient.invalidateQueries({ queryKey: ["matches", token] }); // Partidas podem mudar com novos torneios
                            queryClient.invalidateQueries({ queryKey: ["matches"] });
                          } catch (err: any) {
                            console.error("Erro detalhado da API:", err);
                            toast.error(err.message || "Erro ao criar campeonato");
                          }
                        }}
                      >
                        Criar campeonato
                      </Button>
                    </div>
                  </div>
                )}
                <HeaderBar create="Novo campeonato" q={q} setQ={setQ} onCreate={() => setIsCreatingTourney(true)} />
                <div className="overflow-x-auto rounded-xl border border-border/60 bg-card-grad">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left">Nome</th>
                        <th className="text-left">Status</th>
                        <th>Times</th>
                        <th>Premiação</th>
                        <th>Início</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((t) => (
                        <tr key={t.id} className="border-t border-border/40 hover:bg-muted/30">
                          <td className="px-4 py-3 font-display">{t.name}</td>
                          <td>
                            <StatusBadge status={getTournamentStatusLabel(t.statusId)} />
                          </td>
                          <td className="text-center">{t.maxTeams}</td>
                          <td className="text-center">{t.prizePool}</td>
                          <td className="text-center">{formatDateBR(t.startDate)}</td>
                          <td className="px-4 py-3">
                            <RowActions
                              id={t.id}
                              entity="Tournaments"
                              onEdit={() => openTournamentEdit(t)}
                            />
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

        {tab === "monitoramento" && (
          <div className="animate-in fade-in duration-700 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="p-3 bg-primary/10 text-primary">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-2xl uppercase italic font-black text-white">Live Match Control</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic">Sincronização de placar em tempo real via API_</p>
              </div>
            </div>

            <div className="grid gap-6">
              {matchesData.filter(m => {
                const statusLabel = getTournamentStatusLabel(m.statusId).toLowerCase();
                return statusLabel.includes("vivo") || statusLabel.includes("live") || statusLabel.includes("andam") || statusLabel.includes("ativo");
              }).length === 0 ? (
                <div className="p-20 text-center border border-dashed border-white/10 bg-white/[0.02] text-white/20 uppercase tracking-[0.4em] italic">
                  Nenhuma partida em andamento_
                </div>
              ) : (
                matchesData.filter(m => {
                  const statusLabel = getTournamentStatusLabel(m.statusId).toLowerCase();
                  return statusLabel.includes("vivo") || statusLabel.includes("live") || statusLabel.includes("andam") || statusLabel.includes("ativo");
                }).map((m: any) => {
                  const teamA = getTeamById(m.teamAId);
                  const teamB = getTeamById(m.teamBId);
                  
                  // Função interna para atualizar placar rápido
                  const updateScore = async (side: 'A' | 'B', increment: number) => {
                    try {
                      const currentScore = side === 'A' ? (m.scoreA || 0) : (m.scoreB || 0);
                      const newScore = Math.max(0, currentScore + increment);
                      
                      await saveBracketMatch(m.bracketPosition, {
                        [`score${side}`]: newScore,
                        statusId: m.statusId // Mantém ao vivo
                      });
                      toast.success(`Placar atualizado: ${newScore}`);
                    } catch (err) {
                      toast.error("Erro ao sincronizar placar");
                    }
                  };

                  return (
                    <div key={m.id} className="relative border border-primary/20 bg-[#0a0a0c] p-6 shadow-2xl overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 bg-primary/10 text-primary text-[8px] font-black uppercase italic">Match_ID: {m.id}</div>
                      
                      <div className="grid md:grid-cols-[1fr_auto_1fr] items-center gap-10">
                        {/* Team A Control */}
                        <div className="flex flex-col items-center gap-4">
                          <TeamLogo team={teamA} size={64} />
                          <div className="font-display text-lg uppercase text-white">{teamA?.name}</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => updateScore('A', -1)} className="h-10 w-10 border-white/10">-</Button>
                            <div className="font-display text-5xl text-primary px-4">{m.scoreA || 0}</div>
                            <Button variant="outline" size="sm" onClick={() => updateScore('A', 1)} className="h-10 w-10 border-white/10">+</Button>
                          </div>
                        </div>

                        {/* Match Info Center */}
                        <div className="flex flex-col items-center gap-4 border-x border-white/5 px-10">
                          <div className="text-[10px] font-black text-primary animate-pulse italic uppercase tracking-[0.3em]">Live Now</div>
                          <div className="text-center">
                            <div className="text-[11px] font-bold text-white uppercase">{getTournamentLabel(m.tournamentId)}</div>
                            <div className="text-[9px] text-white/40 uppercase tracking-widest mt-1">{m.bracketPosition}</div>
                          </div>
                          <div className="flex gap-2">
                             <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8 text-[9px] font-black italic uppercase tracking-widest"
                              onClick={() => {
                                if(confirm("Deseja encerrar esta partida oficialmente?")) {
                                  handleMatchWinner(m.bracketPosition, m.scoreA > m.scoreB ? 'teamAId' : 'teamBId');
                                }
                              }}
                             >
                               Finalizar Partida
                             </Button>
                             <Link to="/matches/$id" params={{ id: String(m.id) }}>
                               <Button variant="outline" size="sm" className="h-8 text-[9px] font-black italic uppercase tracking-widest border-white/10">
                                 Ver Página
                               </Button>
                             </Link>
                          </div>
                        </div>

                        {/* Team B Control */}
                        <div className="flex flex-col items-center gap-4">
                          <TeamLogo team={teamB} size={64} />
                          <div className="font-display text-lg uppercase text-white">{teamB?.name}</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => updateScore('B', -1)} className="h-10 w-10 border-white/10">-</Button>
                            <div className="font-display text-5xl text-white px-4">{m.scoreB || 0}</div>
                            <Button variant="outline" size="sm" onClick={() => updateScore('B', 1)} className="h-10 w-10 border-white/10">+</Button>
                          </div>
                        </div>
                      </div>

                      {/* HUD Accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {tab === "chaveamentos" && (
          <div className="animate-in fade-in duration-700 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary">
                  <Swords className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl uppercase italic font-black text-white leading-none">
                    Gestão de <span className="text-primary">Chaveamentos</span>
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
              {/* Lista de Seleção */}
              <div className="space-y-4">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">
                  Tournament_Stream
                </span>
                <div className="grid gap-2">
                  {tournamentsData.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTourney(t.id)}
                      className={`p-4 text-left border transition-all relative group ${selectedTourney === t.id ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(248,109,131,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                    >
                      <div className="text-sm font-display uppercase italic font-bold tracking-tight">
                        {t.name}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <StatusBadge status={getTournamentStatusLabel(t.statusId)} />
                      </div>
                      {selectedTourney === t.id && (
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border border-white/10 bg-white/5 p-4 space-y-3">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.35em] text-white/30 italic">
                      Times Disponíveis
                    </div>
                    <div className="text-xs text-white/50 mt-2">
                      Arraste um time para um slot vazio. O pool usa os times disponíveis no painel
                      e bloqueia duplicidades no mesmo chaveamento.
                    </div>
                  </div>
                  <div className="grid gap-2 max-h-[300px] xl:max-h-[420px] overflow-y-auto pr-1">
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
                          <TeamLogo
                            team={{
                              tag: team.tag || team.name?.slice(0, 3) || "SGA",
                              bannerColor: "#f86d83",
                            }}
                            size={32}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-display text-sm uppercase italic text-white">
                              {team.name}
                            </div>
                            <div className="truncate text-[10px] uppercase tracking-widest text-white/35">
                              {team.tag || "Sem tag"}
                            </div>
                          </div>
                          {isAssigned && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-warning">
                              Em uso
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Workspace do Editor */}
              <div className="bg-[#0a0a0c]/60 backdrop-blur-md border border-white/5 p-8 relative min-w-0">
                <div className="flex flex-col gap-12">
                  {!selectedTournament && (
                    <div className="border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/50">
                      Selecione um torneio para montar o chaveamento.
                    </div>
                  )}

                  {selectedTournament && isDoubleEliminationTournament && (
                    <div className="border border-valorant/20 bg-valorant/5 p-4 text-xs text-white/60 uppercase tracking-widest italic">
                      Este campeonato usa lower bracket. As rodadas finais aparecem abaixo do
                      chaveamento principal.
                    </div>
                  )}

                  {selectedTournament && (
                    <div className="space-y-10">
                      <AdminBracketSection
                        title="UPPER"
                        subtitle="Chave principal"
                        rounds={BRACKET_UPPER_ROUNDS}
                        isLower={false}
                        effectiveBracketMatchMap={effectiveBracketMatchMap}
                        getTeamById={getTeamById}
                        draggingTeam={draggingTeam}
                        previewSlotKey={previewSlotKey}
                        setPreviewSlotKey={setPreviewSlotKey}
                        setDraggingTeamId={setDraggingTeamId}
                        handleBracketDrop={handleBracketDrop}
                        handleBracketRemove={handleBracketRemove}
                        handleMatchWinner={handleMatchWinner}
                        handleEditMatch={openMatchEdit}
                        getBracketPhaseLabel={getBracketPhaseLabel}
                        getTournamentStatusLabel={getTournamentStatusLabel}
                        getTeamLabel={getTeamLabel}
                      />

                      {isDoubleEliminationTournament && (
                        <div className="space-y-4">
                          <div className="border border-valorant/20 bg-valorant/5 p-4 text-xs text-white/60 uppercase tracking-widest italic">
                            Este campeonato usa lower bracket. As rodadas finais aparecem abaixo do
                            chaveamento principal.
                          </div>

                          <AdminBracketSection
                            title="LOWER"
                            subtitle="Repescagem"
                            rounds={BRACKET_LOWER_ROUNDS}
                            isLower
                            effectiveBracketMatchMap={effectiveBracketMatchMap}
                            getTeamById={getTeamById}
                            draggingTeam={draggingTeam}
                            previewSlotKey={previewSlotKey}
                            setPreviewSlotKey={setPreviewSlotKey}
                            setDraggingTeamId={setDraggingTeamId}
                            handleBracketDrop={handleBracketDrop}
                            handleBracketRemove={handleBracketRemove}
                            handleMatchWinner={handleMatchWinner}
                            handleEditMatch={openMatchEdit}
                            getBracketPhaseLabel={getBracketPhaseLabel}
                            getTournamentStatusLabel={getTournamentStatusLabel}
                            getTeamLabel={getTeamLabel}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "times" &&
          (() => {
            const f = filt(teamsData, "name");
            const { items, pages } = paginate(f);
            return (
              <>
                {isCreatingTeam && (
                  <div className="mb-8 p-6 border border-neon/20 bg-neon/5 rounded-xl space-y-4">
                    <h3 className="font-display text-xl uppercase italic text-neon">
                      Registrar Nova Equipe
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Nome da Equipe
                        </label>
                        <Input
                          placeholder="Ex: Pulse Elite"
                          value={newTeam.name}
                          onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Descrição
                        </label>
                        <Input
                          placeholder="Ex: Organização competitiva"
                          value={newTeam.description}
                          onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          TAG
                        </label>
                        <Input
                          placeholder="Ex: PULSE"
                          value={newTeam.tag}
                          onChange={(e) => setNewTeam({ ...newTeam, tag: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Logo URL
                        </label>
                        <Input
                          placeholder="https://cdn..."
                          value={newTeam.logoUrl}
                          onChange={(e) => setNewTeam({ ...newTeam, logoUrl: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="border border-white/10 bg-black/20 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white/70 italic">
                          Formação Inicial
                        </h4>
                        <div className="flex items-center gap-2">
                          <select
                            className="flex h-10 rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            value={teamGameId}
                            onChange={(e) => setTeamGameId(Number(e.target.value))}
                          >
                            <option value={0} disabled>Selecionar jogo dos roles...</option>
                            {gamesData.map((game: any) => (
                              <option key={game.id} value={game.id}>
                                {game.name || game.title}
                              </option>
                            ))}
                          </select>
                          <Button type="button" variant="outline" onClick={addTeamParticipant}>
                            Adicionar player
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {teamParticipants.map((participant, index) => (
                          <div
                            key={index}
                            className="grid md:grid-cols-[1.8fr_1fr_auto_auto_auto_auto_auto] gap-3 items-center border border-white/5 p-3"
                          >
                            <select
                              className="flex h-12 w-full rounded-md border border-input bg-black/40 px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                              value={participant.playerId || ""}
                              onChange={(e) =>
                                updateTeamParticipant(index, {
                                  playerId: Number(e.target.value) || 0,
                                })
                              }
                            >
                              <option value="" disabled>Selecionar player...</option>
                              {playersData.map((player: any) => {
                                const playerId = Number(player.id);
                                const selectedElsewhere =
                                  linkedPlayerIdsInDraft.has(playerId) &&
                                  playerId !== Number(participant.playerId);
                                return (
                                  <option
                                    key={player.id}
                                    value={player.id}
                                    disabled={selectedElsewhere}
                                  >
                                    {player.name}
                                    {selectedElsewhere ? " (já escalado)" : ""}
                                  </option>
                                );
                              })}
                            </select>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                              value={participant.roleId || ""}
                              onChange={(e) =>
                                updateTeamParticipant(index, {
                                  roleId: Number(e.target.value) || 0,
                                })
                              }
                              disabled={!teamGameId}
                            >
                              <option value="" disabled>Selecionar role...</option>
                              {availableRoles.map((role: any) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                            <label className="flex items-center gap-2 text-[10px] uppercase text-white/70">
                              <Checkbox
                                checked={participant.isStarter}
                                onCheckedChange={(checked) =>
                                  updateTeamParticipant(index, {
                                    isStarter: Boolean(checked),
                                    isSubstitute: Boolean(checked)
                                      ? false
                                      : participant.isSubstitute,
                                  })
                                }
                              />
                              Titular
                            </label>
                            <label className="flex items-center gap-2 text-[10px] uppercase text-white/70">
                              <Checkbox
                                checked={participant.isCaptain}
                                onCheckedChange={(checked) =>
                                  updateTeamParticipant(index, { isCaptain: Boolean(checked) })
                                }
                              />
                              Capitão
                            </label>
                            <label className="flex items-center gap-2 text-[10px] uppercase text-white/70">
                              <Checkbox
                                checked={participant.isSubstitute}
                                onCheckedChange={(checked) =>
                                  updateTeamParticipant(index, {
                                    isSubstitute: Boolean(checked),
                                    isStarter: Boolean(checked) ? false : participant.isStarter,
                                  })
                                }
                              />
                              Reserva
                            </label>
                            <label className="flex items-center gap-2 text-[10px] uppercase text-white/70">
                              <Checkbox
                                checked={participant.isActive}
                                onCheckedChange={(checked) =>
                                  updateTeamParticipant(index, { isActive: Boolean(checked) })
                                }
                              />
                              Ativo
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeTeamParticipant(index)}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => setIsCreatingTeam(false)}>
                        Cancelar
                      </Button>
                      <Button
                        className="bg-neon text-black font-black"
                        onClick={async () => {
                          try {
                            if (!newTeam.name || !newTeam.tag)
                              throw new Error("Nome e TAG são obrigatórios.");

                            const payload = {
                              name: newTeam.name.trim(),
                              description: newTeam.description.trim() || null,
                              tag: newTeam.tag.trim() || null,
                              logoUrl: newTeam.logoUrl.trim() || null,
                            };
                            const result = await apiTeams.create(payload);
                            const createdTeam = extractEntity(result);
                            if (!createdTeam?.id) {
                              throw new Error("Erro ao registrar time");
                            }

                            const participantsToCreate = teamParticipants.filter(
                              (participant) => participant.playerId && participant.roleId,
                            );

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

                              const participantResult =
                                await apiTeamParticipants.create(participantPayload);
                              if (
                                !participantResult?.result &&
                                participantResult !== true &&
                                participantResult !== null
                              ) {
                                throw new Error(
                                  "Time criado, mas houve erro ao vincular jogadores.",
                                );
                              }
                            }

                            toast.success("Equipe registrada!");
                            setIsCreatingTeam(false);
                            setNewTeam(createEmptyTeam());
                            setTeamParticipants([createEmptyTeamParticipant()]);

                            // Gatilho de atualização automática (afeta squads e rankings)
                            queryClient.invalidateQueries({ queryKey: ["teams", token] });
                            queryClient.invalidateQueries({ queryKey: ["teams"] });
                            queryClient.invalidateQueries({ queryKey: ["players", token] });
                            queryClient.invalidateQueries({ queryKey: ["players"] });
                          } catch (err: any) {
                            toast.error(err.message || "Erro ao registrar time");
                          }
                        }}
                      >
                        Finalizar Registro
                      </Button>
                    </div>
                  </div>
                )}
                <HeaderBar create="Novo time" q={q} setQ={setQ} onCreate={() => setIsCreatingTeam(true)} />
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card-grad">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left">Time</th>
                        <th>Tag</th>
                        <th>Descrição</th>
                        <th>Criado em</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((t) => (
                        <tr key={t.id} className="border-t border-border/40 hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {t.logoUrl ? (
                                <img
                                  src={t.logoUrl}
                                  alt={t.name}
                                  className="h-7 w-7 rounded-full object-cover"
                                />
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
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setViewingTeamId(Number(t.id))}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => openTeamEdit(t)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(t.id, "Teams")}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

        {tab === "jogadores" &&
          (() => {
            const f = filt(playersData, "name");
            const { items, pages } = paginate(f);
            return (
              <>
                {isCreatingPlayer && (
                  <div className="mb-8 p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
                    <h3 className="font-display text-xl uppercase italic text-primary">
                      Contratar Novo Atleta
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Usuário Vinculado
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={newPlayer.userId || ""}
                          onChange={(e) => handlePlayerUserChange(e.target.value)}
                        >
                          <option value="" disabled>Selecionar usuário para relacionar</option>
                          {usersData.map((candidate: any) => {
                            const candidateId = Number(candidate.id);
                            const alreadyLinked =
                              linkedUserIds.has(candidateId) &&
                              candidateId !== Number(newPlayer.userId);

                            return (
                              <option
                                key={candidate.id}
                                value={candidate.id}
                                disabled={alreadyLinked}
                              >
                                {getUserLabel(candidate)}
                                {candidate.email ? ` - ${candidate.email}` : ""}
                                {alreadyLinked ? " (já vinculado)" : ""}
                              </option>
                            );
                          })}
                        </select>
                        {selectedUser && (
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            {selectedUser.login || selectedUser.email || `ID ${selectedUser.id}`} ·{" "}
                            {selectedUser.email || `ROLE ${selectedUser.role}`}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Nome do Player
                        </label>
                        <Input
                          placeholder="Ex: Igor Caetano"
                          value={newPlayer.name}
                          onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Avatar URL
                        </label>
                        <Input
                          placeholder="https://..."
                          value={newPlayer.avatarUrl}
                          onChange={(e) =>
                            setNewPlayer({ ...newPlayer, avatarUrl: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-muted-foreground italic">
                          Perfil Público
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          value={String(newPlayer.isProfilePublic)}
                          onChange={(e) =>
                            setNewPlayer({
                              ...newPlayer,
                              isProfilePublic: e.target.value === "true",
                            })
                          }
                        >
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => setIsCreatingPlayer(false)}>
                        Cancelar
                      </Button>
                      <Button
                        className="bg-primary font-black"
                        onClick={async () => {
                          try {
                            if (!newPlayer.userId)
                              throw new Error("Selecione um usuário para vincular ao player.");
                            if (!newPlayer.name.trim())
                              throw new Error("O nome do player é obrigatório.");

                            const payload = {
                              name: newPlayer.name.trim(),
                              avatarUrl:
                                newPlayer.avatarUrl?.trim() ||
                                "https://picsum.photos/seed/sga/200/200",
                              userId: Number(newPlayer.userId) || null,
                              isProfilePublic: Boolean(newPlayer.isProfilePublic),
                            };

                            const result = await apiPlayers.create(payload);

                            if (result?.result || result === true || result === null) {
                              toast.success("Jogador contratado!");
                              setIsCreatingPlayer(false);
                              setNewPlayer(createEmptyPlayer());

                              queryClient.invalidateQueries({ queryKey: ["players", token] });
                              queryClient.invalidateQueries({ queryKey: ["players"] });
                              return;
                            }

                            toast.error("Erro ao criar jogador");
                          } catch (err: any) {
                            toast.error(err.message || "Erro ao criar jogador");
                          }
                        }}
                      >
                        Criar perfil
                      </Button>
                    </div>
                  </div>
                )}
                <HeaderBar create="Novo jogador" q={q} setQ={setQ} onCreate={() => setIsCreatingPlayer(true)} />
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card-grad">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left">Jogador</th>
                        <th>Time</th>
                        <th>KDA</th>
                        <th>Usuário</th>
                        <th>Visibilidade</th>
                        <th>Criado em</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-border/40 hover:bg-muted/30 transition"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  p.avatarUrl && p.avatarUrl !== "null"
                                    ? p.avatarUrl
                                    : "https://picsum.photos/seed/sga/200/200"
                                }
                                className="h-7 w-7 rounded-full object-cover"
                                alt=""
                              />
                              <span className="font-display">{p.name}</span>
                            </div>
                          </td>
                          <td className="text-center">
                            {(() => {
                              const team = getPlayerTeam(Number(p.id));
                              return team ? (
                                <div className="flex items-center justify-center gap-2">
                                  <TeamLogo team={team} size={24} />
                                  <span className="text-xs">{team.name || team.tag || "Time"}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Sem equipe</span>
                              );
                            })()}
                          </td>
                          <td className="text-center font-display text-primary">
                            {Number(playerStatsById.get(Number(p.id))?.kda || 0).toFixed(2)}
                          </td>
                          <td className="text-center">
                            {getUserLabel(
                              usersData.find(
                                (candidate: any) => Number(candidate.id) === Number(p.userId),
                              ),
                            )}
                          </td>
                          <td className="text-center">
                            {p.isProfilePublic ? "Público" : "Privado"}
                          </td>
                          <td className="text-center">{formatDateBR(p.createdAt)}</td>
                          <td className="px-4 py-3">
                            <RowActions
                              id={p.id}
                              entity="Players"
                              onEdit={() => openPlayerEdit(p)}
                            />
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

        {tab === "highlights" && (
          <>
            <HeaderBar create="Novo highlight" q={q} setQ={setQ} onCreate={fakeAct("Novo highlight")} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {highlightsData.map((h: any) => (
                <div
                  key={h.id}
                  className="rounded-xl overflow-hidden border border-border/60 bg-card-grad"
                >
                  <div className="relative aspect-video">
                    <img src={h.thumbnail} className="h-full w-full object-cover" alt="" />
                    <Film className="absolute top-2 right-2 h-5 w-5 text-primary" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-display truncate">{h.title}</div>
                    <div className="mt-2 flex justify-end">
                      <RowActions id={h.id} entity="Highlights" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "galeria" && (
          <>
            <HeaderBar create="Adicionar imagem" q={q} setQ={setQ} onCreate={fakeAct("Adicionar imagem")} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {galleryData.map((src: string, i: number) => (
                <div key={i} className="relative group rounded-lg overflow-hidden">
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                  <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <Button size="icon" variant="ghost" onClick={fakeAct("Editado")}>
                      <Img className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(String(i), "Gallery")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={tab === "ia" ? "block" : "hidden"} aria-hidden={tab !== "ia"}>
          <AiMatchTab
            token={token}
            teamsData={teamsData}
            playersData={playersData}
            gameAccountsData={gameAccountsData}
            matchTeamsData={matchTeamsData}
            tournamentsData={tournamentsData}
            stagesData={stagesData}
            statusesData={statusesData}
            gamesData={gamesData}
            matchesData={matchesData}
            teamMatchStatsData={teamMatchStatsData}
            playerMatchStatsData={playerMatchStatsData}
            matchLineupsData={matchLineupsData}
            matchLineupPlayersData={matchLineupPlayersData}
            teamParticipantsData={teamParticipantsData}
          />
        </div>
      </div>
    </div>
  );
}
