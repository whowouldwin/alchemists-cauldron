import type { IngredientIcon } from "../data/ingredients.ts";

const ICON_CONTENT: Record<IngredientIcon, string> = {
  "dragon-tears":
    '<path d="M32 7c-7 10-15 19-15 31a15 15 0 0 0 30 0C47 26 39 17 32 7Z"/><path d="M26 42c1 4 4 6 8 6"/>',
  "fairy-dust":
    '<path d="m32 8 5.5 16.5L54 30l-16.5 5.5L32 52l-5.5-16.5L10 30l16.5-5.5L32 8Z"/><path d="M49 8v9M44.5 12.5h9M13 45v7M9.5 48.5h7"/>',
  "frost-lotus":
    '<path d="M32 11v42M14 21l36 22M14 43l36-22M27 16l5 5 5-5M27 48l5-5 5 5M14 27l7-1-1-7M50 37l-7 1 1 7M21 44l1-7-7 1M43 20l-1 7 7-1"/>',
  "mandrake-root":
    '<path d="M32 49V28M32 34c-8 0-13-5-13-12 8 0 13 4 13 12ZM32 30c0-9 5-15 14-16 0 9-5 15-14 16ZM32 47c-5 2-8 5-10 10M32 47c4 2 6 5 7 10M32 47c-1 4-1 7 0 11"/>',
  "caustic-acid":
    '<path d="M25 9h14M28 9v14L16 43a8 8 0 0 0 7 12h18a8 8 0 0 0 7-12L36 23V9M22 40h20M27 34l4 3 5-6"/>',
  "essence-of-the-void":
    '<circle cx="32" cy="32" r="21"/><path d="M42 23a13 13 0 1 0 1 17 10 10 0 0 1-1-17ZM32 25v14M25 32h14"/>',
  "phoenix-feather":
    '<path d="M48 9C25 12 14 25 15 42c1 8 7 13 15 12 17-1 24-18 18-45ZM16 49l22-26M25 39l-1-10M31 33l10 1M36 27l-1-9"/>',
  "toad-slime":
    '<path d="M15 43c0-8 7-12 12-15 2-8 13-10 18-3 7 2 8 12 3 18-2 8-11 13-20 10-7 1-13-3-13-10Z"/><path d="M26 42h.01M40 40h.01M29 49c3 2 6 2 9 0"/>',
};

export function renderIngredientIcon(icon: IngredientIcon): string {
  return `<svg class="ingredient-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${ICON_CONTENT[icon]}</svg>`;
}
