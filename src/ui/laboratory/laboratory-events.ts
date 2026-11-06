interface LaboratoryActions {
  readonly open: () => void;
  readonly close: () => void;
  readonly clearMixture: () => void;
  readonly addIngredient: (ingredientId: string) => void;
  readonly selectRecipe: (recipeId: string) => void;
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

export function createLaboratoryRecipeHandler(
  actions: LaboratoryActions,
): (event: Event) => void {
  return (event) => {
    if (
      event.target instanceof HTMLSelectElement &&
      event.target.dataset.action === "select-laboratory-recipe"
    ) {
      actions.selectRecipe(event.target.value);
    }
  };
}
