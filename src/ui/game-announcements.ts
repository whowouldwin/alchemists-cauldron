import type { GameOverReason } from "../state/game-state.ts";

export interface GameAnnouncements {
  readonly region: HTMLDivElement;
  ingredientAdded(
    ingredientName: string,
    ingredientCount: number,
    maximumIngredients: number,
    activatedReactionNames?: readonly string[],
    cauldronWasCleared?: boolean,
  ): void;
  brewResult(succeeded: boolean, scoreAwarded: number): void;
  gameOver(reason: GameOverReason): void;
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
    ingredientAdded(
      ingredientName,
      ingredientCount,
      maximumIngredients,
      activatedReactionNames = [],
      cauldronWasCleared = false,
    ) {
      const reactionMessage =
        activatedReactionNames.length === 0
          ? ""
          : ` Reaction activated: ${activatedReactionNames.join(", ")}.`;
      const cauldronMessage = cauldronWasCleared
        ? " The cauldron was cleared."
        : ingredientCount >= maximumIngredients
          ? ` The cauldron is full at ${ingredientCount} of ${maximumIngredients}.`
          : ` The cauldron contains ${ingredientCount} of ${maximumIngredients} ingredients.`;

      region.textContent = `${ingredientName} added.${reactionMessage}${cauldronMessage}`;
    },
    brewResult(succeeded, scoreAwarded) {
      region.textContent = succeeded
        ? `Brew successful. ${scoreAwarded} points awarded. A new recipe is ready.`
        : "Brew failed. One life was lost.";
    },
    gameOver(reason) {
      const message = {
        time: "Time ran out.",
        lives: "No lives remain.",
        "out-of-ingredients": "There are no ingredients left.",
      }[reason];

      region.textContent = `Game over. ${message}`;
    },
  };
}
