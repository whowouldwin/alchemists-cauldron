import type { DiscoveryJournalController } from "./discovery-journal-controller.ts";
import { focusGameAction } from "./focus-game-action.ts";
import { renderDiscoveryJournal } from "../ui/journal/render-discovery-journal.ts";
import type { JournalSection } from "../ui/journal/render-journal-collection.ts";

interface JournalScreenControllerOptions {
  readonly applicationRoot: HTMLElement;
  readonly journal: DiscoveryJournalController;
  readonly render: () => void;
}

export class JournalScreenController {
  private visible = false;
  private selectedSection: JournalSection = "recipes";
  private readonly options: JournalScreenControllerOptions;

  constructor(options: JournalScreenControllerOptions) {
    this.options = options;
  }

  get isVisible(): boolean {
    return this.visible;
  }

  readonly render = (): HTMLElement =>
    renderDiscoveryJournal(
      this.options.journal.currentJournal,
      this.selectedSection,
      this.options.journal.hasUnsavedDiscoveries,
    );

  readonly open = (): void => {
    this.visible = true;
    this.options.render();
    focusGameAction(this.options.applicationRoot, "close-journal");
  };

  readonly close = (): void => {
    this.visible = false;
    this.options.render();
    focusGameAction(this.options.applicationRoot, "open-journal");
  };

  readonly selectSection = (section: JournalSection): void => {
    if (section === this.selectedSection) {
      return;
    }

    this.selectedSection = section;
    this.options.render();
    this.options.applicationRoot
      .querySelector<HTMLButtonElement>(`[data-journal-section="${section}"]`)
      ?.focus();
  };

  readonly reset = (): void => {
    this.visible = false;
    this.selectedSection = "recipes";
  };
}
