import { useMemo } from "react";

type Team = {
  name: string;
  tag: string;
  logo?: string;
  logoUrl?: string;
  imageUrl?: string;
  bannerColor?: string;
};

type Match = {
  id: string;
  tournamentId: string;
  teamA?: Team;
  teamB?: Team;
  scoreA?: number | null;
  scoreB?: number | null;
  bracketPosition: string;
  status?: string;
};

type RoundGroup = {
  key: string;
  title: string;
  matches: Match[];
  accent: string;
  line: string;
};

type PositionedMatch = {
  match: Match;
  roundIndex: number;
  matchIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

const CARD_WIDTH = 285;
const CARD_HEIGHT = 88;
const COLUMN_GAP = 155;
const ROW_GAP = 24;
const SECTION_PADDING_X = 200;
const SECTION_PADDING_Y = 70;

function normalizePosition(position: string) {
  return String(position || "")
    .trim()
    .toUpperCase();
}

function positionPrefix(position: string) {
  return normalizePosition(position).split("-")[0] || "";
}

function positionOrder(position: string) {
  const suffix = String(position || "")
    .split("-")
    .slice(1)
    .join("-");
  const match = suffix.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function readRoundWeight(prefix: string) {
  if (prefix === "F" || prefix === "R2") return 2;
  if (prefix === "SF" || prefix === "R4") return 4;
  if (prefix === "QF" || prefix === "R8") return 8;

  const direct = prefix.match(/^R(\d+)$/)?.[1];
  return direct ? Number(direct) : 0;
}

function roundTitle(prefix: string, sectionLabel: string) {
  if (prefix === "F" || prefix === "R2") return "GRANDE FINAL";
  if (prefix === "SF" || prefix === "R4") return "JOGO 8";
  if (prefix === "QF" || prefix === "R8") return "JOGO 3";

  const direct = prefix.match(/^R(\d+)$/)?.[1];
  if (!direct) return sectionLabel;

  const teamsRemaining = Number(direct);
  if (teamsRemaining === 16) return "JOGO 1";
  if (teamsRemaining === 8) return "JOGO 3";
  if (teamsRemaining === 4) return "JOGO 7";
  if (teamsRemaining === 2) return "GRANDE FINAL";

  return `R${teamsRemaining}`;
}

function isDoubleElimination(bracketType?: string, matches?: Match[]) {
  const normalized = String(bracketType || "").toLowerCase();
  if (normalized.includes("double") || normalized.includes("lower") || normalized.includes("dupla"))
    return true;

  return Boolean(matches?.some((match) => positionPrefix(match.bracketPosition).startsWith("LB")));
}

function buildSections(matches: Match[]) {
  const upperMatches = matches.filter(
    (match) => !positionPrefix(match.bracketPosition).startsWith("LB"),
  );
  const lowerMatches = matches.filter((match) =>
    positionPrefix(match.bracketPosition).startsWith("LB"),
  );

  const groupByPrefix = (list: Match[], sectionLabel: string): RoundGroup[] => {
    const map = new Map<string, Match[]>();

    for (const match of list) {
      const prefix = positionPrefix(match.bracketPosition) || sectionLabel;
      const current = map.get(prefix) ?? [];
      current.push(match);
      map.set(prefix, current);
    }

    return Array.from(map.entries())
      .map(([key, roundMatches], index) => ({
        key,
        title: roundTitle(key, sectionLabel),
        matches: roundMatches.sort(
          (a, b) => positionOrder(a.bracketPosition) - positionOrder(b.bracketPosition),
        ),
        accent:
          sectionLabel === "LOWER"
            ? index % 2 === 0
              ? "text-valorant"
              : "text-cs2"
            : index % 3 === 0
              ? "text-primary"
              : index % 3 === 1
                ? "text-neon"
                : "text-warning",
        line:
          sectionLabel === "LOWER"
            ? index % 2 === 0
              ? "bg-valorant"
              : "bg-cs2"
            : index % 3 === 0
              ? "bg-primary"
              : index % 3 === 1
                ? "bg-neon"
                : "bg-warning",
      }))
      .sort((a, b) => readRoundWeight(a.key) - readRoundWeight(b.key));
  };

  const buildLowerRounds = (list: Match[]): RoundGroup[] => {
    const sorted = [...list].sort(
      (a, b) => positionOrder(a.bracketPosition) - positionOrder(b.bracketPosition),
    );
    const finals = sorted.filter(
      (match) =>
        /F(?:INAL)?$/iu.test(positionPrefix(match.bracketPosition)) ||
        /-F(?:INAL)?$/iu.test(normalizePosition(match.bracketPosition)),
    );
    const numeric = sorted.filter((match) => !finals.includes(match));
    const rounds: RoundGroup[] = [];

    for (let index = 0; index < numeric.length; index += 2) {
      const chunk = numeric.slice(index, index + 2);
      if (chunk.length === 0) continue;

      rounds.push({
        key: `LB-${rounds.length + 1}`,
        title: `JOGO ${positionOrder(chunk[0]!.bracketPosition) || index + 1}`,
        matches: chunk,
        accent: rounds.length % 2 === 0 ? "text-valorant" : "text-cs2",
        line: rounds.length % 2 === 0 ? "bg-valorant" : "bg-cs2",
      });
    }

    for (const finalMatch of finals) {
      rounds.push({
        key: finalMatch.bracketPosition,
        title: "GRANDE FINAL",
        matches: [finalMatch],
        accent: "text-primary",
        line: "bg-primary",
      });
    }

    return rounds;
  };

  return {
    upper: groupByPrefix(upperMatches, "UPPER"),
    lower: buildLowerRounds(lowerMatches),
  };
}

function teamName(team?: Team) {
  return team?.name?.trim() || team?.tag?.trim() || "AGUARDANDO";
}

function cardTone(index: number, isLower: boolean) {
  if (isLower) {
    return index % 2 === 0
      ? { top: "bg-[#e15a00] text-white", bottom: "bg-[#d7d7d7] text-black" }
      : { top: "bg-[#d94f00] text-white", bottom: "bg-[#e5a100] text-black" };
  }

  return index % 2 === 0
    ? { top: "bg-[#e25b00] text-white", bottom: "bg-[#dadada] text-black" }
    : { top: "bg-[#d94f00] text-white", bottom: "bg-[#ececec] text-black" };
}

function MatchCard({
  match,
  index,
  isLower,
  variant = "regular",
}: {
  match: Match;
  index: number;
  isLower: boolean;
  variant?: "regular" | "final";
}) {
  const tones = cardTone(index, isLower);
  const isFinal = variant === "final";

  return (
    <div
      className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#07080c] shadow-[0_20px_48px_rgba(0,0,0,0.45)]"
      style={{ width: isFinal ? 360 : CARD_WIDTH, minHeight: isFinal ? 190 : CARD_HEIGHT }}
    >
      <div
        className={`flex items-center justify-center px-4 text-center font-black uppercase ${tones.top}`}
        style={{ height: isFinal ? 92 : 44, fontSize: isFinal ? 30 : 24 }}
      >
        <span className="truncate">{teamName(match.teamA)}</span>
      </div>
      <div className="h-[3px] bg-white/10" />
      <div
        className={`flex items-center justify-center px-4 text-center font-black uppercase ${tones.bottom}`}
        style={{ height: isFinal ? 92 : 44, fontSize: isFinal ? 30 : 24 }}
      >
        <span className="truncate">{teamName(match.teamB)}</span>
      </div>
    </div>
  );
}

function BracketCanvas({ rounds, isLower }: { rounds: RoundGroup[]; isLower: boolean }) {
  const layout = useMemo(() => {
    const positioned: PositionedMatch[] = [];

    for (let roundIndex = 0; roundIndex < rounds.length; roundIndex += 1) {
      const round = rounds[roundIndex]!;
      const currentMatches = round.matches;

      for (let matchIndex = 0; matchIndex < currentMatches.length; matchIndex += 1) {
        const match = currentMatches[matchIndex]!;
        let centerY: number;

        if (roundIndex === 0) {
          centerY = matchIndex * (CARD_HEIGHT + ROW_GAP) + CARD_HEIGHT / 2;
        } else {
          const prevRound = rounds[roundIndex - 1];
          const prevA = positioned.find(
            (item) => item.roundIndex === roundIndex - 1 && item.matchIndex === matchIndex * 2,
          );
          const prevB = positioned.find(
            (item) => item.roundIndex === roundIndex - 1 && item.matchIndex === matchIndex * 2 + 1,
          );

          if (prevA && prevB) {
            centerY = (prevA.y + CARD_HEIGHT / 2 + prevB.y + CARD_HEIGHT / 2) / 2;
          } else if (prevA) {
            centerY = prevA.y + CARD_HEIGHT / 2;
          } else if (prevB) {
            centerY = prevB.y + CARD_HEIGHT / 2;
          } else {
            centerY = matchIndex * (CARD_HEIGHT + ROW_GAP) + CARD_HEIGHT / 2;
          }

          if (prevRound?.matches.length === 1) {
            const prev = positioned.find((item) => item.roundIndex === roundIndex - 1);
            if (prev) centerY = prev.y + CARD_HEIGHT / 2;
          }
        }

        positioned.push({
          match,
          roundIndex,
          matchIndex,
          x: SECTION_PADDING_X + roundIndex * (CARD_WIDTH + COLUMN_GAP),
          y: SECTION_PADDING_Y + centerY - CARD_HEIGHT / 2,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });
      }
    }

    const width =
      positioned.reduce((max, item) => Math.max(max, item.x + item.width), 0) + SECTION_PADDING_X;
    const height =
      positioned.reduce((max, item) => Math.max(max, item.y + item.height), 0) + SECTION_PADDING_Y;

    return {
      positioned,
      width,
      height,
      rounds: rounds.map((round, roundIndex) => ({
        key: round.key,
        title: round.title,
        accent: round.accent,
        x: SECTION_PADDING_X + roundIndex * (CARD_WIDTH + COLUMN_GAP),
        isFinal: roundIndex === rounds.length - 1,
      })),
    };
  }, [rounds]);

  const lines = useMemo(() => {
    const result: Array<{
      key: string;
      points: string;
      stroke: string;
      strokeWidth: number;
    }> = [];

    for (const item of layout.positioned) {
      const next = layout.positioned.find(
        (candidate) =>
          candidate.roundIndex === item.roundIndex + 1 &&
          candidate.matchIndex === Math.floor(item.matchIndex / 2),
      );

      if (!next) continue;

      const childX = item.x + item.width;
      const childY = item.y + item.height / 2;
      const parentX = next.x;
      const parentY = next.y + next.height / 2;
      const middleX = childX + COLUMN_GAP / 2;

      result.push({
        key: `${item.match.id}-${next.match.id}`,
        points: [
          `${childX},${childY}`,
          `${middleX},${childY}`,
          `${middleX},${parentY}`,
          `${parentX},${parentY}`,
        ].join(" "),
        stroke: isLower ? "#ffffff" : "#ff6a00",
        strokeWidth: isLower ? 3 : 3.5,
      });
    }

    return result;
  }, [isLower, layout.positioned]);

  return (
    <div className="relative overflow-x-auto">
      <div
        className="relative min-w-max pb-10"
        style={{ width: layout.width, height: layout.height + 60 }}
      >
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox={`0 0 ${layout.width} ${layout.height + 60}`}
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
              opacity={isLower ? 0.95 : 1}
            />
          ))}
        </svg>

        {layout.positioned.map((item) => (
          <div
            key={item.match.id}
            className="absolute"
            style={{ left: item.x, top: item.y, width: item.width }}
          >
            <MatchCard
              match={item.match}
              index={item.matchIndex}
              isLower={isLower}
              variant={item.roundIndex === rounds.length - 1 ? "final" : "regular"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Bracket({
  matches = [],
  bracketType,
}: {
  matches?: Match[];
  bracketType?: string;
}) {
  const sections = useMemo(() => buildSections(matches), [matches]);
  const doubleElim = isDoubleElimination(bracketType, matches);

  if (!sections.upper.length && !sections.lower.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/10 bg-black/20 p-20 text-center">
        <div className="text-[11px] font-black uppercase tracking-[0.45em] text-white/40 italic">
          Chaveamento nao definido
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <section className="rounded-[32px] border border-white/5 bg-black/75 p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[12px] font-black uppercase tracking-[0.42em] text-white">
              UPPER
            </div>
            <div className="text-sm uppercase tracking-[0.28em] text-white/35">Chave principal</div>
          </div>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <BracketCanvas rounds={sections.upper} isLower={false} />
      </section>

      {(doubleElim || sections.lower.length > 0) && (
        <section className="rounded-[32px] border border-white/5 bg-black/70 p-6 md:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[12px] font-black uppercase tracking-[0.42em] text-white">
                LOWER
              </div>
              <div className="text-sm uppercase tracking-[0.28em] text-white/35">Repescagem</div>
            </div>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {sections.lower.length > 0 ? (
            <BracketCanvas rounds={sections.lower} isLower />
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-[10px] font-black uppercase tracking-[0.35em] text-white/35 italic">
              Sem confrontos de lower bracket
            </div>
          )}
        </section>
      )}
    </div>
  );
}
