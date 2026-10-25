import type { Difficulty } from "../data/recipes.ts";

export interface GameClickActions {
  readonly startGame: () => void;
  readonly openDifficultySettings: () => void;
  readonly closeDifficultySettings: () => void;
  readonly selectDifficulty: (difficulty: Difficulty) => void;
  readonly openHelp: () => void;
  readonly closeHelp: () => void;
  readonly pauseGame: () => void;
  readonly resumeGame: () => void;
  readonly exitToMenu: () => void;
  readonly brew: () => void;
  readonly addIngredient: (ingredientId: string) => void;
  readonly openLeaderboard: () => void;
  readonly closeLeaderboard: () => void;
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

    const startButton = event.target.closest<HTMLButtonElement>(
      '[data-action="start-game"]',
    );

    if (startButton !== null) {
      actions.startGame();
      return;
    }

    const openSettingsButton = event.target.closest<HTMLButtonElement>(
      '[data-action="open-difficulty-settings"]',
    );

    if (openSettingsButton !== null) {
      actions.openDifficultySettings();
      return;
    }

    const openHelpButton = event.target.closest<HTMLButtonElement>(
      '[data-action="open-help"]',
    );

    if (openHelpButton !== null) {
      actions.openHelp();
      return;
    }

    const closeSettingsButton = event.target.closest<HTMLButtonElement>(
      '[data-action="close-difficulty-settings"]',
    );

    if (closeSettingsButton !== null) {
      actions.closeDifficultySettings();
      return;
    }

    const closeHelpButton = event.target.closest<HTMLButtonElement>(
      '[data-action="close-help"]',
    );

    if (closeHelpButton !== null) {
      actions.closeHelp();
      return;
    }

    const difficultyButton = event.target.closest<HTMLButtonElement>(
      '[data-action="select-difficulty"]',
    );

    if (difficultyButton !== null) {
      const difficulty = difficultyButton.dataset.difficulty;

      if (isDifficulty(difficulty)) {
        actions.selectDifficulty(difficulty);
      }
      return;
    }

    const openLeaderboardButton = event.target.closest<HTMLButtonElement>(
      '[data-action="open-leaderboard"]',
    );

    if (openLeaderboardButton !== null) {
      actions.openLeaderboard();
      return;
    }

    const closeLeaderboardButton = event.target.closest<HTMLButtonElement>(
      '[data-action="close-leaderboard"]',
    );

    if (closeLeaderboardButton !== null) {
      actions.closeLeaderboard();
      return;
    }

    const openClearConfirmationButton = event.target.closest<HTMLButtonElement>(
      '[data-action="open-leaderboard-clear-confirmation"]',
    );

    if (openClearConfirmationButton !== null) {
      actions.openLeaderboardClearConfirmation();
      return;
    }

    const cancelLeaderboardClearButton =
      event.target.closest<HTMLButtonElement>(
        '[data-action="cancel-leaderboard-clear"]',
      );

    if (cancelLeaderboardClearButton !== null) {
      actions.cancelLeaderboardClear();
      return;
    }

    const confirmLeaderboardClearButton =
      event.target.closest<HTMLButtonElement>(
        '[data-action="confirm-leaderboard-clear"]',
      );

    if (confirmLeaderboardClearButton !== null) {
      actions.confirmLeaderboardClear();
      return;
    }

    const pauseButton = event.target.closest<HTMLButtonElement>(
      '[data-action="pause-game"]',
    );

    if (pauseButton !== null) {
      if (!pauseButton.disabled) {
        actions.pauseGame();
      }
      return;
    }

    const resumeButton = event.target.closest<HTMLButtonElement>(
      '[data-action="resume-game"]',
    );

    if (resumeButton !== null) {
      if (!resumeButton.disabled) {
        actions.resumeGame();
      }
      return;
    }

    const exitButton = event.target.closest<HTMLButtonElement>(
      '[data-action="exit-to-menu"]',
    );

    if (exitButton !== null) {
      if (!exitButton.disabled) {
        actions.exitToMenu();
      }
      return;
    }

    const brewButton = event.target.closest<HTMLButtonElement>(
      '[data-action="brew"]',
    );

    if (brewButton !== null) {
      if (!brewButton.disabled) {
        actions.brew();
      }
      return;
    }

    const ingredientButton = event.target.closest<HTMLButtonElement>(
      "[data-ingredient-id]",
    );

    if (ingredientButton === null || ingredientButton.disabled) {
      return;
    }

    const ingredientId = ingredientButton.dataset.ingredientId;

    if (ingredientId !== undefined) {
      actions.addIngredient(ingredientId);
    }
  };
}

function isDifficulty(value: string | undefined): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}
