import type { Difficulty } from "../data/recipes.ts";
import { focusGameAction } from "./focus-game-action.ts";

export class GameDialogController {
  private helpDialogIsOpen = false;
  private settingsDialogIsOpen = false;

  constructor(
    private readonly applicationRoot: HTMLElement,
    private readonly getSelectedDifficulty: () => Difficulty,
    private readonly render: () => void,
  ) {}

  get isHelpOpen(): boolean {
    return this.helpDialogIsOpen;
  }

  get isSettingsOpen(): boolean {
    return this.settingsDialogIsOpen;
  }

  reset(): void {
    this.helpDialogIsOpen = false;
    this.settingsDialogIsOpen = false;
  }

  openSettings(): void {
    this.settingsDialogIsOpen = true;
    this.helpDialogIsOpen = false;
    this.render();
  }

  closeSettings(): void {
    this.settingsDialogIsOpen = false;
    this.render();
    focusGameAction(this.applicationRoot, "open-difficulty-settings");
  }

  openHelp(): void {
    this.helpDialogIsOpen = true;
    this.settingsDialogIsOpen = false;
    this.render();
  }

  closeHelp(): void {
    this.helpDialogIsOpen = false;
    this.render();
    focusGameAction(this.applicationRoot, "open-help");
  }

  afterRender(): void {
    this.showHelpDialog();
    this.showSettingsDialog();
  }

  private showHelpDialog(): void {
    if (!this.helpDialogIsOpen) {
      return;
    }

    const dialog =
      this.applicationRoot.querySelector<HTMLDialogElement>("#game-help");

    if (dialog === null) {
      return;
    }

    dialog.addEventListener("cancel", this.handleHelpDialogCancel, {
      once: true,
    });
    dialog.showModal();
    dialog
      .querySelector<HTMLButtonElement>('[data-action="close-help"]')
      ?.focus();
  }

  private showSettingsDialog(): void {
    if (!this.settingsDialogIsOpen) {
      return;
    }

    const dialog = this.applicationRoot.querySelector<HTMLDialogElement>(
      "#difficulty-settings",
    );

    if (dialog === null) {
      return;
    }

    dialog.addEventListener("cancel", this.handleSettingsDialogCancel, {
      once: true,
    });
    dialog.showModal();
    this.focusSelectedDifficulty();
  }

  private readonly handleHelpDialogCancel = (event: Event): void => {
    event.preventDefault();
    this.closeHelp();
  };

  private readonly handleSettingsDialogCancel = (event: Event): void => {
    event.preventDefault();
    this.closeSettings();
  };

  private focusSelectedDifficulty(): void {
    this.applicationRoot
      .querySelector<HTMLButtonElement>(
        `[data-action="select-difficulty"][data-difficulty="${this.getSelectedDifficulty()}"]`,
      )
      ?.focus();
  }
}
