import assert from "node:assert/strict";
import test from "node:test";
import {
  INGREDIENTS,
  LEVEL_ONE_INGREDIENTS,
  LEVEL_ONE_INGREDIENT_COUNT,
} from "../src/data/ingredients.ts";
import { createShelfStock } from "../src/logic/create-shelf-stock.ts";

test("matches the required eight-ingredient catalogue", () => {
  assert.deepEqual(INGREDIENTS, [
    {
      id: "dragon-tears",
      name: "Dragon Tears",
      temperature: 25,
      density: 8,
      magicPower: 10,
    },
    {
      id: "fairy-dust",
      name: "Fairy Dust",
      temperature: 12,
      density: 9,
      magicPower: 12,
    },
    {
      id: "frost-lotus",
      name: "Frost Lotus",
      temperature: -18,
      density: 4,
      magicPower: 14,
    },
    {
      id: "mandrake-root",
      name: "Mandrake Root",
      temperature: -5,
      density: 20,
      magicPower: 8,
    },
    {
      id: "caustic-acid",
      name: "Caustic Acid",
      temperature: 10,
      density: 14,
      magicPower: 22,
    },
    {
      id: "essence-of-the-void",
      name: "Essence of the Void",
      temperature: -20,
      density: -10,
      magicPower: 40,
    },
    {
      id: "phoenix-feather",
      name: "Phoenix Feather",
      temperature: 50,
      density: -10,
      magicPower: 30,
    },
    {
      id: "toad-slime",
      name: "Toad Slime",
      temperature: 5,
      density: 30,
      magicPower: 0,
    },
  ]);
  assert.equal(LEVEL_ONE_INGREDIENT_COUNT, 6);
  assert.deepEqual(LEVEL_ONE_INGREDIENTS, INGREDIENTS.slice(0, 6));
});

test("generates stock for each ingredient using values from 2 to 15", () => {
  const values = [0, 0.1, 0.25, 0.5, 0.75, 0.999];
  let nextValue = 0;

  const random = (): number => {
    const value = values[nextValue];

    assert.ok(value !== undefined);
    nextValue += 1;

    return value;
  };
  const stock = createShelfStock(LEVEL_ONE_INGREDIENTS, random);

  assert.equal(nextValue, values.length);
  assert.deepEqual(stock, {
    "dragon-tears": 2,
    "fairy-dust": 3,
    "frost-lotus": 5,
    "mandrake-root": 9,
    "caustic-acid": 12,
    "essence-of-the-void": 15,
  });
});

test("returns an empty stock for an empty shelf", () => {
  assert.deepEqual(createShelfStock([]), {});
});
