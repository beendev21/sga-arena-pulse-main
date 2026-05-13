import { faker } from "@faker-js/faker";

faker.seed(7);

export type Team = {
  id: string;
  name: string;
  tag: string;
  logo: string;
  elo: number;
  wins: number;
  losses: number;
  rounds_diff: number;
  trophies: number;
  bannerColor: string;
};

export type Player = {
  id: string;
  nick: string;
  name: string;
  avatar: string;
  teamId: string;
  role: "Duelist" | "Controller" | "Sentinel" | "Initiator" | "Flex";
  kills: number;
  deaths: number;
  assists: number;
  defuses: number;
  plants: number;
  rating: number;
  hs: number;
};

export type Tournament = {
  id: string;
  name: string;
  banner: string;
  status: "Ao vivo" | "Inscrições" | "Inscrições abertas" | "Encerrado" | "Em breve";
  teamsCount: number;
  prize: string;
  startDate: string;
  endDate: string;
  location?: string;
  category?: string;
  description?: string;
};

export type Match = {
  id: string;
  tournamentId: string;
  tournamentName: string;
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  map: string;
  status: "Agendada" | "Ao vivo" | "Encerrada";
  startsAt: string;
  mvpId?: string;
};

export type Highlight = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  videoUrl: string;
  player: string;
};

const MAPS = ["Bind", "Haven", "Split", "Ascent", "Icebox", "Breeze", "Lotus", "Sunset", "Pearl"];
const ROLES: Player["role"][] = ["Duelist", "Controller", "Sentinel", "Initiator", "Flex"];
const TEAM_COLORS = [
  "#ff2a4d", "#7c3aed", "#06b6d4", "#22c55e",
  "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444",
];
const TEAM_NAMES = [
  ["Phantom", "PHM"],
  ["Vanguard", "VGD"],
  ["Eclipse", "ECL"],
  ["Nebula", "NBL"],
  ["Crimson", "CRM"],
  ["Spectre", "SPC"],
  ["Reactor", "RCT"],
  ["Aurora", "AUR"],
];

function pic(id: string, w = 800, h = 600) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;
}

export const teams: Team[] = TEAM_NAMES.map(([name, tag], i) => {
  const wins = faker.number.int({ min: 8, max: 28 });
  const losses = faker.number.int({ min: 2, max: 18 });
  return {
    id: `team-${i + 1}`,
    name: `Team ${name}`,
    tag,
    logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}&backgroundColor=000000&backgroundType=solid`,
    elo: faker.number.int({ min: 1500, max: 3200 }),
    wins,
    losses,
    rounds_diff: faker.number.int({ min: -40, max: 220 }),
    trophies: faker.number.int({ min: 0, max: 6 }),
    bannerColor: TEAM_COLORS[i],
  };
}).sort((a, b) => b.elo - a.elo);

export const players: Player[] = Array.from({ length: 40 }).map((_, i) => {
  const team = teams[i % teams.length];
  const kills = faker.number.int({ min: 180, max: 620 });
  const deaths = faker.number.int({ min: 120, max: 480 });
  const assists = faker.number.int({ min: 60, max: 280 });
  const rating = +(0.7 + Math.random() * 0.9).toFixed(2);
  return {
    id: `p-${i + 1}`,
    nick: faker.internet
      .username()
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10),
    name: faker.person.fullName(),
    avatar: `https://i.pravatar.cc/150?u=${i}`,
    teamId: team.id,
    role: ROLES[i % ROLES.length],
    kills,
    deaths,
    assists,
    defuses: faker.number.int({ min: 5, max: 60 }),
    plants: faker.number.int({ min: 5, max: 70 }),
    rating,
    hs: faker.number.int({ min: 18, max: 52 }),
  };
}).sort((a, b) => b.rating - a.rating);

export const tournaments: Tournament[] = [
  {
    id: "t-1", name: "VCT Ribeirão - Série A",
    banner: pic("1542751371-adc38448a05e", 1200, 600), // Arena Stadium
    status: "Ao vivo", teamsCount: 8, prize: "R$ 25.000",
    startDate: "2026-05-01", endDate: "2026-05-12",
  },
  {
    id: "t-2", name: "VCT Ribeirão - Série C",
    banner: pic("1511512578047-dfb367046420", 1200, 600), // Neon Gaming Setup
    status: "Inscrições", teamsCount: 16, prize: "Consultar",
    startDate: "2026-05-31T18:00:00Z", endDate: "2026-05-31T23:59:59Z",
    location: "Ribeirão Preto",
    category: "Série C",
    description: "Campeonato presencial — vagas limitadas"
  },
  {
    id: "t-3", name: "VCT Ribeirão - Série B",
    banner: pic("1538481199705-c710c4e965fc", 1200, 600), // Close-up Keyboard
    status: "Em breve", teamsCount: 16, prize: "Consultar",
    startDate: "2026-06-07T18:00:00Z", endDate: "2026-06-07T23:59:59Z",
    location: "Ribeirão Preto",
    category: "Série B",
    description: "Campeonato presencial — vagas limitadas"
  },
  {
    id: "t-4", name: "CS Prime - Ribeirão Preto",
    banner: pic("1552820728-8b83bb6b773f", 1200, 600), // High-end Gaming PC
    status: "Inscrições", teamsCount: 16, prize: "Consultar",
    startDate: "2026-06-14T18:00:00Z", endDate: "2026-06-14T23:59:59Z",
    location: "Ribeirão Preto",
    category: "All Rank",
    description: "Campeonato presencial — vagas limitadas"
  },
  {
    id: "t-5", name: "SGA League RP",
    banner: pic("1560253023-3ee5d6428ad7", 1200, 600), // Competitive Crowd
    status: "Inscrições", teamsCount: 32, prize: "Consultar",
    startDate: "2026-07-12T18:00:00Z", endDate: "2026-07-12T23:59:59Z",
    location: "Ribeirão Preto",
    category: "All Rank",
    description: "Campeonato presencial — vagas limitadas"
  },
];

export const lastTournament = {
  ...tournaments[3],
  podium: [
    { team: teams[0], score: 13, mvp: players[0] },
    { team: teams[1], score: 9 },
    { team: teams[2], score: 7 },
  ],
};

function makeMatch(i: number, status: Match["status"]): Match {
  const a = teams[i % teams.length];
  const b = teams[(i + 3) % teams.length];
  const scoreA = status === "Agendada" ? 0 : faker.number.int({ min: 6, max: 13 });
  const scoreB = status === "Agendada" ? 0 : faker.number.int({ min: 4, max: 13 });
  return {
    id: `m-${i + 1}`,
    tournamentId: tournaments[i % tournaments.length].id,
    tournamentName: tournaments[i % tournaments.length].name,
    teamA: a,
    teamB: b,
    scoreA, scoreB,
    map: MAPS[i % MAPS.length],
    status,
    startsAt: faker.date.soon({ days: 14 }).toISOString(),
    mvpId: status === "Encerrada" ? players[i % players.length].id : undefined,
  };
}

export const matches: Match[] = [
  ...Array.from({ length: 4 }, (_, i) => makeMatch(i, "Ao vivo")),
  ...Array.from({ length: 8 }, (_, i) => makeMatch(i + 4, "Agendada")),
  ...Array.from({ length: 8 }, (_, i) => makeMatch(i + 12, "Encerrada")),
];

export const highlights: Highlight[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `h-${i + 1}`,
  title: faker.helpers.arrayElement([
    "1v4 Clutch insano",
    "Ace na final",
    "Defuse no último segundo",
    "Operator wallbang",
    "Triple kill heroico",
    "Retake impossível",
  ]) + ` — ${players[i].nick}`,
  thumbnail: pic(["1542751371-adc38448a05e", "1538481199705-c710c4e965fc", "1511512578047-dfb367046420"][i % 3], 640, 360),
  duration: `${faker.number.int({ min: 0, max: 1 })}:${faker.number.int({ min: 12, max: 59 })}`,
  videoUrl: "https://www.w3.org/2010/05/sintel/trailer.mp4",
  player: players[i].nick,
}));

export const gallery: string[] = [
  "1542751371-adc38448a05e", "1511512578047-dfb367046420", "1538481199705-c710c4e965fc",
  "1552820728-8b83bb6b773f", "1560253023-3ee5d6428ad7", "1624138784614-87fd1b6528f8",
  "1542751110-97fb1d0247df", "1493711662002-2214d9a96222", "1593305841255-857f20fb133e",
  "1519326840947-7d9a13432fa0", "1550745162-3c83a0463102", "1454160811261-af42d6d0b4ef"
].map(id => pic(id));

export const bracket = {
  quarters: [
    { a: teams[0], b: teams[7], scoreA: 13, scoreB: 9, winner: 0 },
    { a: teams[1], b: teams[6], scoreA: 11, scoreB: 13, winner: 1 },
    { a: teams[2], b: teams[5], scoreA: 13, scoreB: 7, winner: 0 },
    { a: teams[3], b: teams[4], scoreA: 8, scoreB: 13, winner: 1 },
  ],
  semis: [
    { a: teams[0], b: teams[6], scoreA: 13, scoreB: 11, winner: 0 },
    { a: teams[2], b: teams[4], scoreA: 9, scoreB: 13, winner: 1 },
  ],
  final: { a: teams[0], b: teams[4], scoreA: 13, scoreB: 10, winner: 0 },
};

export function getTeam(id: string) { return teams.find((t) => t.id === id); }
export function getPlayer(id: string) { return players.find((p) => p.id === id); }
export function getTournament(id: string) { return tournaments.find((t) => t.id === id); }
export function getMatch(id: string) { return matches.find((m) => m.id === id); }
export function getTeamPlayers(teamId: string) { return players.filter((p) => p.teamId === teamId); }
