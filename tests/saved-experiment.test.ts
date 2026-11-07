import assert from "node:assert/strict";
import test from "node:test";
import {
  addLaboratoryIngredient,
  createLaboratoryState,
  selectLaboratoryRecipe,
} from "../src/laboratory/laboratory-state.ts";
import { addLaboratoryReaction } from "../src/laboratory/laboratory-reactions.ts";
import { evaluateLaboratoryMixture } from "../src/laboratory/laboratory-result.ts";
import {
  captureExperiment,
  getExperimentKey,
  restoreExperiment,
} from "../src/laboratory/saved-experiment.ts";

test("captures IDs and restores the ingredient and reaction order with fresh calculations", () => {
  let state = selectLaboratoryRecipe(createLaboratoryState(), "ember-soup");
  state = addLaboratoryIngredient(state, "phoenix-feather");
  state = addLaboratoryIngredient(state, "fairy-dust");
  state = addLaboratoryIngredient(state, "toad-slime");
  state = addLaboratoryReaction(state, "magma-flux");
  state = addLaboratoryReaction(state, "pressure-spike");
  const saved = captureExperiment(state);
  assert.ok(saved);
  assert.deepEqual(saved, {
    recipeId: "ember-soup",
    ingredientIds: ["phoenix-feather", "fairy-dust", "toad-slime"],
    selectedReactionIds: ["magma-flux", "pressure-spike"],
  });

  const restored = restoreExperiment(saved);
  assert.ok(restored);
  assert.deepEqual(restored, state);
  assert.notEqual(restored.ingredients, state.ingredients);
  assert.notEqual(restored.selectedReactionIds, saved.selectedReactionIds);
  assert.deepEqual(evaluateLaboratoryMixture(restored).trace.values, {
    temperature: 67,
    density: 26.1,
    magicPower: 50.4,
  });
  assert.notEqual(
    getExperimentKey(saved),
    getExperimentKey({
      ...saved,
      selectedReactionIds: [...saved.selectedReactionIds].reverse(),
    }),
  );
});

test("preserves repeated portions instead of deduplicating the ingredients", () => {
  let state = createLaboratoryState();
  state = addLaboratoryIngredient(state, "fairy-dust");
  state = addLaboratoryIngredient(state, "fairy-dust");
  const saved = captureExperiment(state);
  assert.ok(saved);
  assert.deepEqual(saved.ingredientIds, ["fairy-dust", "fairy-dust"]);
  assert.equal(restoreExperiment(saved)?.ingredients.length, 2);
});

test("does not capture empty, unsuccessful or explosive mixtures", () => {
  const empty = createLaboratoryState();
  assert.equal(captureExperiment(empty), null);
  assert.equal(
    captureExperiment(addLaboratoryIngredient(empty, "frost-lotus")),
    null,
  );

  let explosive = selectLaboratoryRecipe(empty, "void-flame");
  for (const id of ["phoenix-feather", "essence-of-the-void", "toad-slime"]) {
    explosive = addLaboratoryIngredient(explosive, id);
  }
  explosive = addLaboratoryReaction(explosive, "volatile-mix");
  assert.equal(captureExperiment(explosive), null);
});

test("rejects snapshots that cannot be reconstructed under the laboratory rules", () => {
  const valid = {
    recipeId: "moon-mist",
    ingredientIds: ["dragon-tears"],
    selectedReactionIds: [],
  };
  const invalid = [
    { ...valid, recipeId: "unknown" },
    { ...valid, ingredientIds: ["unknown"] },
    { ...valid, ingredientIds: ["phoenix-feather"] },
    { ...valid, ingredientIds: Array(5).fill("dragon-tears") },
    { ...valid, ingredientIds: [] },
    { ...valid, ingredientIds: ["frost-lotus"] },
    { ...valid, selectedReactionIds: ["solar-frost"] },
    {
      ...valid,
      recipeId: "acid-spark",
      selectedReactionIds: ["bubbling", "bubbling"],
    },
  ];
  for (const experiment of invalid) {
    assert.equal(restoreExperiment(experiment), null);
  }
});
