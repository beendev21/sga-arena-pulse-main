export type GameLabel = "COUNTER-STRIKE 2" | "VALORANT" | "LEAGUE OF LEGENDS";

const GAME_ALIASES: Record<string, GameLabel> = {
  "CS2": "COUNTER-STRIKE 2",
  "COUNTER-STRIKE 2": "COUNTER-STRIKE 2",
  "COUNTER STRIKE 2": "COUNTER-STRIKE 2",
  "COUNTERSTRIKE2": "COUNTER-STRIKE 2",
  "VALORANT": "VALORANT",
  "LEAGUE OF LEGENDS": "LEAGUE OF LEGENDS",
  "LOL": "LEAGUE OF LEGENDS",
};

export function normalizeGame(value?: string | null): GameLabel | undefined {
  if (!value) return undefined;
  const key = value.trim().toUpperCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
  return GAME_ALIASES[key.replace(/\s/g, "")] || GAME_ALIASES[key];
}

export function matchesGame(value: string | undefined | null, target: GameLabel): boolean {
  return normalizeGame(value) === target;
}

