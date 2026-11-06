import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import {
  addLaboratoryIngredient,
  clearLaboratoryMixture,
  createLaboratoryState,
  selectLaboratoryRecipe,
  type LaboratoryState,
} from "../laboratory/laboratory-state.ts";
import { evaluateLaboratoryMixture } from "../laboratory/laboratory-result.ts";
import { renderLaboratory } from "../ui/laboratory/render-laboratory.ts";
import { getLaboratoryStatusMessage } from "../ui/laboratory/render-laboratory-mixture.ts";
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

  readonly render = (): HTMLElement =>
    renderLaboratory(this.state, evaluateLaboratoryMixture(this.state));

  readonly open = (): void => {
    if (this.visible || !this.options.canOpen()) {
      return;
    }

    this.visible = true;
    this.options.render();
    this.focusRecipeSelector();
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

    this.focusRecipeSelector();
    this.options.announce(
      `Now practicing ${this.state.recipe.name}. The mixture is empty.`,
    );
  };

  readonly addIngredient = (ingredientId: string): void => {
    if (!this.update(addLaboratoryIngredient(this.state, ingredientId))) {
      return;
    }

    const button =
      this.options.applicationRoot.querySelector<HTMLButtonElement>(
        `[data-laboratory-ingredient-id="${ingredientId}"]`,
      );

    if (button !== null && !button.disabled) {
      button.focus({ preventScroll: true });
    } else {
      focusGameAction(this.options.applicationRoot, "clear-laboratory-mixture");
    }

    const maximum =
      DIFFICULTY_SETTINGS[this.state.recipe.difficulty].maxCauldronIngredients;
    const status = getLaboratoryStatusMessage(
      this.state,
      evaluateLaboratoryMixture(this.state),
    );
    this.options.announce(
      `${this.state.ingredients.length} of ${maximum} ingredient slots used. ${status}`,
    );
  };

  readonly clearMixture = (): void => {
    if (!this.update(clearLaboratoryMixture(this.state))) {
      return;
    }

    this.options.applicationRoot
      .querySelector<HTMLButtonElement>("[data-laboratory-ingredient-id]")
      ?.focus();
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

  private focusRecipeSelector(): void {
    this.options.applicationRoot
      .querySelector<HTMLSelectElement>("#laboratory-recipe")
      ?.focus();
  }
}
