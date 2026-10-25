import type { GameState } from "../state/game-state.ts";
import { focusGameAction } from "./focus-game-action.ts";
import {
  isValidPlayerName,
  saveLeaderboardEntry,
} from "../storage/leaderboard.ts";

interface LeaderboardEntryControllerOptions {
  readonly applicationRoot: HTMLElement;
  readonly getGameState: () => GameState | null;
  readonly isEntryPending: () => boolean;
  readonly setEntryPending: (pending: boolean) => void;
  readonly render: () => void;
}

export class LeaderboardEntryController {
  constructor(private readonly options: LeaderboardEntryControllerOptions) {}

  readonly handleSubmit = (event: SubmitEvent): void => {
    const gameState = this.options.getGameState();

    if (
      !(event.target instanceof HTMLFormElement) ||
      event.target.dataset.form !== "leaderboard-entry" ||
      gameState === null ||
      gameState.gameOverReason === null ||
      !this.options.isEntryPending()
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

    this.options.setEntryPending(false);
    this.options.render();
    focusGameAction(this.options.applicationRoot, "start-game");
  };
}
