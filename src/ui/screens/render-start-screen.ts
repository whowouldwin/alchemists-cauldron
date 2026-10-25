import { CAULDRON_ICON } from "../shared/ui-assets.ts";
import {
  renderEmptyPanel,
  renderLeaderboardButton,
  renderTopbar,
} from "../shared/render-layout.ts";
import { createElement } from "../shared/create-element.ts";
import type { Difficulty } from "../../data/recipes.ts";
import { renderDifficultySettings } from "./render-difficulty-settings.ts";
import { renderHelpPanel } from "./render-help-panel.ts";

export interface StartScreenOptions {
  readonly selectedDifficulty: Difficulty;
  readonly isDifficultySettingsOpen: boolean;
  readonly isHelpOpen: boolean;
  readonly hasSavedGame: boolean;
}

export function renderStartScreen(options: StartScreenOptions): HTMLElement {
  const appShell = createElement("main", "app-shell");
  const welcomePanel = createElement("section", "welcome-panel");
  const welcomeCopy = createElement("div", "welcome-copy");
  const eyebrowText = createElement("p", "eyebrow", "A new experiment awaits");
  const heading = createElement("h1");
  const headingAccent = createElement("em", undefined, "magic.");
  const description = createElement(
    "p",
    "welcome-description",
    "Gather curious ingredients, mind your measures, and see what stirs beneath the surface.",
  );
  const startButton = createElement("button", "primary-button");
  const buttonLabel = createElement("span", undefined, "Start Game");
  const buttonIcon = createElement("span", undefined, "↗");
  const continueButton = options.hasSavedGame
    ? createElement("button", "leaderboard-link", "Continue Game")
    : null;
  const welcomeArt = createElement("div", "welcome-art");
  const cauldronImage = createElement("img");
  const preGameStats = createElement("div", "pre-game-stats");
  const score = createElement("div");
  const scoreLabel = createElement("span", undefined, "Score");
  const scoreValue = createElement("strong", undefined, "0");
  const time = createElement("div");
  const timeLabel = createElement("span", undefined, "Time");
  const timeValue = createElement("strong", undefined, "0:00");
  const gameLayout = createElement("div", "game-layout game-layout--empty");

  welcomePanel.setAttribute("aria-labelledby", "welcome-heading");
  heading.id = "welcome-heading";
  heading.append("Brew a little ", headingAccent);
  startButton.type = "button";
  startButton.dataset.action = "start-game";
  buttonIcon.setAttribute("aria-hidden", "true");
  startButton.append(buttonLabel, buttonIcon);
  if (continueButton !== null) {
    continueButton.type = "button";
    continueButton.dataset.action = "continue-game";
  }
  welcomeCopy.append(eyebrowText, heading, description);

  welcomeArt.setAttribute("aria-hidden", "true");
  cauldronImage.src = CAULDRON_ICON;
  cauldronImage.alt = "";
  welcomeArt.append(cauldronImage);
  welcomePanel.append(welcomeCopy, welcomeArt);

  preGameStats.setAttribute("aria-label", "Game status");
  score.append(scoreLabel, scoreValue);
  time.append(timeLabel, timeValue);
  preGameStats.append(score, time);

  gameLayout.append(
    renderEmptyPanel(
      "shelf",
      "Ingredient shelf",
      "Your ingredients",
      "Your ingredients will appear here when the game begins.",
    ),
    renderEmptyPanel(
      "cauldron",
      "Cauldron",
      "The mixing vessel",
      "Your cauldron is empty and ready for its first brew.",
    ),
  );

  const topbar = renderTopbar("A little magic lab");
  const settingsButton = createElement(
    "button",
    "leaderboard-link",
    "Settings",
  );
  const helpButton = createElement("button", "leaderboard-link", "Help");
  const topbarActions = createElement("div", "start-screen-actions");
  const startActions = createElement("div", "start-actions");

  settingsButton.type = "button";
  settingsButton.dataset.action = "open-difficulty-settings";
  settingsButton.setAttribute(
    "aria-expanded",
    String(options.isDifficultySettingsOpen),
  );
  settingsButton.setAttribute("aria-controls", "difficulty-settings");
  helpButton.type = "button";
  helpButton.dataset.action = "open-help";
  helpButton.setAttribute("aria-expanded", String(options.isHelpOpen));
  helpButton.setAttribute("aria-controls", "game-help");
  topbarActions.append(helpButton, settingsButton, renderLeaderboardButton());
  topbar.append(topbarActions);
  startActions.append(startButton);

  if (continueButton !== null) {
    startActions.append(continueButton);
  }
  const difficultySettings = renderDifficultySettings(
    options.selectedDifficulty,
  );
  const helpPanel = renderHelpPanel();

  appShell.append(
    topbar,
    welcomePanel,
    startActions,
    helpPanel,
    difficultySettings,
  );
  appShell.append(preGameStats, gameLayout);

  return appShell;
}
