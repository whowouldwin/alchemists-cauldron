import assert from "node:assert/strict";
import test from "node:test";
import { ExperimentLibrary } from "../src/game-controller/experiment-library.ts";
import {
  addLaboratoryIngredient,
  createLaboratoryState,
} from "../src/laboratory/laboratory-state.ts";
import {
  captureExperiment,
  getExperimentKey,
} from "../src/laboratory/saved-experiment.ts";
import {
  loadExperiments,
  saveExperiments,
  type ExperimentsStorage,
} from "../src/storage/saved-experiments.ts";

const KEY = "alchemists-cauldron.experiments";
const firstMixture = addLaboratoryIngredient(
  createLaboratoryState(),
  "dragon-tears",
);
const secondMixture = addLaboratoryIngredient(firstMixture, "fairy-dust");

function createStorage() {
  const values = new Map<string, string>();
  let writable = true;
  let writes = 0;
  const storage: ExperimentsStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) {
      if (!writable) throw new Error("Storage quota exceeded");
      values.set(key, value);
      writes += 1;
    },
  };
  return {
    values,
    storage,
    setWritable(value: boolean) {
      writable = value;
    },
    get writes() {
      return writes;
    },
  };
}

test("saves a versioned snapshot and restores it without changing game progress", () => {
  const memory = createStorage();
  for (const key of [
    "alchemists-cauldron.save",
    "alchemists-cauldron.journal",
    "alchemists-cauldron.leaderboard.easy",
  ]) {
    memory.values.set(key, "existing progress");
  }
  const library = new ExperimentLibrary(memory.storage);
  assert.deepEqual(library.entries, []);
  assert.equal(library.save(firstMixture), "saved");
  const saved = memory.values.get(KEY);
  assert.ok(saved);
  assert.deepEqual(JSON.parse(saved), {
    version: 1,
    experiments: [
      {
        recipeId: "moon-mist",
        ingredientIds: ["dragon-tears"],
        selectedReactionIds: [],
      },
    ],
  });
  assert.equal(memory.values.size, 4);
  for (const [key, value] of memory.values) {
    if (key !== KEY) assert.equal(value, "existing progress");
  }
  const restoredLibrary = new ExperimentLibrary(memory.storage);
  const entry = restoredLibrary.entries[0];
  assert.ok(entry);
  assert.deepEqual(
    restoredLibrary.restore(getExperimentKey(entry)),
    firstMixture,
  );
});

test("does not write duplicates or invalid mixtures", () => {
  const memory = createStorage();
  const library = new ExperimentLibrary(memory.storage);
  assert.equal(library.save(createLaboratoryState()), "invalid");
  assert.equal(library.save(firstMixture), "saved");
  assert.equal(library.save(firstMixture), "already-saved");
  assert.equal(library.contains(firstMixture), true);
  assert.equal(library.contains(secondMixture), false);
  assert.equal(memory.writes, 1);
});

test("rejects malformed or unsupported data without overwriting it", () => {
  const malformed = [
    "broken JSON",
    "null",
    "[]",
    JSON.stringify({ version: 2, experiments: [] }),
    JSON.stringify({ version: 1, experiments: null }),
    JSON.stringify({
      version: 1,
      experiments: [
        { recipeId: "moon-mist", ingredientIds: [42], selectedReactionIds: [] },
      ],
    }),
    JSON.stringify({
      version: 1,
      experiments: [
        {
          recipeId: "unknown",
          ingredientIds: ["dragon-tears"],
          selectedReactionIds: [],
        },
      ],
    }),
  ];
  for (const raw of malformed) {
    const memory = createStorage();
    memory.values.set(KEY, raw);
    const library = new ExperimentLibrary(memory.storage);
    assert.equal(library.hasReadError, true);
    assert.equal(library.save(firstMixture), "storage-error");
    assert.equal(memory.values.get(KEY), raw);
    assert.equal(memory.writes, 0);
  }
});

test("loads duplicate entries once without rewriting the stored document", () => {
  const memory = createStorage();
  const experiment = captureExperiment(firstMixture);
  assert.ok(experiment);
  const raw = JSON.stringify({
    version: 1,
    experiments: [experiment, experiment],
  });
  memory.values.set(KEY, raw);
  assert.deepEqual(loadExperiments(memory.storage), [experiment]);
  assert.equal(memory.values.get(KEY), raw);
  assert.equal(memory.writes, 0);
});

test("reports storage exceptions without crashing", () => {
  const unavailable: ExperimentsStorage = {
    getItem() {
      throw new Error("Storage blocked");
    },
    setItem() {
      throw new Error("Storage blocked");
    },
  };
  assert.equal(loadExperiments(unavailable), null);
  assert.equal(saveExperiments([], unavailable), false);
  const library = new ExperimentLibrary(unavailable);
  assert.equal(library.save(firstMixture), "storage-error");
  assert.deepEqual(library.entries, []);
});

test("keeps the previous library after a failed write and allows retrying", () => {
  const memory = createStorage();
  const library = new ExperimentLibrary(memory.storage);
  assert.equal(library.save(firstMixture), "saved");
  const previousSave = memory.values.get(KEY);
  memory.setWritable(false);
  assert.equal(library.save(secondMixture), "storage-error");
  assert.equal(library.contains(secondMixture), false);
  assert.equal(memory.values.get(KEY), previousSave);

  memory.setWritable(true);
  assert.equal(library.save(secondMixture), "saved");
  assert.equal(library.entries.length, 2);
  assert.equal(library.contains(secondMixture), true);
});

test("reads the latest library before writing so another instance's entries survive", () => {
  const memory = createStorage();
  const first = new ExperimentLibrary(memory.storage);
  const second = new ExperimentLibrary(memory.storage);
  assert.equal(first.save(firstMixture), "saved");
  assert.equal(second.save(secondMixture), "saved");
  assert.equal(first.refresh(), true);
  assert.equal(first.contains(firstMixture), true);
  assert.equal(first.contains(secondMixture), true);
  assert.equal(first.entries.length, 2);
});

test("removes only the chosen experiment and preserves the library on a failed removal", () => {
  const memory = createStorage();
  const library = new ExperimentLibrary(memory.storage);
  library.save(firstMixture);
  library.save(secondMixture);
  const experiment = captureExperiment(firstMixture);
  assert.ok(experiment);
  const key = getExperimentKey(experiment);
  memory.setWritable(false);
  assert.equal(library.remove(key), false);
  assert.equal(library.contains(firstMixture), true);
  memory.setWritable(true);
  assert.equal(library.remove(key), true);
  assert.equal(library.contains(firstMixture), false);
  assert.equal(library.contains(secondMixture), true);
  assert.equal(library.restore(key), null);
  assert.deepEqual(
    new ExperimentLibrary(memory.storage).entries,
    library.entries,
  );
});

test("retains known entries on read failure and recovers after storage is repaired", () => {
  const memory = createStorage();
  const library = new ExperimentLibrary(memory.storage);
  library.save(firstMixture);
  const previousSave = memory.values.get(KEY);
  assert.ok(previousSave);
  memory.values.set(KEY, "broken");
  assert.equal(library.refresh(), false);
  assert.equal(library.contains(firstMixture), true);
  assert.equal(library.hasReadError, true);
  memory.values.set(KEY, previousSave);
  assert.equal(library.refresh(), true);
  assert.equal(library.hasReadError, false);
});
