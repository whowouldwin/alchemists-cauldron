import {
  createDiscoveryJournal,
  recordRecipeDiscovery,
  recordReactionDiscoveries,
  type DiscoveryJournal,
} from "../progress/discovery-journal.ts";

const DISCOVERY_JOURNAL_STORAGE_KEY = "alchemists-cauldron.journal";

export interface DiscoveryJournalStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface SavedDiscoveryJournal extends DiscoveryJournal {
  readonly version: 1;
}

export function loadDiscoveryJournal(
  storage?: DiscoveryJournalStorage,
): DiscoveryJournal {
  try {
    const activeStorage = storage ?? window.localStorage;
    const rawJournal = activeStorage.getItem(DISCOVERY_JOURNAL_STORAGE_KEY);

    if (rawJournal === null) {
      return createDiscoveryJournal();
    }

    const savedJournal: unknown = JSON.parse(rawJournal);

    if (!isSavedDiscoveryJournal(savedJournal)) {
      return createDiscoveryJournal();
    }

    let journal = createDiscoveryJournal();

    for (const recipeId of savedJournal.recipeIds) {
      journal = recordRecipeDiscovery(journal, recipeId);
    }

    return recordReactionDiscoveries(journal, savedJournal.reactionIds);
  } catch {
    return createDiscoveryJournal();
  }
}

export function saveDiscoveryJournal(
  journal: DiscoveryJournal,
  storage?: DiscoveryJournalStorage,
): boolean {
  try {
    const activeStorage = storage ?? window.localStorage;
    const savedJournal: SavedDiscoveryJournal = {
      version: 1,
      recipeIds: journal.recipeIds,
      reactionIds: journal.reactionIds,
    };

    activeStorage.setItem(
      DISCOVERY_JOURNAL_STORAGE_KEY,
      JSON.stringify(savedJournal),
    );

    return true;
  } catch {
    return false;
  }
}

function isSavedDiscoveryJournal(
  value: unknown,
): value is SavedDiscoveryJournal {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "version" in value &&
    value.version === 1 &&
    "recipeIds" in value &&
    isStringArray(value.recipeIds) &&
    "reactionIds" in value &&
    isStringArray(value.reactionIds)
  );
}

function isStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}
