import assert from "node:assert/strict";
import test from "node:test";
import {
  loadDiscoveryJournal,
  saveDiscoveryJournal,
  type DiscoveryJournalStorage,
} from "../src/storage/discovery-journal.ts";

const JOURNAL_KEY = "alchemists-cauldron.journal";

function createMemoryStorage(initialValues: Record<string, string> = {}) {
  const values = new Map(Object.entries(initialValues));
  const storage: DiscoveryJournalStorage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };

  return { storage, values };
}

test("starts with an empty journal when there is no saved progress", () => {
  const { storage } = createMemoryStorage();

  assert.deepEqual(loadDiscoveryJournal(storage), {
    recipeIds: [],
    reactionIds: [],
  });
});

test("saves a versioned journal and restores it without touching other data", () => {
  const { storage, values } = createMemoryStorage({
    "alchemists-cauldron.save": "existing game save",
    "alchemists-cauldron.leaderboard.medium": "existing scores",
  });
  const journal = {
    recipeIds: ["moon-mist", "acid-spark"],
    reactionIds: ["bubbling", "solar-frost"],
  };

  assert.equal(saveDiscoveryJournal(journal, storage), true);

  const rawJournal = values.get(JOURNAL_KEY);

  assert.ok(rawJournal !== undefined);
  assert.deepEqual(JSON.parse(rawJournal), { version: 1, ...journal });
  assert.equal(values.get("alchemists-cauldron.save"), "existing game save");
  assert.equal(
    values.get("alchemists-cauldron.leaderboard.medium"),
    "existing scores",
  );
  assert.equal(values.size, 3);
  assert.deepEqual(loadDiscoveryJournal(storage), journal);
});

test("restores known discoveries once and keeps their original order", () => {
  const { storage } = createMemoryStorage({
    [JOURNAL_KEY]: JSON.stringify({
      version: 1,
      recipeIds: ["acid-spark", "unknown-recipe", "acid-spark", "moon-mist"],
      reactionIds: [
        "solar-frost",
        "unknown-reaction",
        "solar-frost",
        "bubbling",
      ],
    }),
  });

  assert.deepEqual(loadDiscoveryJournal(storage), {
    recipeIds: ["acid-spark", "moon-mist"],
    reactionIds: ["solar-frost", "bubbling"],
  });
});

test("handles malformed or unsupported saves without deleting stored data", () => {
  const invalidSaves = [
    "not-json",
    "null",
    "[]",
    JSON.stringify({ recipeIds: [], reactionIds: [] }),
    JSON.stringify({ version: 2, recipeIds: [], reactionIds: [] }),
    JSON.stringify({ version: 1, recipeIds: "moon-mist", reactionIds: [] }),
    JSON.stringify({ version: 1, recipeIds: [], reactionIds: null }),
    JSON.stringify({ version: 1, recipeIds: [42], reactionIds: [] }),
    JSON.stringify({ version: 1, recipeIds: [], reactionIds: [false] }),
  ];

  for (const rawSave of invalidSaves) {
    const { storage, values } = createMemoryStorage({ [JOURNAL_KEY]: rawSave });

    assert.deepEqual(loadDiscoveryJournal(storage), {
      recipeIds: [],
      reactionIds: [],
    });
    assert.equal(values.get(JOURNAL_KEY), rawSave);
  }
});

test("handles unavailable storage without throwing", () => {
  const unavailableStorage: DiscoveryJournalStorage = {
    getItem() {
      throw new Error("Storage is unavailable");
    },
    setItem() {
      throw new Error("Storage is unavailable");
    },
  };
  const journal = { recipeIds: ["moon-mist"], reactionIds: [] };

  assert.deepEqual(loadDiscoveryJournal(unavailableStorage), {
    recipeIds: [],
    reactionIds: [],
  });
  assert.equal(saveDiscoveryJournal(journal, unavailableStorage), false);
});

test("reports a failed write and leaves the previous save readable", () => {
  const previousJournal = { recipeIds: ["moon-mist"], reactionIds: [] };
  const { storage } = createMemoryStorage({
    [JOURNAL_KEY]: JSON.stringify({ version: 1, ...previousJournal }),
  });
  const fullStorage: DiscoveryJournalStorage = {
    getItem: storage.getItem,
    setItem() {
      throw new Error("Storage quota exceeded");
    },
  };

  assert.equal(
    saveDiscoveryJournal(
      { recipeIds: ["moon-mist", "acid-spark"], reactionIds: ["bubbling"] },
      fullStorage,
    ),
    false,
  );
  assert.deepEqual(loadDiscoveryJournal(storage), previousJournal);
});
