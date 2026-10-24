import assert from "node:assert/strict";
import test from "node:test";
import {
  clearLeaderboard,
  isValidPlayerName,
  LEADERBOARD_LIMIT,
  readLeaderboard,
  saveLeaderboardEntry,
  type LeaderboardStorage,
} from "../src/storage/leaderboard.ts";

function createMemoryStorage(initialValue: string | null = null) {
  let value = initialValue;

  const storage: LeaderboardStorage = {
    getItem() {
      return value;
    },
    setItem(_key, nextValue) {
      value = nextValue;
    },
    removeItem() {
      value = null;
    },
  };

  return { storage, getValue: () => value };
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

test("stores entries sorted by score and preserves earlier equal scores", () => {
  const { storage } = createMemoryStorage();

  assert.equal(saveLeaderboardEntry("Second", 200, storage, 20), true);
  assert.equal(saveLeaderboardEntry("First", 200, storage, 10), true);
  assert.equal(saveLeaderboardEntry("Champion", 400, storage, 30), true);

  assert.deepEqual(readLeaderboard(storage), [
    { name: "Champion", score: 400, achievedAt: 30 },
    { name: "First", score: 200, achievedAt: 10 },
    { name: "Second", score: 200, achievedAt: 20 },
  ]);
});

test("keeps only the top ten entries", () => {
  const { storage } = createMemoryStorage();

  for (let score = 1; score <= LEADERBOARD_LIMIT + 2; score += 1) {
    assert.equal(
      saveLeaderboardEntry(`Mage${score}`, score, storage, score),
      true,
    );
  }

  const entries = readLeaderboard(storage);

  assert.equal(entries.length, LEADERBOARD_LIMIT);
  assert.equal(entries[0].score, LEADERBOARD_LIMIT + 2);
  assert.equal(entries.at(-1)?.score, 3);
});

test("ignores invalid entries in stored data and handles malformed JSON", () => {
  const validEntry = { name: "Mage", score: 100, achievedAt: 10 };
  const invalidEntry = { name: "Bad!", score: 200, achievedAt: 20 };
  const validStorage = createMemoryStorage(
    JSON.stringify([validEntry, invalidEntry]),
  );
  const malformedStorage = createMemoryStorage("not-json");

  assert.deepEqual(readLeaderboard(validStorage.storage), [validEntry]);
  assert.deepEqual(readLeaderboard(malformedStorage.storage), []);
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

  assert.deepEqual(readLeaderboard(failingStorage), []);
  assert.equal(saveLeaderboardEntry("Mage", 100, failingStorage), false);
  assert.equal(clearLeaderboard(failingStorage), false);
});

test("rejects invalid leaderboard entries before storing", () => {
  const { storage, getValue } = createMemoryStorage();

  assert.equal(saveLeaderboardEntry("M", 100, storage), false);
  assert.equal(saveLeaderboardEntry("Mage", -1, storage), false);
  assert.equal(getValue(), null);
});

test("clears the saved leaderboard", () => {
  const { storage } = createMemoryStorage();

  assert.equal(saveLeaderboardEntry("Mage", 100, storage), true);
  assert.equal(clearLeaderboard(storage), true);
  assert.deepEqual(readLeaderboard(storage), []);
});
