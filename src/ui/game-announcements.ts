import { MAX_CAULDRON_INGREDIENTS } from "../state/game-state.ts";

export interface GameAnnouncements {
  readonly region: HTMLDivElement;
  ingredientAdded(ingredientName: string, ingredientCount: number): void;
  brewResult(succeeded: boolean): void;
}

export function createGameAnnouncements(): GameAnnouncements {
  const region = document.createElement("div");
  region.id = "app-announcements";
  region.className = "visually-hidden";
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "true");

  return {
    region,
    ingredientAdded(ingredientName, ingredientCount) {
      const cauldronMessage =
        ingredientCount >= MAX_CAULDRON_INGREDIENTS
          ? `The cauldron is full at ${ingredientCount} of ${MAX_CAULDRON_INGREDIENTS}.`
          : `The cauldron contains ${ingredientCount} of ${MAX_CAULDRON_INGREDIENTS} ingredients.`;

      region.textContent = `${ingredientName} added. ${cauldronMessage}`;
    },
    brewResult(succeeded) {
      region.textContent = succeeded
        ? "Brew successful. 200 points awarded. A new recipe is ready."
        : "Brew failed. One life was lost.";
    },
  };
}
