import { DIFFICULTY_SETTINGS } from "./difficulty-settings.ts";
import type { Difficulty } from "./recipes.ts";

export interface Ingredient {
  readonly id: string;
  readonly name: string;
  readonly temperature: number;
  readonly density: number;
  readonly magicPower: number;
}

export const LEVEL_ONE_INGREDIENT_COUNT = 6;

export const INGREDIENTS: readonly Ingredient[] = [
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
];

export const LEVEL_ONE_INGREDIENTS = INGREDIENTS.slice(
  0,
  LEVEL_ONE_INGREDIENT_COUNT,
);

export function getIngredientsForDifficulty(
  difficulty: Difficulty,
): readonly Ingredient[] {
  return INGREDIENTS.slice(
    0,
    DIFFICULTY_SETTINGS[difficulty].shelfIngredientCount,
  );
}
