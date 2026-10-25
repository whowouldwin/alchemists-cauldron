import { CAULDRON_ICON } from "../shared/ui-assets.ts";
import {
  renderLeaderboardButton,
  renderTopbar,
} from "../shared/render-layout.ts";
import { createElement } from "../shared/create-element.ts";
import type { Difficulty } from "../../data/recipes.ts";
import { renderDifficultySettings } from "./render-difficulty-settings.ts";
import { renderHelpPanel } from "./render-help-panel.ts";
import { renderStartStatus } from "./render-start-status.ts";

export interface StartScreenOptions {
  readonly selectedDifficulty: Difficulty;
  readonly isDifficultySettingsOpen: boolean;
  readonly isHelpOpen: boolean;
  readonly hasSavedGame: boolean;
}

export function renderStartScreen(options: StartScreenOptions): HTMLElement {
  const appShell = createElement("main", "app-shell start-screen");
  const welcomePanel = createElement("section", "welcome-panel");
  const welcomeCopy = createElement("div", "welcome-copy");
  const eyebrowText = createElement("p", "eyebrow", "A new experiment awaits");
  const heading = createElement("h1");
  const headingAccent = createElement("em", undefined, "magic.");
  const description = createElement(
    "p",
    "welcome-description",
    "Choose ingredients, match the recipe's three target ranges, then brew your potion.",
  );
  const startButton = createElement("button", "primary-button");
  const buttonLabel = createElement("span", undefined, "Start Game");
  const buttonIcon = createElement("span", undefined, "↗");
  const continueButton = options.hasSavedGame
    ? createElement("button", "leaderboard-link", "Continue Game")
    : null;
  const welcomeArt = createElement("div", "welcome-art");
  const cauldronImage = createElement("img");
  const pinkSparkle = createElement(
    "span",
    "welcome-art__sparkle welcome-art__sparkle--pink",
    "✦",
  );
  const yellowSparkle = createElement(
    "span",
    "welcome-art__sparkle welcome-art__sparkle--yellow",
    "✦",
  );

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
  welcomeArt.append(cauldronImage, pinkSparkle, yellowSparkle);
  welcomePanel.append(welcomeCopy, welcomeArt);

  const topbar = renderTopbar();
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
    renderStartStatus(),
    helpPanel,
    difficultySettings,
  );

  return appShell;
}
