import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import {
  addLaboratoryIngredient,
  clearLaboratoryMixture,
  createLaboratoryState,
  selectLaboratoryRecipe,
  type LaboratoryState,
} from "../laboratory/laboratory-state.ts";
import { evaluateLaboratoryMixture } from "../laboratory/laboratory-result.ts";
import {
  addLaboratoryReaction,
  removeLaboratoryReaction,
} from "../laboratory/laboratory-reactions.ts";
import { renderLaboratory } from "../ui/laboratory/render-laboratory.ts";
import { getLaboratoryStatusMessage } from "../ui/laboratory/laboratory-status.ts";
import {
  focusLaboratoryRecipe,
  focusLaboratoryIngredient,
  focusLaboratoryReaction,
} from "../ui/laboratory/laboratory-focus.ts";
import { focusGameAction } from "./focus-game-action.ts";

interface LaboratoryControllerOptions {
  readonly applicationRoot: HTMLElement;
  readonly canOpen: () => boolean;
  readonly render: () => void;
  readonly announce: (message: string) => void;
}

export class LaboratoryController {
  private visible = false;
  private state = createLaboratoryState();
  private readonly options: LaboratoryControllerOptions;

  constructor(options: LaboratoryControllerOptions) {
    this.options = options;
  }

  get isVisible(): boolean {
    return this.visible;
  }

  readonly render = (): HTMLElement => {
    const calculationIsOpen =
      this.options.applicationRoot.querySelector<HTMLDetailsElement>(
        "#laboratory-calculation",
      )?.open ?? false;

    return renderLaboratory(
      this.state,
      evaluateLaboratoryMixture(this.state),
      calculationIsOpen,
    );
  };

  readonly open = (): void => {
    if (this.visible || !this.options.canOpen()) {
      return;
    }

    this.visible = true;
    this.options.render();
    focusLaboratoryRecipe(this.options.applicationRoot);
  };

  readonly close = (): void => {
    if (!this.visible) {
      return;
    }

    this.visible = false;
    this.options.render();
    focusGameAction(this.options.applicationRoot, "open-laboratory");
  };

  readonly reset = (): void => {
    this.visible = false;
  };

  readonly selectRecipe = (recipeId: string): void => {
    if (!this.update(selectLaboratoryRecipe(this.state, recipeId))) {
      return;
    }

    focusLaboratoryRecipe(this.options.applicationRoot);
    this.options.announce(
      `Now practicing ${this.state.recipe.name}. The mixture and reaction selection are empty.`,
    );
  };

  readonly addIngredient = (ingredientId: string): void => {
    if (!this.update(addLaboratoryIngredient(this.state, ingredientId))) {
      return;
    }

    focusLaboratoryIngredient(this.options.applicationRoot, ingredientId);

    const maximum =
      DIFFICULTY_SETTINGS[this.state.recipe.difficulty].maxCauldronIngredients;
    this.announceResult(
      `${this.state.ingredients.length} of ${maximum} ingredient slots used.`,
    );
  };

  readonly addReaction = (reactionId: string): void => {
    this.updateReactions(addLaboratoryReaction(this.state, reactionId));
  };

  readonly removeReaction = (reactionId: string): void => {
    this.updateReactions(removeLaboratoryReaction(this.state, reactionId));
  };

  readonly clearMixture = (): void => {
    if (!this.update(clearLaboratoryMixture(this.state))) {
      return;
    }

    focusLaboratoryIngredient(this.options.applicationRoot);
    this.options.announce("Mixture cleared. You can start another experiment.");
  };

  private update(nextState: LaboratoryState): boolean {
    if (!this.visible || nextState === this.state) {
      return false;
    }

    this.state = nextState;
    this.options.render();
    return true;
  }

  private updateReactions(nextState: LaboratoryState): void {
    if (!this.update(nextState)) {
      return;
    }

    focusLaboratoryReaction(this.options.applicationRoot);
    this.announceResult("Reaction selection updated.");
  }

  private announceResult(message: string): void {
    const status = getLaboratoryStatusMessage(
      this.state,
      evaluateLaboratoryMixture(this.state),
    );
    this.options.announce(`${message} ${status}`);
  }
}
