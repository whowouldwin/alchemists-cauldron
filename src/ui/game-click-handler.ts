export interface GameClickActions {
  readonly startGame: () => void;
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
