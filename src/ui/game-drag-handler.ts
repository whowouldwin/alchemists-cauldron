const INGREDIENT_ID_DATA_TYPE = "text/plain";
const CAULDRON_DROP_TARGET = '[data-drop-target="cauldron"]';
const DROP_TARGET_CLASS = "cauldron-panel--drop-target";

export interface GameDragActions {
  readonly canAddIngredient: (ingredientId: string) => boolean;
  readonly addIngredient: (ingredientId: string) => void;
}

export interface GameDragHandlers {
  readonly handleDragStart: (event: DragEvent) => void;
  readonly handleDragOver: (event: DragEvent) => void;
  readonly handleDragLeave: (event: DragEvent) => void;
  readonly handleDrop: (event: DragEvent) => void;
  readonly handleDragEnd: () => void;
}

export function createGameDragHandler(
  actions: GameDragActions,
): GameDragHandlers {
  let draggedIngredientId: string | null = null;
  let activeDropTarget: HTMLElement | null = null;

  function clearDropTarget(dropTarget: HTMLElement | null): void {
    if (dropTarget === null) {
      return;
    }

    dropTarget.classList.remove(DROP_TARGET_CLASS);

    if (activeDropTarget === dropTarget) {
      activeDropTarget = null;
    }
  }

  function handleDragStart(event: DragEvent): void {
    draggedIngredientId = null;

    if (!(event.target instanceof Element)) {
      return;
    }

    const ingredientCard = event.target.closest<HTMLButtonElement>(
      "[data-ingredient-id]",
    );

    if (ingredientCard === null) {
      return;
    }

    const ingredientId = ingredientCard.dataset.ingredientId;

    if (
      ingredientCard.disabled ||
      ingredientId === undefined ||
      !actions.canAddIngredient(ingredientId) ||
      event.dataTransfer === null
    ) {
      event.preventDefault();
      return;
    }

    draggedIngredientId = ingredientId;
    event.dataTransfer.setData(INGREDIENT_ID_DATA_TYPE, ingredientId);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(event: DragEvent): void {
    const dropTarget = getDropTarget(event.target);

    if (dropTarget === null) {
      return;
    }

    if (
      draggedIngredientId === null ||
      event.dataTransfer === null ||
      !actions.canAddIngredient(draggedIngredientId)
    ) {
      clearDropTarget(dropTarget);
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    dropTarget.classList.add(DROP_TARGET_CLASS);
    activeDropTarget = dropTarget;
  }

  function handleDragLeave(event: DragEvent): void {
    const dropTarget = getDropTarget(event.target);

    if (
      dropTarget === null ||
      (event.relatedTarget instanceof Node &&
        dropTarget.contains(event.relatedTarget))
    ) {
      return;
    }

    clearDropTarget(dropTarget);
  }

  function handleDrop(event: DragEvent): void {
    const dropTarget = getDropTarget(event.target);

    if (dropTarget === null) {
      return;
    }

    const ingredientId = event.dataTransfer?.getData(INGREDIENT_ID_DATA_TYPE);

    if (
      ingredientId !== undefined &&
      ingredientId !== "" &&
      ingredientId === draggedIngredientId &&
      actions.canAddIngredient(ingredientId)
    ) {
      event.preventDefault();
      actions.addIngredient(ingredientId);
    }

    handleDragEnd();
  }

  function handleDragEnd(): void {
    draggedIngredientId = null;
    clearDropTarget(activeDropTarget);
  }

  return {
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}

function getDropTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLElement>(CAULDRON_DROP_TARGET);
}
