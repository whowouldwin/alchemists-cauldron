import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import type { Ingredient } from "../../data/ingredients.ts";
import type { Difficulty } from "../../data/recipes.ts";
import type { IReaction } from "./reaction-types.ts";

const INGREDIENT_IDS = {
  dragonTears: "dragon-tears",
  fairyDust: "fairy-dust",
  frostLotus: "frost-lotus",
  mandrakeRoot: "mandrake-root",
  causticAcid: "caustic-acid",
  essenceOfTheVoid: "essence-of-the-void",
  phoenixFeather: "phoenix-feather",
  toadSlime: "toad-slime",
} as const;

export const REACTIONS: readonly IReaction[] = [
  {
    id: "bubbling",
    name: "Bubbling",
    isActive: (ingredients) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.fairyDust,
        INGREDIENT_IDS.causticAcid,
      ),
    apply: (values) => ({
      ...values,
      magicPower: scaleByPercentage(values.magicPower, 1.5),
    }),
    effects: { timePenaltySeconds: 10 },
  },
  {
    id: "solar-frost",
    name: "Solar Frost",
    isActive: (ingredients) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.dragonTears,
        INGREDIENT_IDS.frostLotus,
      ),
    apply: (values) => ({
      ...values,
      temperature: 0,
      density: scaleByPercentage(values.density, 1.2),
    }),
  },
  {
    id: "volatile-mix",
    name: "Volatile Mix",
    isActive: (ingredients) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.phoenixFeather,
        INGREDIENT_IDS.essenceOfTheVoid,
      ),
    apply: (values) => values,
    effects: { livesLost: 1, clearCauldron: true },
  },
  {
    id: "rooted-steam",
    name: "Rooted Steam",
    isActive: (ingredients) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.mandrakeRoot,
        INGREDIENT_IDS.toadSlime,
      ),
    apply: (values) => ({
      ...values,
      density: scaleByPercentage(values.density, 1.25),
      magicPower: scaleByPercentage(values.magicPower, 0.9),
    }),
  },
  {
    id: "ashen-bloom",
    name: "Ashen Bloom",
    isActive: (ingredients) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.phoenixFeather,
        INGREDIENT_IDS.fairyDust,
      ),
    apply: (values) => ({
      ...values,
      temperature: values.temperature + 10,
      magicPower: scaleByPercentage(values.magicPower, 1.25),
    }),
  },
  {
    id: "annihilation",
    name: "Annihilation",
    isActive: (ingredients) =>
      ingredients.some(({ temperature }) => temperature > 15) &&
      ingredients.some(({ temperature }) => temperature < -15),
    apply: (values) => ({
      ...values,
      temperature: 0,
      density: scaleByPercentage(values.density, 2),
    }),
  },
  {
    id: "pressure-spike",
    name: "Pressure Spike",
    isActive: (_ingredients, values) => values.density >= 70,
    apply: (values) => ({
      ...values,
      density: 70,
      magicPower: scaleByPercentage(values.magicPower, 1.1),
    }),
  },
  {
    id: "magma-flux",
    name: "Magma Flux",
    isActive: (_ingredients, values) => values.temperature >= 60,
    apply: (values) => ({
      ...values,
      density: scaleByPercentage(values.density, 0.9),
      magicPower: scaleByPercentage(values.magicPower, 1.2),
    }),
  },
  {
    id: "deep-freeze",
    name: "Deep Freeze",
    isActive: (_ingredients, values) => values.temperature <= -20,
    apply: (values) => ({
      ...values,
      density: scaleByPercentage(values.density, 1.15),
      magicPower: scaleByPercentage(values.magicPower, 0.85),
    }),
  },
  {
    id: "arcane-saturation",
    name: "Arcane Saturation",
    isActive: (_ingredients, values) => values.magicPower >= 80,
    apply: (values) => ({
      ...values,
      temperature: values.temperature + 5,
      magicPower: 80,
    }),
  },
  {
    id: "steam-burst",
    name: "Steam Burst",
    isActive: (ingredients, values) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.dragonTears,
        INGREDIENT_IDS.causticAcid,
      ) && values.temperature >= 35,
    apply: (values) => ({ ...values, temperature: values.temperature + 10 }),
    effects: { timePenaltySeconds: 5 },
  },
  {
    id: "black-ice",
    name: "Black Ice",
    isActive: (ingredients, values) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.frostLotus,
        INGREDIENT_IDS.essenceOfTheVoid,
      ) && values.density <= 0,
    apply: (values) => ({
      ...values,
      temperature: values.temperature - 10,
      magicPower: scaleByPercentage(values.magicPower, 1.2),
    }),
  },
  {
    id: "heavy-spark",
    name: "Heavy Spark",
    isActive: (ingredients, values) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.fairyDust,
        INGREDIENT_IDS.toadSlime,
      ) && values.density >= 40,
    apply: (values) => ({
      ...values,
      density: scaleByPercentage(values.density, 1.2),
      magicPower: scaleByPercentage(values.magicPower, 1.1),
    }),
  },
  {
    id: "burning-root",
    name: "Burning Root",
    isActive: (ingredients, values) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.mandrakeRoot,
        INGREDIENT_IDS.phoenixFeather,
      ) && values.temperature >= 40,
    apply: (values) => ({
      ...values,
      temperature: values.temperature + 15,
      density: scaleByPercentage(values.density, 0.9),
    }),
  },
  {
    id: "void-resonance",
    name: "Void Resonance",
    isActive: (ingredients, values) =>
      hasIngredients(
        ingredients,
        INGREDIENT_IDS.essenceOfTheVoid,
        INGREDIENT_IDS.dragonTears,
      ) && values.magicPower >= 50,
    apply: (values) => ({
      ...values,
      temperature: values.temperature - 5,
      magicPower: scaleByPercentage(values.magicPower, 1.3),
    }),
  },
];

export function getReactionsForDifficulty(
  difficulty: Difficulty,
): readonly IReaction[] {
  return REACTIONS.slice(0, DIFFICULTY_SETTINGS[difficulty].reactionCount);
}

function hasIngredients(
  ingredients: readonly Ingredient[],
  firstId: string,
  secondId: string,
): boolean {
  return (
    ingredients.some(({ id }) => id === firstId) &&
    ingredients.some(({ id }) => id === secondId)
  );
}

function scaleByPercentage(value: number, multiplier: number): number {
  return Number((value * multiplier).toFixed(2));
}
