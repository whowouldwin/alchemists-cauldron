import assert from "node:assert/strict";
import test from "node:test";
import {
  createDiscoveryJournal,
  recordRecipeDiscovery,
  recordReactionDiscoveries,
} from "../src/progress/discovery-journal.ts";

test("records a recipe once and preserves reaction discoveries", () => {
  const journal = {
    recipeIds: ["acid-spark"],
    reactionIds: ["bubbling"],
  };
  const updated = recordRecipeDiscovery(journal, "moon-mist");

  assert.deepEqual(updated, {
    recipeIds: ["acid-spark", "moon-mist"],
    reactionIds: ["bubbling"],
  });
  assert.equal(recordRecipeDiscovery(updated, "moon-mist"), updated);
});

test("records unique reactions in discovery order and preserves recipes", () => {
  const journal = {
    recipeIds: ["moon-mist"],
    reactionIds: ["bubbling"],
  };
  const updated = recordReactionDiscoveries(journal, [
    "solar-frost",
    "bubbling",
    "solar-frost",
    "black-ice",
  ]);

  assert.deepEqual(updated, {
    recipeIds: ["moon-mist"],
    reactionIds: ["bubbling", "solar-frost", "black-ice"],
  });
  assert.equal(recordReactionDiscoveries(updated, ["black-ice"]), updated);
});

test("ignores unknown ids and empty reaction lists", () => {
  const journal = createDiscoveryJournal();

  assert.equal(recordRecipeDiscovery(journal, "unknown-recipe"), journal);
  assert.equal(
    recordReactionDiscoveries(journal, ["unknown-reaction"]),
    journal,
  );
  assert.equal(recordReactionDiscoveries(journal, []), journal);
  assert.deepEqual(
    recordReactionDiscoveries(journal, ["unknown-reaction", "bubbling"]),
    { recipeIds: [], reactionIds: ["bubbling"] },
  );
});

test("leaves the previous journal intact when adding discoveries", () => {
  const journal = Object.freeze({
    recipeIds: Object.freeze(["acid-spark"]),
    reactionIds: Object.freeze(["bubbling"]),
  });

  recordRecipeDiscovery(journal, "moon-mist");
  recordReactionDiscoveries(journal, ["solar-frost"]);

  assert.deepEqual(journal, {
    recipeIds: ["acid-spark"],
    reactionIds: ["bubbling"],
  });
  assert.deepEqual(createDiscoveryJournal(), {
    recipeIds: [],
    reactionIds: [],
  });
});
