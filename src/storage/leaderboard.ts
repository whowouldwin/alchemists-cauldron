import type { Difficulty } from "../data/recipes.ts";

export const LEADERBOARD_LIMIT = 10;

const LEADERBOARD_STORAGE_KEY = "alchemists-cauldron.leaderboard";
const PLAYER_NAME_PATTERN = /^[\p{L}\p{N} _-]+$/u;

export interface LeaderboardEntry {
  readonly name: string;
  readonly score: number;
  readonly achievedAt: number;
}

export interface LeaderboardStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function isValidPlayerName(name: string): boolean {
  return (
    name.length >= 2 &&
    name.length <= 15 &&
    name.trim().length > 0 &&
    PLAYER_NAME_PATTERN.test(name)
  );
}

export function qualifiesForLeaderboard(
  score: number,
  difficulty: Difficulty,
  storage?: LeaderboardStorage,
): boolean {
  if (!Number.isFinite(score) || score < 0) {
    return false;
  }

  const entries = readLeaderboard(difficulty, storage);
  const lowestRankedEntry = entries.at(-1);

  return (
    entries.length < LEADERBOARD_LIMIT ||
    (lowestRankedEntry !== undefined && score > lowestRankedEntry.score)
  );
}

export function readLeaderboard(
  difficulty: Difficulty,
  storage?: LeaderboardStorage,
): readonly LeaderboardEntry[] {
  try {
    const activeStorage = getStorage(storage);
    const rawEntries =
      activeStorage.getItem(getLeaderboardStorageKey(difficulty)) ??
      (difficulty === "medium"
        ? activeStorage.getItem(LEADERBOARD_STORAGE_KEY)
        : null);

    if (rawEntries === null) {
      return [];
    }

    const parsedEntries: unknown = JSON.parse(rawEntries);

    if (!Array.isArray(parsedEntries)) {
      return [];
    }

    return getTopEntries(parsedEntries.filter(isLeaderboardEntry));
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(
  name: string,
  score: number,
  difficulty: Difficulty,
  storage?: LeaderboardStorage,
  achievedAt: number = Date.now(),
): boolean {
  if (!isValidPlayerName(name) || !Number.isFinite(score) || score < 0) {
    return false;
  }

  if (!Number.isFinite(achievedAt) || achievedAt < 0) {
    return false;
  }

  try {
    const activeStorage = getStorage(storage);
    const existingEntries = readLeaderboard(difficulty, activeStorage);
    const nextEntries = getTopEntries([
      ...existingEntries,
      { name, score, achievedAt },
    ]);

    activeStorage.setItem(
      getLeaderboardStorageKey(difficulty),
      JSON.stringify(nextEntries),
    );

    return true;
  } catch {
    return false;
  }
}

export function clearLeaderboard(
  difficulty: Difficulty,
  storage?: LeaderboardStorage,
): boolean {
  try {
    const activeStorage = getStorage(storage);
    activeStorage.removeItem(getLeaderboardStorageKey(difficulty));

    if (difficulty === "medium") {
      activeStorage.removeItem(LEADERBOARD_STORAGE_KEY);
    }

    return true;
  } catch {
    return false;
  }
}

function getLeaderboardStorageKey(difficulty: Difficulty): string {
  return `${LEADERBOARD_STORAGE_KEY}.${difficulty}`;
}

function getStorage(storage?: LeaderboardStorage): LeaderboardStorage {
  return storage ?? window.localStorage;
}

function getTopEntries(
  entries: readonly LeaderboardEntry[],
): readonly LeaderboardEntry[] {
  return entries
    .map((entry, position) => ({ entry, position }))
    .sort(
      (first, second) =>
        second.entry.score - first.entry.score ||
        first.entry.achievedAt - second.entry.achievedAt ||
        first.position - second.position,
    )
    .slice(0, LEADERBOARD_LIMIT)
    .map(({ entry }) => entry);
}

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.name === "string" &&
    isValidPlayerName(entry.name) &&
    typeof entry.score === "number" &&
    Number.isFinite(entry.score) &&
    entry.score >= 0 &&
    typeof entry.achievedAt === "number" &&
    Number.isFinite(entry.achievedAt) &&
    entry.achievedAt >= 0
  );
}
