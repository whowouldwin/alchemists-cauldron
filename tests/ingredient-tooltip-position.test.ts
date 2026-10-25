import assert from "node:assert/strict";
import test from "node:test";
import { getIngredientTooltipPosition } from "../src/ui/ingredient-shelf/ingredient-tooltip-position.ts";

const tooltip = { width: 190, height: 110 };
const desktop = { width: 800, height: 600 };

test("places the tooltip to the right when there is room", () => {
  const card = { left: 100, right: 240, top: 100, bottom: 240 };

  assert.deepEqual(getIngredientTooltipPosition(card, tooltip, desktop), {
    left: 248,
    top: 100,
  });
});

test("opens to the left near the right edge", () => {
  const card = { left: 610, right: 750, top: 100, bottom: 240 };

  assert.deepEqual(getIngredientTooltipPosition(card, tooltip, desktop), {
    left: 412,
    top: 100,
  });
});

test("moves the tooltip up near the bottom edge", () => {
  const card = { left: 100, right: 240, top: 520, bottom: 580 };

  assert.deepEqual(getIngredientTooltipPosition(card, tooltip, desktop), {
    left: 248,
    top: 470,
  });
});

test("handles the right and bottom edges together", () => {
  const card = { left: 610, right: 750, top: 520, bottom: 580 };

  assert.deepEqual(getIngredientTooltipPosition(card, tooltip, desktop), {
    left: 412,
    top: 470,
  });
});

test("uses the space above on a narrow screen when neither side fits", () => {
  const card = { left: 190, right: 350, top: 300, bottom: 440 };

  assert.deepEqual(
    getIngredientTooltipPosition(card, tooltip, { width: 375, height: 600 }),
    { left: 173, top: 182 },
  );
});

test("uses the space below when there is no room above or beside the card", () => {
  const card = { left: 190, right: 350, top: 20, bottom: 160 };

  assert.deepEqual(
    getIngredientTooltipPosition(card, tooltip, { width: 375, height: 600 }),
    { left: 173, top: 168 },
  );
});

test("keeps the tooltip inside a short viewport when no placement fits", () => {
  const card = { left: 190, right: 350, top: 20, bottom: 160 };

  assert.deepEqual(
    getIngredientTooltipPosition(card, tooltip, { width: 375, height: 200 }),
    { left: 173, top: 78 },
  );
});
