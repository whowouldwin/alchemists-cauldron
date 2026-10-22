export type Difficulty = "easy" | "medium" | "hard";

export interface RecipeRange {
  readonly minimum: number;
  readonly maximum: number;
}

export interface Recipe {
  readonly id: string;
  readonly name: string;
  readonly difficulty: Difficulty;
  readonly temperature: RecipeRange;
  readonly density: RecipeRange;
  readonly magicPower: RecipeRange;
}

export const RECIPES: readonly Recipe[] = [
  {
    id: "moon-mist",
    name: "Moon Mist",
    difficulty: "easy",
    temperature: { minimum: 32, maximum: 42 },
    density: { minimum: 12, maximum: 22 },
    magicPower: { minimum: 17, maximum: 27 },
  },
  {
    id: "root-bloom",
    name: "Root Bloom",
    difficulty: "easy",
    temperature: { minimum: 2, maximum: 12 },
    density: { minimum: 24, maximum: 34 },
    magicPower: { minimum: 15, maximum: 25 },
  },
  {
    id: "frost-steam",
    name: "Frost Steam",
    difficulty: "easy",
    temperature: { minimum: 2, maximum: 12 },
    density: { minimum: 7, maximum: 17 },
    magicPower: { minimum: 19, maximum: 29 },
  },
  {
    id: "quiet-swirl",
    name: "Quiet Swirl",
    difficulty: "easy",
    temperature: { minimum: -28, maximum: -18 },
    density: { minimum: 19, maximum: 29 },
    magicPower: { minimum: 17, maximum: 27 },
  },
  {
    id: "bright-dew",
    name: "Bright Dew",
    difficulty: "easy",
    temperature: { minimum: 27, maximum: 37 },
    density: { minimum: 32, maximum: 42 },
    magicPower: { minimum: 25, maximum: 35 },
  },
  {
    id: "snow-dust",
    name: "Snow Dust",
    difficulty: "easy",
    temperature: { minimum: -16, maximum: -6 },
    density: { minimum: 28, maximum: 38 },
    magicPower: { minimum: 29, maximum: 39 },
  },
  {
    id: "acid-spark",
    name: "Acid Spark",
    difficulty: "medium",
    temperature: { minimum: 17, maximum: 27 },
    density: { minimum: 18, maximum: 28 },
    magicPower: { minimum: 29, maximum: 39 },
  },
  {
    id: "void-ember",
    name: "Void Ember",
    difficulty: "medium",
    temperature: { minimum: 0, maximum: 10 },
    density: { minimum: 0, maximum: 10 },
    magicPower: { minimum: 45, maximum: 55 },
  },
  {
    id: "heavy-acid",
    name: "Heavy Acid",
    difficulty: "medium",
    temperature: { minimum: 0, maximum: 10 },
    density: { minimum: 29, maximum: 39 },
    magicPower: { minimum: 25, maximum: 35 },
  },
  {
    id: "frost-acid",
    name: "Frost Acid",
    difficulty: "medium",
    temperature: { minimum: -13, maximum: -3 },
    density: { minimum: 13, maximum: 23 },
    magicPower: { minimum: 31, maximum: 41 },
  },
  {
    id: "dusty-void",
    name: "Dusty Void",
    difficulty: "medium",
    temperature: { minimum: -13, maximum: -3 },
    density: { minimum: 0, maximum: 10 },
    magicPower: { minimum: 47, maximum: 57 },
  },
  {
    id: "dragon-void",
    name: "Dragon Void",
    difficulty: "medium",
    temperature: { minimum: 25, maximum: 35 },
    density: { minimum: 1, maximum: 11 },
    magicPower: { minimum: 55, maximum: 65 },
  },
  {
    id: "rooted-night",
    name: "Rooted Night",
    difficulty: "medium",
    temperature: { minimum: -18, maximum: -8 },
    density: { minimum: 14, maximum: 24 },
    magicPower: { minimum: 55, maximum: 65 },
  },
  {
    id: "phoenix-pulse",
    name: "Phoenix Pulse",
    difficulty: "hard",
    temperature: { minimum: 57, maximum: 67 },
    density: { minimum: 0, maximum: 10 },
    magicPower: { minimum: 37, maximum: 47 },
  },
  {
    id: "slime-crown",
    name: "Slime Crown",
    difficulty: "hard",
    temperature: { minimum: -5, maximum: 5 },
    density: { minimum: 45, maximum: 55 },
    magicPower: { minimum: 3, maximum: 13 },
  },
  {
    id: "void-flame",
    name: "Void Flame",
    difficulty: "hard",
    temperature: { minimum: 25, maximum: 35 },
    density: { minimum: 0, maximum: 10 },
    magicPower: { minimum: 60, maximum: 70 },
  },
  {
    id: "acid-bog",
    name: "Acid Bog",
    difficulty: "hard",
    temperature: { minimum: 10, maximum: 20 },
    density: { minimum: 39, maximum: 49 },
    magicPower: { minimum: 17, maximum: 27 },
  },
  {
    id: "frozen-ash",
    name: "Frozen Ash",
    difficulty: "hard",
    temperature: { minimum: 27, maximum: 37 },
    density: { minimum: 0, maximum: 10 },
    magicPower: { minimum: 39, maximum: 49 },
  },
  {
    id: "triple-eclipse",
    name: "Triple Eclipse",
    difficulty: "hard",
    temperature: { minimum: -20, maximum: -10 },
    density: { minimum: 19, maximum: 29 },
    magicPower: { minimum: 60, maximum: 70 },
  },
  {
    id: "ember-soup",
    name: "Ember Soup",
    difficulty: "hard",
    temperature: { minimum: 62, maximum: 72 },
    density: { minimum: 24, maximum: 34 },
    magicPower: { minimum: 37, maximum: 47 },
  },
];
