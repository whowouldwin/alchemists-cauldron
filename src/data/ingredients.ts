export const INGREDIENTS = [
  {
    id: "dragon-tears",
    name: "Dragon Tears",
    temperature: 25,
    density: 8,
    magicPower: 10,
    icon: "dragon-tears",
  },
  {
    id: "fairy-dust",
    name: "Fairy Dust",
    temperature: 12,
    density: 9,
    magicPower: 12,
    icon: "fairy-dust",
  },
  {
    id: "frost-lotus",
    name: "Frost Lotus",
    temperature: -18,
    density: 4,
    magicPower: 14,
    icon: "frost-lotus",
  },
  {
    id: "mandrake-root",
    name: "Mandrake Root",
    temperature: -5,
    density: 20,
    magicPower: 8,
    icon: "mandrake-root",
  },
  {
    id: "caustic-acid",
    name: "Caustic Acid",
    temperature: 10,
    density: 14,
    magicPower: 22,
    icon: "caustic-acid",
  },
  {
    id: "essence-of-the-void",
    name: "Essence of the Void",
    temperature: -20,
    density: -10,
    magicPower: 40,
    icon: "essence-of-the-void",
  },
  {
    id: "phoenix-feather",
    name: "Phoenix Feather",
    temperature: 50,
    density: -10,
    magicPower: 30,
    icon: "phoenix-feather",
  },
  {
    id: "toad-slime",
    name: "Toad Slime",
    temperature: 5,
    density: 30,
    magicPower: 0,
    icon: "toad-slime",
  },
] as const;

export type Ingredient = (typeof INGREDIENTS)[number];
export type IngredientId = Ingredient["id"];
export type IngredientIcon = Ingredient["icon"];

export const LEVEL_ONE_INGREDIENTS: readonly Ingredient[] = INGREDIENTS.slice(
  0,
  6,
);
