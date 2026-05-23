export const tabs = [
  { k: "campeonatos", label: "Campeonatos" },
  { k: "times", label: "Times" },
  { k: "jogadores", label: "Jogadores" },
  { k: "chaveamentos", label: "Chaveamentos" },
  { k: "monitoramento", label: "Monitoramento Ao Vivo" },
  { k: "highlights", label: "Highlights" },
  { k: "galeria", label: "Galereria" },
  { k: "ia", label: "IA" },
] as const;

export type AdminTabKey = (typeof tabs)[number]["k"];

export type AdminBracketRound = {
  key: string;
  title: string;
  accentClass: string;
  lineClass: string;
  cardClass: string;
  positions: readonly string[];
};

export type AdminBracketPositionedMatch = {
  position: string;
  roundIndex: number;
  positionIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const createEmptyPlayer = () => ({
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

export const createEmptyTeam = () => ({
  name: "",
  description: "",
  tag: "",
  logoUrl: "",
  bannerColor: "#f86d83",
  gameId: 0,
  elo: 0,
});

export const createEmptyTeamMatchStats = () => ({
  id: 0,
  teamId: 0,
  matchId: 0,
  roundsWon: 0,
  roundsLost: 0,
  plants: 0,
  defuses: 0,
});

export const createEmptyTeamParticipant = () => ({
  roleId: 0,
  playerId: 0,
  isActive: true,
  isStarter: true,
  isCaptain: false,
  isSubstitute: false,
});

export const createEmptyTeamParticipantDraft = () => ({
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

export const createEmptyTournament = () => ({
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

export const createEmptyMatch = () => ({
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

export const ADMIN_BRACKET_CARD_WIDTH = 290;
export const ADMIN_BRACKET_FINAL_CARD_WIDTH = 360;
export const ADMIN_BRACKET_CARD_HEIGHT = 420;
export const ADMIN_BRACKET_FINAL_CARD_HEIGHT = 320;
export const ADMIN_BRACKET_COLUMN_GAP = 155;
export const ADMIN_BRACKET_ROW_GAP = 600;
export const ADMIN_BRACKET_SECTION_PADDING_X = 130;
export const ADMIN_BRACKET_SECTION_PADDING_Y = 92;
export const BRACKET_STORAGE_KEY = "sga-admin-bracket-layouts";

export const BRACKET_UPPER_ROUNDS = [
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

export const BRACKET_LOWER_ROUNDS = [
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

export const BRACKET_PROGRESS_MAP: Record<
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

export const BRACKET_LOSER_PROGRESS_MAP: Record<
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

export const BRACKET_PHASE_LABELS: Record<string, string> = {
  QF: "Quartas de Final",
  SF: "Semifinal",
  F: "Final",
  LB: "Lower Bracket",
};

export const BRACKET_STAGE_HINTS: Record<string, string[]> = {
  QF: ["quart", "quarter"],
  SF: ["semi", "semi-final", "semifinal"],
  F: ["final"],
  LB: ["lower", "loser", "repesc", "repech"],
};
