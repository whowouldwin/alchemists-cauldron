import type { GameState } from "../state/game-state.ts";
import type { Difficulty } from "../data/recipes.ts";
import {
  clearLeaderboard,
  isValidPlayerName,
  readLeaderboard,
  saveLeaderboardEntry,
} from "../storage/leaderboard.ts";
import { renderLeaderboard } from "../ui/screens/render-leaderboard.ts";

interface LeaderboardControllerOptions {
  readonly applicationRoot: HTMLElement;
  readonly getGameState: () => GameState | null;
  readonly isEntryPending: () => boolean;
  readonly setEntryPending: (pending: boolean) => void;
  readonly getCurrentDifficulty: () => Difficulty;
  readonly render: () => void;
}

export interface LeaderboardController {
  readonly isVisible: () => boolean;
  readonly render: () => HTMLElement;
  readonly afterRender: () => void;
  readonly reset: () => void;
  readonly open: () => void;
  readonly close: () => void;
  readonly selectDifficulty: (difficulty: Difficulty) => void;
  readonly openClearConfirmation: () => void;
  readonly cancelClear: () => void;
  readonly confirmClear: () => void;
  readonly handleNameSubmit: (event: SubmitEvent) => void;
}

export function createLeaderboardController({
  applicationRoot,
  getGameState,
  isEntryPending,
  setEntryPending,
  getCurrentDifficulty,
  render,
}: LeaderboardControllerOptions): LeaderboardController {
  let isVisible = false;
  let selectedDifficulty = getCurrentDifficulty();
  let isClearConfirmationOpen = false;
  let clearErrorMessage: string | null = null;

  function renderScreen(): HTMLElement {
    return renderLeaderboard(
      readLeaderboard(selectedDifficulty),
      isClearConfirmationOpen,
      clearErrorMessage,
      selectedDifficulty,
    );
  }

  function afterRender(): void {
    if (!isClearConfirmationOpen) {
      return;
    }

    const dialog = applicationRoot.querySelector<HTMLDialogElement>(
      ".leaderboard-confirmation",
    );

    if (dialog === null) {
      return;
    }

    dialog.addEventListener("cancel", handleClearDialogCancel, {
      once: true,
    });
    dialog.showModal();
    focusAction("cancel-leaderboard-clear");
  }

  function reset(): void {
    isVisible = false;
    selectedDifficulty = getCurrentDifficulty();
    isClearConfirmationOpen = false;
    clearErrorMessage = null;
  }

  function open(): void {
    isVisible = true;
    selectedDifficulty = getCurrentDifficulty();
    render();
    focusAction("close-leaderboard");
  }

  function close(): void {
    isVisible = false;
    render();
    focusAction("open-leaderboard");
  }

  function selectDifficulty(difficulty: Difficulty): void {
    selectedDifficulty = difficulty;
    render();
    focusSelectedDifficulty();
  }

  function focusSelectedDifficulty(): void {
    applicationRoot
      .querySelector<HTMLButtonElement>(
        `[data-action="select-leaderboard-difficulty"][data-difficulty="${selectedDifficulty}"]`,
      )
      ?.focus();
  }

  function openClearConfirmation(): void {
    clearErrorMessage = null;
    isClearConfirmationOpen = true;
    render();
  }

  function cancelClear(): void {
    isClearConfirmationOpen = false;
    clearErrorMessage = null;
    render();
    focusAction("open-leaderboard-clear-confirmation");
  }

  function handleClearDialogCancel(event: Event): void {
    event.preventDefault();
    cancelClear();
  }

  function confirmClear(): void {
    if (!clearLeaderboard(selectedDifficulty)) {
      clearErrorMessage = "Could not clear the leaderboard. Please try again.";
      render();
      return;
    }

    isClearConfirmationOpen = false;
    clearErrorMessage = null;
    render();
    focusAction("open-leaderboard-clear-confirmation");
  }

  function handleNameSubmit(event: SubmitEvent): void {
    const gameState = getGameState();

    if (
      !(event.target instanceof HTMLFormElement) ||
      event.target.dataset.form !== "leaderboard-entry" ||
      gameState === null ||
      gameState.gameOverReason === null ||
      !isEntryPending()
    ) {
      return;
    }

    event.preventDefault();

    const input = event.target.querySelector<HTMLInputElement>(
      '[name="playerName"]',
    );
    const status = event.target.querySelector<HTMLElement>('[role="status"]');

    if (input === null || status === null) {
      return;
    }

    if (!isValidPlayerName(input.value)) {
      input.setCustomValidity(
        "Enter 2–15 letters, numbers, spaces, underscores or hyphens.",
      );
      input.reportValidity();
      return;
    }

    if (
      !saveLeaderboardEntry(input.value, gameState.score, gameState.difficulty)
    ) {
      status.textContent = "Could not save your score. Please try again.";
      return;
    }

    setEntryPending(false);
    render();
    focusAction("start-game");
  }

  function focusAction(action: string): void {
    applicationRoot
      .querySelector<HTMLButtonElement>(`[data-action="${action}"]`)
      ?.focus();
  }

  return {
    isVisible: () => isVisible,
    render: renderScreen,
    afterRender,
    reset,
    open,
    close,
    selectDifficulty,
    openClearConfirmation,
    cancelClear,
    confirmClear,
    handleNameSubmit,
  };
}
