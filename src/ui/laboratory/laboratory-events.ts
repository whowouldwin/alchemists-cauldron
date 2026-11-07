interface LaboratoryActions {
  readonly open: () => void;
  readonly close: () => void;
  readonly clearMixture: () => void;
  readonly addIngredient: (ingredientId: string) => void;
  readonly selectRecipe: (recipeId: string) => void;
  readonly addReaction: (reactionId: string) => void;
  readonly removeReaction: (reactionId: string) => void;
  readonly saveExperiment: () => void;
  readonly restoreExperiment: (key: string) => void;
  readonly removeExperiment: (key: string) => void;
  readonly reloadExperiments: () => void;
}

export function createLaboratoryClickHandler(
  actions: LaboratoryActions,
): (event: MouseEvent) => void {
  return (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest<HTMLButtonElement>(
      "button[data-action]",
    );

    if (button === null || button.disabled) {
      return;
    }

    switch (button.dataset.action) {
      case "open-laboratory":
        actions.open();
        break;
      case "close-laboratory":
        actions.close();
        break;
      case "clear-laboratory-mixture":
        actions.clearMixture();
        break;
      case "save-laboratory-experiment":
        actions.saveExperiment();
        break;
      case "reload-laboratory-experiments":
        actions.reloadExperiments();
        break;
      case "open-laboratory-experiment":
      case "remove-laboratory-experiment": {
        const key = button.dataset.experimentKey;
        if (key === undefined) {
          break;
        }
        if (button.dataset.action === "open-laboratory-experiment") {
          actions.restoreExperiment(key);
        } else {
          actions.removeExperiment(key);
        }
        break;
      }
      case "remove-laboratory-reaction": {
        const reactionId = button.dataset.reactionId;

        if (reactionId !== undefined) {
          actions.removeReaction(reactionId);
        }
        break;
      }
      case "add-laboratory-ingredient": {
        const ingredientId = button.dataset.laboratoryIngredientId;

        if (ingredientId !== undefined) {
          actions.addIngredient(ingredientId);
        }
        break;
      }
    }
  };
}

export function createLaboratoryChangeHandler(
  actions: LaboratoryActions,
): (event: Event) => void {
  return (event) => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement) || select.disabled) {
      return;
    }

    switch (select.dataset.action) {
      case "select-laboratory-recipe":
        actions.selectRecipe(select.value);
        break;
      case "add-laboratory-reaction":
        actions.addReaction(select.value);
        break;
    }
  };
}
