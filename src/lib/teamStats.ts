import { unwrapList } from "./api";

type AnyRecord = Record<string, any>;

export type TeamMatchStatsSummary = {
  teamId: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  roundsWon: number;
  roundsLost: number;
  roundsDiff: number;
  plants: number;
  defuses: number;
  trophies: number;
};

const createEmptySummary = (teamId: number): TeamMatchStatsSummary => ({
  teamId,
  matchesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  roundsWon: 0,
  roundsLost: 0,
  roundsDiff: 0,
  plants: 0,
  defuses: 0,
  trophies: 0,
});

export function buildTeamMatchStatsSummaryMap(raw: any) {
  const rows = unwrapList(raw) as AnyRecord[];
  const map = new Map<number, TeamMatchStatsSummary>();

  for (const row of rows) {
    const teamId = Number(row?.teamId) || 0;
    if (!teamId) continue;

    const current = map.get(teamId) || createEmptySummary(teamId);
    const roundsWon = Number(row?.roundsWon) || 0;
    const roundsLost = Number(row?.roundsLost) || 0;
    const plants = Number(row?.plants) || 0;
    const defuses = Number(row?.defuses) || 0;
    const roundsDiff = roundsWon - roundsLost;

    current.matchesPlayed += 1;
    current.roundsWon += roundsWon;
    current.roundsLost += roundsLost;
    current.roundsDiff += roundsDiff;
    current.plants += plants;
    current.defuses += defuses;

    if (roundsWon > roundsLost) current.wins += 1;
    else if (roundsLost > roundsWon) current.losses += 1;
    else current.draws += 1;

    map.set(teamId, current);
  }

  return map;
}

export function getTeamMatchStatsSummary(
  teamId: number | string | null | undefined,
  summaryMap: Map<number, TeamMatchStatsSummary>,
) {
  const id = Number(teamId) || 0;
  return summaryMap.get(id) || createEmptySummary(id);
}
