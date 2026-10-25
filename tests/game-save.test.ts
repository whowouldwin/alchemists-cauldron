import assert from "node:assert/strict";
import test from "node:test";
import { createGameState } from "../src/state/create-game-state.ts";
import { finishGame } from "../src/state/game-status.ts";
import {
  clearSave,
  loadGame,
  restoreGameState,
  saveGame,
  type GameSaveStorage,
} from "../src/storage/game-save.ts";

function createMemoryStorage(initialValue: string | null = null) {
  let value = initialValue;
  const storage: GameSaveStorage = {
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

test("saves and loads a valid game snapshot", () => {
  const { storage, getValue } = createMemoryStorage();
  const state = createGameState(() => 0, 10_000, "hard");

  assert.equal(saveGame(state, storage, 10_000), true);
  assert.notEqual(getValue(), null);
  assert.deepEqual(loadGame(storage), {
    version: 1,
    difficulty: "hard",
    score: 0,
    timeLeft: 150,
    lives: 3,
    activeRecipe: state.activeRecipe,
    cauldronIngredients: [],
    shelfStock: state.shelfStock,
    status: "playing",
  });
});

test("restores a saved game paused with the same shelf stock", () => {
  const { storage } = createMemoryStorage();
  const state = createGameState(() => 0.5, 0, "easy");

  assert.equal(saveGame(state, storage, 30_000), true);

  const savedGame = loadGame(storage);

  assert.ok(savedGame);

  const restoredState = restoreGameState(savedGame, 50_000);

  assert.equal(restoredState.difficulty, state.difficulty);
  assert.equal(restoredState.remainingTimeAtPauseMs, 150_000);
  assert.deepEqual(restoredState.shelfStock, state.shelfStock);
  assert.equal(restoredState.activeRecipe.id, state.activeRecipe.id);
});

test("clears a finished game instead of saving it", () => {
  const { storage, getValue } = createMemoryStorage();
  const state = createGameState(() => 0, 0);

  assert.equal(saveGame(state, storage, 0), true);
  assert.equal(saveGame(finishGame(state, "lives"), storage, 0), false);
  assert.equal(getValue(), null);
  assert.equal(loadGame(storage), null);
});

test("removes malformed saved data without throwing", () => {
  const { storage, getValue } = createMemoryStorage("not-json");

  assert.equal(loadGame(storage), null);
  assert.equal(getValue(), null);
});

test("removes structurally invalid saved data without throwing", () => {
  const { storage, getValue } = createMemoryStorage(
    JSON.stringify({ version: 1, difficulty: "unknown" }),
  );

  assert.equal(loadGame(storage), null);
  assert.equal(getValue(), null);
});

test("clears a saved game explicitly", () => {
  const { storage, getValue } = createMemoryStorage("saved-game");

  assert.equal(clearSave(storage), true);
  assert.equal(getValue(), null);
});
