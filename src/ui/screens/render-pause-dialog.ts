import { createElement } from "../shared/create-element.ts";

export function renderPauseDialog(): HTMLElement {
  const overlay = createElement("div", "pause-overlay");
  const dialog = createElement("section", "pause-dialog");
  const eyebrow = createElement("p", "eyebrow", "A moment to breathe");
  const heading = createElement("h2", undefined, "Game paused");
  const description = createElement(
    "p",
    "pause-dialog__description",
    "Your experiment is waiting. Pick up right where you left off.",
  );
  const actions = createElement("div", "pause-dialog__actions");
  const resumeButton = createElement("button", "primary-button", "Resume");
  const exitButton = createElement(
    "button",
    "pause-dialog__exit",
    "Exit to Menu",
  );

  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "pause-heading");
  heading.id = "pause-heading";
  resumeButton.type = "button";
  resumeButton.dataset.action = "resume-game";
  exitButton.type = "button";
  exitButton.dataset.action = "exit-to-menu";
  actions.append(resumeButton, exitButton);
  dialog.append(eyebrow, heading, description, actions);
  overlay.append(dialog);

  return overlay;
}
