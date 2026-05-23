import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TeamLogo } from "@/components/sga/TeamLogo";
import { StatusBadge } from "@/components/sga/StatusBadge";
import { Save, Trash2, Pencil, Upload, Search, Plus } from "lucide-react";
import type {
  AdminBracketRound,
  AdminBracketPositionedMatch,
} from "./types";
import {
  ADMIN_BRACKET_CARD_HEIGHT,
  ADMIN_BRACKET_CARD_WIDTH,
  ADMIN_BRACKET_COLUMN_GAP,
  ADMIN_BRACKET_FINAL_CARD_HEIGHT,
  ADMIN_BRACKET_FINAL_CARD_WIDTH,
  ADMIN_BRACKET_ROW_GAP,
  ADMIN_BRACKET_SECTION_PADDING_X,
  ADMIN_BRACKET_SECTION_PADDING_Y,
} from "./types";

interface HeaderBarProps {
  create: string;
  q: string;
  setQ: (val: string) => void;
  onCreate?: () => void;
  onUpload?: () => void;
}

export function HeaderBar({ create, q, setQ, onCreate, onUpload }: HeaderBarProps) {
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
      <Button className="bg-neon shadow-neon" onClick={onCreate || (() => {})}>
        <Plus className="h-4 w-4 mr-1" /> {create}
      </Button>
    </div>
  );
}

export function Pagination({ pages, page, setPage }: { pages: number; page: number; setPage: Dispatch<SetStateAction<number>> }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
        Anterior
      </Button>
      <span className="text-muted-foreground">
        {page} / {pages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
        Próxima
      </Button>
    </div>
  );
}

export function RowActions({
  id,
  entity,
  onEdit,
  onDelete,
}: {
  id: string;
  entity: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button size="icon" variant="ghost" onClick={onEdit || (() => {})}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onDelete || (() => {})}>
        <Trash2 className="h-4 w-4 text-destructive" />
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
    for (let positionIndex = 0; positionIndex < rounds[round.roundIndex]!.positions.length; positionIndex += 1) {
      const position = rounds[round.roundIndex]!.positions[positionIndex]!;
      let centerY = positionIndex * (round.cardHeight + ADMIN_BRACKET_ROW_GAP) + round.cardHeight / 2;

      if (round.roundIndex > 0) {
        const prevA = positioned.find(
          (item) =>
            item.roundIndex === round.roundIndex - 1 && item.positionIndex === positionIndex * 2,
        );
        const prevB = positioned.find(
          (item) =>
            item.roundIndex === round.roundIndex - 1 && item.positionIndex === positionIndex * 2 + 1,
        );

        if (prevA && prevB) {
          centerY = (prevA.y + prevA.height / 2 + prevB.y + prevB.height / 2) / 2;
        } else if (prevA) {
          centerY = prevA.y + prevA.height / 2;
        } else if (prevB) {
          centerY = prevB.y + prevB.height / 2;
        }

        if (
          round.roundIndex > 0 &&
          rounds[round.roundIndex - 1]!.positions.length === 1
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

export function AdminBracketMatchCard({
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
        background: "linear-gradient(145deg, rgba(10,10,12,0.95), rgba(6,7,10,0.95))",
      }}
    >
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10 group-hover/match:border-primary/40 transition-colors" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/10 group-hover/match:border-primary/40 transition-colors" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[8px] font-black uppercase tracking-widest text-white/30">JOGO {positionIndex + 1}</div>
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
          <span className="text-[7px] font-black italic tracking-tighter text-white/10">VERSUS</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        {renderDropSlot("teamBId", "Slot B", teamB)}
      </div>

      <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
        <div className="text-[9px] font-black uppercase tracking-[0.35em] italic text-white/30">Quem ganhou?</div>
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
            Avançando: <span className="font-display uppercase italic text-white">{getTeamLabel(Number(match.winnerTeamId))}</span>
          </div>
        )}

        <div className="mt-4">
          <Button variant="outline" className="w-full text-xs" disabled={!match} onClick={() => match && handleEditMatch(match)}>
            <Pencil className="h-3.5 w-3.5 mr-2" /> Editar partida
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminBracketSection({
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
    const result: Array<{ key: string; points: string; stroke: string; strokeWidth: number; opacity: number }> = [];

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
              <div key={item.position} className="absolute" style={{ left: item.x, top: item.y, width: item.width }}>
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
