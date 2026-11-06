import {
  recordRecipeDiscovery,
  recordReactionDiscoveries,
  type DiscoveryJournal,
} from "../progress/discovery-journal.ts";
import {
  loadDiscoveryJournal,
  saveDiscoveryJournal,
  type DiscoveryJournalStorage,
} from "../storage/discovery-journal.ts";

export class DiscoveryJournalController {
  private journal: DiscoveryJournal;
  private unsavedDiscoveries = false;
  private readonly storage: DiscoveryJournalStorage | undefined;

  constructor(storage?: DiscoveryJournalStorage) {
    this.storage = storage;
    this.journal = loadDiscoveryJournal(storage);
  }

  get currentJournal(): DiscoveryJournal {
    return this.journal;
  }

  get hasUnsavedDiscoveries(): boolean {
    return this.unsavedDiscoveries;
  }

  readonly recordRecipe = (recipeId: string): void => {
    this.updateJournal(recordRecipeDiscovery(this.journal, recipeId));
  };

  readonly recordReactions = (reactionIds: readonly string[]): void => {
    this.updateJournal(recordReactionDiscoveries(this.journal, reactionIds));
  };

  private updateJournal(nextJournal: DiscoveryJournal): void {
    if (nextJournal === this.journal && !this.unsavedDiscoveries) {
      return;
    }

    this.journal = nextJournal;
    this.unsavedDiscoveries = !saveDiscoveryJournal(nextJournal, this.storage);
  }
}
