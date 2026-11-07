import assert from "node:assert/strict";
import test from "node:test";
import {
  addLaboratoryIngredient,
  clearLaboratoryMixture,
  createLaboratoryState,
  selectLaboratoryRecipe,
} from "../src/laboratory/laboratory-state.ts";
import { evaluateLaboratoryMixture } from "../src/laboratory/laboratory-result.ts";

test("starts with an empty mixture and independent practice state", () => {
  const first = createLaboratoryState();
  const second = createLaboratoryState();

  assert.equal(first.recipe.id, "moon-mist");
  assert.deepEqual(first.ingredients, []);
  assert.notEqual(first.ingredients, second.ingredients);
  assert.equal(evaluateLaboratoryMixture(first).matchesRecipe, false);
});

test("allows repeated portions up to the recipe difficulty's capacity", () => {
  const empty = createLaboratoryState();
  let mixture = empty;

  for (let portion = 0; portion < 4; portion += 1) {
    mixture = addLaboratoryIngredient(mixture, "dragon-tears");
  }

  assert.deepEqual(
    mixture.ingredients.map(({ id }) => id),
    ["dragon-tears", "dragon-tears", "dragon-tears", "dragon-tears"],
  );
  assert.equal(addLaboratoryIngredient(mixture, "fairy-dust"), mixture);
  assert.deepEqual(empty.ingredients, []);

  const cleared = clearLaboratoryMixture(mixture);
  const nextAttempt = addLaboratoryIngredient(cleared, "dragon-tears");

  assert.equal(nextAttempt.ingredients.length, 1);
  assert.equal(mixture.ingredients.length, 4);
});

test("rejects unknown ingredients and ingredients outside the recipe difficulty", () => {
  const state = createLaboratoryState();

  assert.equal(addLaboratoryIngredient(state, "unknown"), state);
  assert.equal(addLaboratoryIngredient(state, "phoenix-feather"), state);
  assert.equal(selectLaboratoryRecipe(state, "unknown"), state);
});

test("changing the recipe clears the mixture and applies the new difficulty", () => {
  const initial = addLaboratoryIngredient(
    createLaboratoryState(),
    "dragon-tears",
  );
  assert.equal(selectLaboratoryRecipe(initial, "moon-mist"), initial);

  let hard = selectLaboratoryRecipe(initial, "phoenix-pulse");
  assert.deepEqual(hard.ingredients, []);
  assert.equal(hard.recipe.difficulty, "hard");

  for (let portion = 0; portion < 5; portion += 1) {
    hard = addLaboratoryIngredient(hard, "phoenix-feather");
  }

  assert.equal(hard.ingredients.length, 5);
  assert.equal(addLaboratoryIngredient(hard, "fairy-dust"), hard);
  assert.equal(initial.ingredients.length, 1);
  assert.equal(initial.recipe.id, "moon-mist");
});

test("clearing preserves the selected recipe and leaves the previous mixture intact", () => {
  const initial = selectLaboratoryRecipe(createLaboratoryState(), "acid-spark");
  const mixture = addLaboratoryIngredient(initial, "caustic-acid");
  const cleared = clearLaboratoryMixture(mixture);

  assert.equal(cleared.recipe, mixture.recipe);
  assert.deepEqual(cleared.ingredients, []);
  assert.equal(mixture.ingredients.length, 1);
  assert.equal(clearLaboratoryMixture(cleared), cleared);
});

test("uses the game calculation and displays targets including Easy tolerance", () => {
  const mixture = addLaboratoryIngredient(
    createLaboratoryState(),
    "dragon-tears",
  );

  assert.deepEqual(evaluateLaboratoryMixture(mixture), {
    trace: {
      baseValues: { temperature: 25, density: 8, magicPower: 10 },
      values: { temperature: 25, density: 8, magicPower: 10 },
      steps: [],
    },
    hasExplosion: false,
    targetRanges: {
      temperature: { minimum: 20, maximum: 54 },
      density: { minimum: 0, maximum: 34 },
      magicPower: { minimum: 5, maximum: 39 },
    },
    matchesRecipe: true,
  });
});

test("recalculates the match using Hard tolerance after every addition", () => {
  const empty = selectLaboratoryRecipe(
    createLaboratoryState(),
    "phoenix-pulse",
  );
  const phoenix = addLaboratoryIngredient(empty, "phoenix-feather");
  const mixture = addLaboratoryIngredient(phoenix, "fairy-dust");

  assert.equal(evaluateLaboratoryMixture(phoenix).matchesRecipe, false);
  assert.deepEqual(evaluateLaboratoryMixture(mixture), {
    trace: {
      baseValues: { temperature: 62, density: -1, magicPower: 42 },
      values: { temperature: 62, density: -1, magicPower: 42 },
      steps: [],
    },
    hasExplosion: false,
    targetRanges: {
      temperature: { minimum: 52, maximum: 72 },
      density: { minimum: -5, maximum: 15 },
      magicPower: { minimum: 32, maximum: 52 },
    },
    matchesRecipe: true,
  });
});
