import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import {
  getIngredientsForDifficulty,
  type Ingredient,
} from "../../data/ingredients.ts";
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
    requiredIngredientIds: [
      INGREDIENT_IDS.fairyDust,
      INGREDIENT_IDS.causticAcid,
    ],
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
    requiredIngredientIds: [
      INGREDIENT_IDS.dragonTears,
      INGREDIENT_IDS.frostLotus,
    ],
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
    requiredIngredientIds: [
      INGREDIENT_IDS.phoenixFeather,
      INGREDIENT_IDS.essenceOfTheVoid,
    ],
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
    requiredIngredientIds: [
      INGREDIENT_IDS.mandrakeRoot,
      INGREDIENT_IDS.toadSlime,
    ],
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
    requiredIngredientIds: [
      INGREDIENT_IDS.phoenixFeather,
      INGREDIENT_IDS.fairyDust,
    ],
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
    requiredIngredientIds: [
      INGREDIENT_IDS.dragonTears,
      INGREDIENT_IDS.causticAcid,
    ],
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
    requiredIngredientIds: [
      INGREDIENT_IDS.frostLotus,
      INGREDIENT_IDS.essenceOfTheVoid,
    ],
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
    requiredIngredientIds: [INGREDIENT_IDS.fairyDust, INGREDIENT_IDS.toadSlime],
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
    requiredIngredientIds: [
      INGREDIENT_IDS.mandrakeRoot,
      INGREDIENT_IDS.phoenixFeather,
    ],
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
    requiredIngredientIds: [
      INGREDIENT_IDS.essenceOfTheVoid,
      INGREDIENT_IDS.dragonTears,
    ],
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

export function getAvailableReactionsForDifficulty(
  difficulty: Difficulty,
): readonly IReaction[] {
  const availableIngredientIds = new Set(
    getIngredientsForDifficulty(difficulty).map(({ id }) => id),
  );

  return REACTIONS.filter(
    (reaction) =>
      reaction.requiredIngredientIds?.every((id) =>
        availableIngredientIds.has(id),
      ) ?? true,
  );
}

export function selectReactionIdsForDifficulty(
  difficulty: Difficulty,
  random: () => number = Math.random,
): readonly string[] {
  const candidates = [...getAvailableReactionsForDifficulty(difficulty)];
  const reactionCount = DIFFICULTY_SETTINGS[difficulty].reactionCount;

  if (candidates.length < reactionCount) {
    throw new RangeError(
      `Difficulty "${difficulty}" requires ${reactionCount} reactions, but only ${candidates.length} are available.`,
    );
  }

  for (let index = 0; index < reactionCount; index += 1) {
    const remainingCount = candidates.length - index;
    const selectedIndex = Math.floor(random() * remainingCount);

    if (selectedIndex < 0 || selectedIndex >= remainingCount) {
      throw new RangeError(
        "The random generator must return a value in [0, 1).",
      );
    }

    const swapIndex = index + selectedIndex;
    const currentReaction = candidates[index];
    const selectedReaction = candidates[swapIndex];

    if (currentReaction === undefined || selectedReaction === undefined) {
      throw new RangeError("The selected reaction is unavailable.");
    }

    [candidates[index], candidates[swapIndex]] = [
      selectedReaction,
      currentReaction,
    ];
  }

  return candidates.slice(0, reactionCount).map(({ id }) => id);
}

export function getReactionsByIds(
  reactionIds: readonly string[],
): readonly IReaction[] {
  return reactionIds.flatMap((id) => {
    const reaction = REACTIONS.find((candidate) => candidate.id === id);

    return reaction === undefined ? [] : [reaction];
  });
}

export function isValidReactionSelection(
  value: unknown,
  difficulty: Difficulty,
): value is readonly string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  const reactionIds: string[] = [];

  for (const reactionId of value) {
    if (typeof reactionId !== "string") {
      return false;
    }

    reactionIds.push(reactionId);
  }

  const availableReactionIds = new Set(
    getAvailableReactionsForDifficulty(difficulty).map(({ id }) => id),
  );

  return (
    reactionIds.length === DIFFICULTY_SETTINGS[difficulty].reactionCount &&
    new Set(reactionIds).size === reactionIds.length &&
    reactionIds.every((id) => availableReactionIds.has(id))
  );
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
