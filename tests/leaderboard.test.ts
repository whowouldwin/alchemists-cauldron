import assert from "node:assert/strict";
import test from "node:test";
import {
  clearLeaderboard,
  isValidPlayerName,
  LEADERBOARD_LIMIT,
  qualifiesForLeaderboard,
  readLeaderboard,
  saveLeaderboardEntry,
  type LeaderboardStorage,
} from "../src/storage/leaderboard.ts";

const MEDIUM_STORAGE_KEY = "alchemists-cauldron.leaderboard.medium";
const LEGACY_STORAGE_KEY = "alchemists-cauldron.leaderboard";

function createMemoryStorage(initialValues: Record<string, string> = {}) {
  const values = new Map(Object.entries(initialValues));

  const storage: LeaderboardStorage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };

  return { storage, getValue: (key: string) => values.get(key) ?? null };
}

test("accepts player names with the allowed characters and length", () => {
  assert.equal(isValidPlayerName("Alchemist-7"), true);
  assert.equal(isValidPlayerName("Moon Dust_2"), true);
  assert.equal(isValidPlayerName("Янтарь"), true);
  assert.equal(isValidPlayerName("A"), false);
  assert.equal(isValidPlayerName("SixteenCharsName"), false);
  assert.equal(isValidPlayerName("  "), false);
  assert.equal(isValidPlayerName("Mage!"), false);
});

test("sorts scores within a difficulty and preserves earlier equal scores", () => {
  const { storage } = createMemoryStorage();

  assert.equal(
    saveLeaderboardEntry("Second", 200, "medium", storage, 20),
    true,
  );
  assert.equal(saveLeaderboardEntry("First", 200, "medium", storage, 10), true);
  assert.equal(
    saveLeaderboardEntry("Champion", 400, "medium", storage, 30),
    true,
  );

  assert.deepEqual(readLeaderboard("medium", storage), [
    { name: "Champion", score: 400, achievedAt: 30 },
    { name: "First", score: 200, achievedAt: 10 },
    { name: "Second", score: 200, achievedAt: 20 },
  ]);
});

test("keeps an independent top ten for each difficulty", () => {
  const { storage } = createMemoryStorage();

  for (let score = 1; score <= LEADERBOARD_LIMIT + 2; score += 1) {
    assert.equal(
      saveLeaderboardEntry(`Mage${score}`, score, "easy", storage, score),
      true,
    );
  }

  assert.equal(saveLeaderboardEntry("HardMage", 900, "hard", storage), true);

  const easyEntries = readLeaderboard("easy", storage);

  assert.equal(easyEntries.length, LEADERBOARD_LIMIT);
  assert.equal(easyEntries[0].score, LEADERBOARD_LIMIT + 2);
  assert.equal(easyEntries.at(-1)?.score, 3);
  assert.deepEqual(readLeaderboard("medium", storage), []);
  const hardEntries = readLeaderboard("hard", storage);

  assert.equal(hardEntries.length, 1);
  assert.equal(hardEntries[0].name, "HardMage");
  assert.equal(hardEntries[0].score, 900);
});

test("uses old Level 1 scores as Medium leaderboard entries", () => {
  const legacyEntry = { name: "Mage", score: 300, achievedAt: 10 };
  const { storage, getValue } = createMemoryStorage({
    [LEGACY_STORAGE_KEY]: JSON.stringify([legacyEntry]),
  });

  assert.deepEqual(readLeaderboard("medium", storage), [legacyEntry]);
  assert.deepEqual(readLeaderboard("easy", storage), []);
  assert.equal(
    saveLeaderboardEntry("NewMage", 400, "medium", storage, 20),
    true,
  );
  assert.deepEqual(readLeaderboard("medium", storage), [
    { name: "NewMage", score: 400, achievedAt: 20 },
    legacyEntry,
  ]);
  assert.notEqual(getValue(MEDIUM_STORAGE_KEY), null);
});

test("ignores invalid entries in storage and handles malformed JSON", () => {
  const validEntry = { name: "Mage", score: 100, achievedAt: 10 };
  const invalidEntry = { name: "Bad!", score: 200, achievedAt: 20 };
  const { storage } = createMemoryStorage({
    "alchemists-cauldron.leaderboard.easy": JSON.stringify([
      validEntry,
      invalidEntry,
    ]),
    [MEDIUM_STORAGE_KEY]: "not-json",
  });

  assert.deepEqual(readLeaderboard("easy", storage), [validEntry]);
  assert.deepEqual(readLeaderboard("medium", storage), []);
});

test("does not crash when storage operations fail", () => {
  const failingStorage: LeaderboardStorage = {
    getItem() {
      throw new Error("Storage is unavailable");
    },
    setItem() {
      throw new Error("Storage is unavailable");
    },
    removeItem() {
      throw new Error("Storage is unavailable");
    },
  };

  assert.deepEqual(readLeaderboard("medium", failingStorage), []);
  assert.equal(
    saveLeaderboardEntry("Mage", 100, "medium", failingStorage),
    false,
  );
  assert.equal(clearLeaderboard("medium", failingStorage), false);
});

test("rejects invalid leaderboard entries before storing", () => {
  const { storage, getValue } = createMemoryStorage();

  assert.equal(saveLeaderboardEntry("M", 100, "medium", storage), false);
  assert.equal(saveLeaderboardEntry("Mage", -1, "medium", storage), false);
  assert.equal(getValue(MEDIUM_STORAGE_KEY), null);
});

test("clears only the selected difficulty leaderboard", () => {
  const { storage } = createMemoryStorage();

  assert.equal(saveLeaderboardEntry("EasyMage", 100, "easy", storage), true);
  assert.equal(
    saveLeaderboardEntry("MediumMage", 200, "medium", storage),
    true,
  );
  assert.equal(clearLeaderboard("easy", storage), true);
  assert.deepEqual(readLeaderboard("easy", storage), []);
  assert.equal(readLeaderboard("medium", storage).length, 1);
});

test("clears the migrated Level 1 scores with the Medium leaderboard", () => {
  const { storage } = createMemoryStorage({
    [LEGACY_STORAGE_KEY]: JSON.stringify([
      { name: "Mage", score: 100, achievedAt: 10 },
    ]),
  });

  assert.equal(clearLeaderboard("medium", storage), true);
  assert.deepEqual(readLeaderboard("medium", storage), []);
});

test("qualifies scores against only the selected difficulty list", () => {
  const { storage } = createMemoryStorage();

  assert.equal(qualifiesForLeaderboard(0, "easy", storage), true);

  for (let score = 1; score <= LEADERBOARD_LIMIT; score += 1) {
    saveLeaderboardEntry(`Mage${score}`, score * 100, "easy", storage, score);
  }

  assert.equal(qualifiesForLeaderboard(101, "easy", storage), true);
  assert.equal(qualifiesForLeaderboard(100, "easy", storage), false);
  assert.equal(qualifiesForLeaderboard(100, "hard", storage), true);
  assert.equal(qualifiesForLeaderboard(-1, "easy", storage), false);
});
