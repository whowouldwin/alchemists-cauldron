import type { Difficulty } from "../data/recipes.ts";

export interface GameClickActions {
  readonly startGame: () => void;
  readonly continueGame: () => void;
  readonly openDifficultySettings: () => void;
  readonly closeDifficultySettings: () => void;
  readonly selectDifficulty: (difficulty: Difficulty) => void;
  readonly openHelp: () => void;
  readonly closeHelp: () => void;
  readonly pauseGame: () => void;
  readonly resumeGame: () => void;
  readonly exitToMenu: () => void;
  readonly brew: () => void;
  readonly pourOut: () => void;
  readonly addIngredient: (ingredientId: string) => void;
  readonly openLeaderboard: () => void;
  readonly closeLeaderboard: () => void;
  readonly selectLeaderboardDifficulty: (difficulty: Difficulty) => void;
  readonly openLeaderboardClearConfirmation: () => void;
  readonly cancelLeaderboardClear: () => void;
  readonly confirmLeaderboardClear: () => void;
}

export function createGameClickHandler(
  actions: GameClickActions,
): (event: MouseEvent) => void {
  return (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const actionButton =
      event.target.closest<HTMLButtonElement>("[data-action]");

    if (actionButton !== null && handleActionButton(actionButton, actions)) {
      return;
    }

    handleIngredientButton(event.target, actions);
  };
}

function handleActionButton(
  button: HTMLButtonElement,
  actions: GameClickActions,
): boolean {
  switch (button.dataset.action) {
    case "start-game":
      actions.startGame();
      return true;
    case "continue-game":
      actions.continueGame();
      return true;
    case "open-difficulty-settings":
      actions.openDifficultySettings();
      return true;
    case "close-difficulty-settings":
      actions.closeDifficultySettings();
      return true;
    case "select-difficulty":
      handleDifficultySelection(button, actions.selectDifficulty);
      return true;
    case "open-help":
      actions.openHelp();
      return true;
    case "close-help":
      actions.closeHelp();
      return true;
    case "open-leaderboard":
      actions.openLeaderboard();
      return true;
    case "close-leaderboard":
      actions.closeLeaderboard();
      return true;
    case "select-leaderboard-difficulty":
      handleDifficultySelection(button, actions.selectLeaderboardDifficulty);
      return true;
    case "open-leaderboard-clear-confirmation":
      actions.openLeaderboardClearConfirmation();
      return true;
    case "cancel-leaderboard-clear":
      actions.cancelLeaderboardClear();
      return true;
    case "confirm-leaderboard-clear":
      actions.confirmLeaderboardClear();
      return true;
    case "pause-game":
      invokeIfEnabled(button, actions.pauseGame);
      return true;
    case "resume-game":
      invokeIfEnabled(button, actions.resumeGame);
      return true;
    case "exit-to-menu":
      invokeIfEnabled(button, actions.exitToMenu);
      return true;
    case "brew":
      invokeIfEnabled(button, actions.brew);
      return true;
    case "pour-out":
      invokeIfEnabled(button, actions.pourOut);
      return true;
    default:
      return false;
  }
}

function handleDifficultySelection(
  button: HTMLButtonElement,
  selectDifficulty: (difficulty: Difficulty) => void,
): void {
  const difficulty = button.dataset.difficulty;

  if (isDifficulty(difficulty)) {
    selectDifficulty(difficulty);
  }
}

function invokeIfEnabled(button: HTMLButtonElement, action: () => void): void {
  if (!button.disabled) {
    action();
  }
}

function handleIngredientButton(
  target: Element,
  actions: GameClickActions,
): void {
  const ingredientButton = target.closest<HTMLButtonElement>(
    "[data-ingredient-id]",
  );

  if (ingredientButton === null || ingredientButton.disabled) {
    return;
  }

  const ingredientId = ingredientButton.dataset.ingredientId;

  if (ingredientId !== undefined) {
    actions.addIngredient(ingredientId);
  }
}

function isDifficulty(value: string | undefined): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}
