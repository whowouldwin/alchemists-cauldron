import assert from "node:assert/strict";
import test from "node:test";
import {
  addLaboratoryIngredient,
  clearLaboratoryMixture,
  createLaboratoryState,
  selectLaboratoryRecipe,
} from "../src/laboratory/laboratory-state.ts";
import {
  addLaboratoryReaction,
  removeLaboratoryReaction,
} from "../src/laboratory/laboratory-reactions.ts";
import { evaluateLaboratoryMixture } from "../src/laboratory/laboratory-result.ts";

test("keeps Easy reaction-free and rejects unavailable or duplicate Medium reactions", () => {
  const easy = createLaboratoryState();
  assert.equal(addLaboratoryReaction(easy, "solar-frost"), easy);

  const medium = selectLaboratoryRecipe(easy, "acid-spark");
  assert.equal(addLaboratoryReaction(medium, "unknown"), medium);
  assert.equal(addLaboratoryReaction(medium, "volatile-mix"), medium);

  const first = addLaboratoryReaction(medium, "bubbling");
  const second = addLaboratoryReaction(first, "solar-frost");
  assert.equal(addLaboratoryReaction(first, "bubbling"), first);
  assert.equal(addLaboratoryReaction(second, "deep-freeze"), second);
  assert.deepEqual(second.selectedReactionIds, ["bubbling", "solar-frost"]);
  assert.deepEqual(medium.selectedReactionIds, []);
});

test("allows three Hard reactions and preserves the chosen order when removing and adding", () => {
  let state = selectLaboratoryRecipe(createLaboratoryState(), "phoenix-pulse");
  for (const id of ["magma-flux", "pressure-spike", "volatile-mix"]) {
    state = addLaboratoryReaction(state, id);
  }

  assert.equal(addLaboratoryReaction(state, "bubbling"), state);
  assert.equal(removeLaboratoryReaction(state, "unknown"), state);
  const removed = removeLaboratoryReaction(state, "magma-flux");
  const reordered = addLaboratoryReaction(removed, "magma-flux");
  assert.deepEqual(removed.selectedReactionIds, [
    "pressure-spike",
    "volatile-mix",
  ]);
  assert.deepEqual(reordered.selectedReactionIds, [
    "pressure-spike",
    "volatile-mix",
    "magma-flux",
  ]);
  assert.deepEqual(state.selectedReactionIds, [
    "magma-flux",
    "pressure-spike",
    "volatile-mix",
  ]);
});

test("clearing keeps the experiment's reactions while a new recipe resets them", () => {
  const medium = selectLaboratoryRecipe(createLaboratoryState(), "acid-spark");
  const withReaction = addLaboratoryReaction(medium, "bubbling");
  const mixture = addLaboratoryIngredient(withReaction, "fairy-dust");
  const cleared = clearLaboratoryMixture(mixture);
  const easy = selectLaboratoryRecipe(mixture, "moon-mist");

  assert.deepEqual(cleared.selectedReactionIds, ["bubbling"]);
  assert.deepEqual(cleared.ingredients, []);
  assert.deepEqual(easy.selectedReactionIds, []);
  assert.deepEqual(easy.ingredients, []);
  assert.equal(selectLaboratoryRecipe(mixture, "acid-spark"), mixture);
});

test("re-evaluates an existing mixture when reactions are added or removed", () => {
  let mixture = selectLaboratoryRecipe(createLaboratoryState(), "acid-spark");
  mixture = addLaboratoryIngredient(mixture, "fairy-dust");
  mixture = addLaboratoryIngredient(mixture, "caustic-acid");
  const bubbling = addLaboratoryReaction(mixture, "bubbling");
  const result = evaluateLaboratoryMixture(bubbling);

  assert.equal(evaluateLaboratoryMixture(mixture).matchesRecipe, true);
  assert.equal(result.matchesRecipe, false);
  assert.deepEqual(result.trace.values, {
    temperature: 22,
    density: 23,
    magicPower: 51,
  });
  assert.equal(result.trace.steps[0]?.reaction.effects?.timePenaltySeconds, 10);
  assert.equal(bubbling.ingredients, mixture.ingredients);
  assert.equal(
    evaluateLaboratoryMixture(removeLaboratoryReaction(bubbling, "bubbling"))
      .matchesRecipe,
    true,
  );
});

test("retains an explosive mixture for inspection but never reports it as a successful brew", () => {
  let mixture = selectLaboratoryRecipe(createLaboratoryState(), "void-flame");
  for (const id of ["phoenix-feather", "essence-of-the-void", "toad-slime"]) {
    mixture = addLaboratoryIngredient(mixture, id);
  }
  assert.equal(evaluateLaboratoryMixture(mixture).matchesRecipe, true);

  const explosive = addLaboratoryReaction(mixture, "volatile-mix");
  const result = evaluateLaboratoryMixture(explosive);
  assert.equal(result.hasExplosion, true);
  assert.equal(result.matchesRecipe, false);
  assert.equal(explosive.ingredients, mixture.ingredients);
  assert.deepEqual(result.trace.values, {
    temperature: 35,
    density: 10,
    magicPower: 70,
  });
  assert.deepEqual(result.trace.steps[0]?.reaction.effects, {
    livesLost: 1,
    clearCauldron: true,
  });
  assert.equal(
    evaluateLaboratoryMixture(
      removeLaboratoryReaction(explosive, "volatile-mix"),
    ).matchesRecipe,
    true,
  );
});
