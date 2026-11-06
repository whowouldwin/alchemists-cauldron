import assert from "node:assert/strict";
import test from "node:test";
import { INGREDIENTS } from "../src/data/ingredients.ts";
import { DiscoveryJournalController } from "../src/game-controller/discovery-journal-controller.ts";
import { GameBrewingController } from "../src/game-controller/game-brewing-controller.ts";
import { createGameState } from "../src/state/create-game-state.ts";
import { finishGame, getGameOverReason } from "../src/state/game-status.ts";
import type { GameState } from "../src/state/game-state.ts";
import type { DiscoveryJournalStorage } from "../src/storage/discovery-journal.ts";

function createJournalStorage() {
  const values = new Map<string, string>();
  let writeCount = 0;
  let writesAllowed = true;
  const storage: DiscoveryJournalStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) {
      if (!writesAllowed) {
        throw new Error("Storage is unavailable");
      }

      values.set(key, value);
      writeCount += 1;
    },
  };

  return {
    storage,
    setWritesAllowed(allowed: boolean) {
      writesAllowed = allowed;
    },
    get writeCount() {
      return writeCount;
    },
  };
}

function createGameWithJournal(initialState: GameState | null) {
  let gameState = initialState;
  const memory = createJournalStorage();
  const journal = new DiscoveryJournalController(memory.storage);
  const game = new GameBrewingController({
    getGameState: () => gameState,
    setGameState: (nextState) => {
      gameState = nextState;
    },
    finishGameIfNeeded: () => {
      if (gameState === null || gameState.gameOverReason !== null) {
        return true;
      }

      const reason = getGameOverReason(gameState);

      if (reason === null) {
        return false;
      }

      gameState = finishGame(gameState, reason);
      return true;
    },
    saveCurrentGame: () => {},
    render: () => {},
    announcements: {
      region: {} as HTMLDivElement,
      ingredientAdded: () => {},
      brewResult: () => {},
      cauldronPouredOut: () => {},
      gameOver: () => {},
    },
    onSuccessfulBrew: journal.recordRecipe,
    onReactionsActivated: journal.recordReactions,
  });

  return {
    game,
    journal,
    memory,
    get state() {
      return gameState;
    },
  };
}

function getIngredient(id: string) {
  const ingredient = INGREDIENTS.find((item) => item.id === id);

  assert.ok(ingredient);

  return ingredient;
}

test("saves the brewed recipe, rather than the next randomly selected recipe", (context) => {
  context.mock.method(Date, "now", () => 1_000);
  context.mock.method(Math, "random", () => 0.999);
  const run = createGameWithJournal(
    createGameState(() => 0, Date.now(), "easy"),
  );

  run.game.addIngredient("dragon-tears");
  run.game.addIngredient("fairy-dust");
  run.game.brew();
  run.game.brew();

  assert.equal(run.state?.score, 100);
  assert.equal(run.state?.activeRecipe.id, "snow-dust");
  assert.deepEqual(run.journal.currentJournal, {
    recipeIds: ["moon-mist"],
    reactionIds: [],
  });
  assert.equal(run.memory.writeCount, 1);
  const restored = new DiscoveryJournalController(run.memory.storage);

  assert.deepEqual(restored.currentJournal, run.journal.currentJournal);
});

test("does not discover a recipe from failed, paused, empty or ended games", (context) => {
  context.mock.method(Date, "now", () => 1_000);
  const empty = createGameState(() => 0, Date.now(), "easy");
  const ready = {
    ...empty,
    cauldronIngredients: [
      getIngredient("dragon-tears"),
      getIngredient("fairy-dust"),
    ],
  };
  const paused = { ...ready, remainingTimeAtPauseMs: 60_000 };
  const expired = { ...ready, endTime: Date.now() };
  const failed = {
    ...empty,
    cauldronIngredients: [getIngredient("mandrake-root")],
  };
  const finished = finishGame(ready, "time");

  for (const state of [null, empty, paused, expired, failed, finished]) {
    const run = createGameWithJournal(state);

    run.game.brew();

    assert.deepEqual(run.journal.currentJournal, {
      recipeIds: [],
      reactionIds: [],
    });
    assert.equal(run.memory.writeCount, 0);
  }
});

test("keeps the last successful discovery when brewing exhausts the shelf", (context) => {
  context.mock.method(Date, "now", () => 1_000);
  const initial = createGameState(() => 0, Date.now(), "easy");
  const run = createGameWithJournal({
    ...initial,
    shelfStock: Object.fromEntries(
      Object.keys(initial.shelfStock).map((id) => [id, 0]),
    ),
    cauldronIngredients: [
      getIngredient("dragon-tears"),
      getIngredient("fairy-dust"),
    ],
  });

  run.game.brew();

  assert.equal(run.state?.gameOverReason, "out-of-ingredients");
  assert.deepEqual(run.journal.currentJournal.recipeIds, ["moon-mist"]);
  assert.equal(run.memory.writeCount, 1);
});

test("records a reaction even when its explosion takes the last life", (context) => {
  context.mock.method(Date, "now", () => 1_000);
  const run = createGameWithJournal({
    ...createGameState(() => 0, Date.now(), "hard"),
    activeReactionIds: ["volatile-mix", "bubbling", "solar-frost"],
    lives: 1,
  });

  run.game.addIngredient("phoenix-feather");
  run.game.addIngredient("essence-of-the-void");
  run.game.addIngredient("essence-of-the-void");

  assert.equal(run.state?.gameOverReason, "lives");
  assert.deepEqual(run.state?.cauldronIngredients, []);
  assert.deepEqual(run.journal.currentJournal.reactionIds, ["volatile-mix"]);
  assert.equal(run.memory.writeCount, 1);
});

test("does not save an already discovered reaction again", (context) => {
  context.mock.method(Date, "now", () => 1_000);
  const run = createGameWithJournal({
    ...createGameState(() => 0, Date.now(), "medium"),
    activeReactionIds: ["bubbling", "solar-frost"],
  });

  run.game.addIngredient("fairy-dust");
  run.game.addIngredient("caustic-acid");
  run.game.addIngredient("mandrake-root");
  run.game.pourOut();
  run.game.addIngredient("fairy-dust");
  run.game.addIngredient("caustic-acid");

  assert.deepEqual(run.journal.currentJournal.reactionIds, ["bubbling"]);
  assert.equal(run.memory.writeCount, 1);
});

test("keeps unsaved discoveries in memory and retries saving a repeat discovery", (context) => {
  context.mock.method(Date, "now", () => 1_000);
  const run = createGameWithJournal(
    createGameState(() => 0, Date.now(), "easy"),
  );
  run.memory.setWritesAllowed(false);

  run.game.addIngredient("dragon-tears");
  run.game.addIngredient("fairy-dust");
  run.game.brew();

  assert.equal(run.state?.score, 100);
  assert.deepEqual(run.journal.currentJournal.recipeIds, ["moon-mist"]);
  assert.equal(run.journal.hasUnsavedDiscoveries, true);
  assert.equal(run.memory.writeCount, 0);

  run.memory.setWritesAllowed(true);
  run.journal.recordRecipe("moon-mist");

  assert.equal(run.journal.hasUnsavedDiscoveries, false);
  assert.equal(run.memory.writeCount, 1);
  const restored = new DiscoveryJournalController(run.memory.storage);

  assert.deepEqual(restored.currentJournal.recipeIds, ["moon-mist"]);
});
