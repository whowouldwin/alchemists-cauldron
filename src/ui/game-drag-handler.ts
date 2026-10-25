const INGREDIENT_ID_DATA_TYPE = "text/plain";
const CAULDRON_DROP_TARGET = '[data-drop-target="cauldron"]';
const DROP_TARGET_CLASS = "cauldron-panel--drop-target";

export interface GameDragActions {
  readonly canAddIngredient: (ingredientId: string) => boolean;
  readonly addIngredient: (ingredientId: string) => void;
}

export class GameDragHandler {
  private draggedIngredientId: string | null = null;
  private activeDropTarget: HTMLElement | null = null;

  constructor(private readonly actions: GameDragActions) {}

  readonly handleDragStart = (event: DragEvent): void => {
    this.draggedIngredientId = null;

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
      !this.actions.canAddIngredient(ingredientId) ||
      event.dataTransfer === null
    ) {
      event.preventDefault();
      return;
    }

    this.draggedIngredientId = ingredientId;
    event.dataTransfer.setData(INGREDIENT_ID_DATA_TYPE, ingredientId);
    event.dataTransfer.effectAllowed = "move";
  };

  readonly handleDragOver = (event: DragEvent): void => {
    const dropTarget = getDropTarget(event.target);

    if (dropTarget === null) {
      return;
    }

    if (
      this.draggedIngredientId === null ||
      event.dataTransfer === null ||
      !this.actions.canAddIngredient(this.draggedIngredientId)
    ) {
      this.clearDropTarget(dropTarget);
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    dropTarget.classList.add(DROP_TARGET_CLASS);
    this.activeDropTarget = dropTarget;
  };

  readonly handleDragLeave = (event: DragEvent): void => {
    const dropTarget = getDropTarget(event.target);

    if (
      dropTarget === null ||
      (event.relatedTarget instanceof Node &&
        dropTarget.contains(event.relatedTarget))
    ) {
      return;
    }

    this.clearDropTarget(dropTarget);
  };

  readonly handleDrop = (event: DragEvent): void => {
    const dropTarget = getDropTarget(event.target);

    if (dropTarget === null) {
      return;
    }

    const ingredientId = event.dataTransfer?.getData(INGREDIENT_ID_DATA_TYPE);

    if (
      ingredientId !== undefined &&
      ingredientId !== "" &&
      ingredientId === this.draggedIngredientId &&
      this.actions.canAddIngredient(ingredientId)
    ) {
      event.preventDefault();
      this.actions.addIngredient(ingredientId);
    }

    this.handleDragEnd();
  };

  readonly handleDragEnd = (): void => {
    this.draggedIngredientId = null;
    this.clearDropTarget(this.activeDropTarget);
  };

  private clearDropTarget(dropTarget: HTMLElement | null): void {
    if (dropTarget === null) {
      return;
    }

    dropTarget.classList.remove(DROP_TARGET_CLASS);

    if (this.activeDropTarget === dropTarget) {
      this.activeDropTarget = null;
    }
  }
}

function getDropTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLElement>(CAULDRON_DROP_TARGET);
}
