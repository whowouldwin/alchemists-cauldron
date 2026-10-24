import type { GameState } from "../../state/game-state.ts";
import { renderActiveGame } from "./render-active-game.ts";
import { renderGameOver } from "./render-game-over.ts";
import { renderStartScreen } from "./render-start-screen.ts";
import type { StartScreenOptions } from "./render-start-screen.ts";

export function renderGame(
  state: GameState | null,
  showLeaderboardNameEntry = false,
  startScreenOptions: StartScreenOptions = {
    selectedDifficulty: "medium",
    isDifficultySettingsOpen: false,
  },
): HTMLElement {
  if (state === null) {
    return renderStartScreen(startScreenOptions);
  }

  if (state.gameOverReason !== null) {
    return renderGameOver(
      state,
      state.gameOverReason,
      showLeaderboardNameEntry,
    );
  }

  return renderActiveGame(state);
}
