import assert from "node:assert/strict";
import test from "node:test";
import { INGREDIENTS } from "../src/data/ingredients.ts";
import { traceCauldronReactions } from "../src/logic/reactions/reaction-trace.ts";

function ingredients(...ids: string[]) {
  return ids.map((id) => {
    const ingredient = INGREDIENTS.find((item) => item.id === id);
    assert.ok(ingredient);
    return ingredient;
  });
}

test("keeps base values when selected reactions do not activate", () => {
  assert.deepEqual(
    traceCauldronReactions(ingredients("dragon-tears"), ["bubbling"]),
    {
      baseValues: { temperature: 25, density: 8, magicPower: 10 },
      values: { temperature: 25, density: 8, magicPower: 10 },
      steps: [],
    },
  );
});

test("records each step in selection order and checks conditions against the base mixture", () => {
  const mixture = ingredients(
    "dragon-tears",
    "dragon-tears",
    "toad-slime",
    "toad-slime",
  );
  const trace = traceCauldronReactions(mixture, [
    "magma-flux",
    "pressure-spike",
  ]);

  assert.deepEqual(trace.baseValues, {
    temperature: 60,
    density: 76,
    magicPower: 20,
  });
  assert.deepEqual(
    trace.steps.map(({ reaction, before, after }) => ({
      id: reaction.id,
      before,
      after,
    })),
    [
      {
        id: "magma-flux",
        before: { temperature: 60, density: 76, magicPower: 20 },
        after: { temperature: 60, density: 68.4, magicPower: 24 },
      },
      {
        id: "pressure-spike",
        before: { temperature: 60, density: 68.4, magicPower: 24 },
        after: { temperature: 60, density: 70, magicPower: 26.4 },
      },
    ],
  );
  assert.deepEqual(trace.values, {
    temperature: 60,
    density: 70,
    magicPower: 26.4,
  });

  const reversed = traceCauldronReactions(mixture, [
    "pressure-spike",
    "magma-flux",
  ]);
  assert.deepEqual(reversed.values, {
    temperature: 60,
    density: 63,
    magicPower: 26.4,
  });
  assert.deepEqual(
    traceCauldronReactions(mixture, ["magma-flux", "pressure-spike"]),
    trace,
  );
});

test("does not activate a threshold reaction solely because an earlier effect crossed it", () => {
  const trace = traceCauldronReactions(
    ingredients("fairy-dust", "caustic-acid", "essence-of-the-void"),
    ["bubbling", "arcane-saturation"],
  );

  assert.deepEqual(trace.baseValues, {
    temperature: 2,
    density: 13,
    magicPower: 74,
  });
  assert.deepEqual(
    trace.steps.map(({ reaction }) => reaction.id),
    ["bubbling"],
  );
  assert.deepEqual(trace.values, {
    temperature: 2,
    density: 13,
    magicPower: 111,
  });
});
