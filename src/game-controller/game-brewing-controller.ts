import { DIFFICULTY_SETTINGS } from "../data/difficulty-settings.ts";
import { isBrewSuccessful } from "../logic/brew-check.ts";
import { resolveCauldronReactions } from "../logic/reactions/reaction-engine.ts";
import type { GameState } from "../state/game-state.ts";
import {
  addIngredientWithReactions,
  applyBrewResult,
  canAddIngredient,
  pourOut,
} from "../state/game-actions.ts";
import type { GameAnnouncements } from "../ui/game-announcements.ts";

interface GameBrewingControllerOptions {
  readonly getGameState: () => GameState | null;
  readonly setGameState: (gameState: GameState) => void;
  readonly finishGameIfNeeded: () => boolean;
  readonly saveCurrentGame: () => void;
  readonly render: () => void;
  readonly announcements: GameAnnouncements;
}

export class GameBrewingController {
  private readonly options: GameBrewingControllerOptions;

  constructor(options: GameBrewingControllerOptions) {
    this.options = options;
  }

  readonly canAddIngredient = (ingredientId: string): boolean => {
    const gameState = this.options.getGameState();
    return gameState !== null && canAddIngredient(gameState, ingredientId);
  };

  readonly addIngredient = (ingredientId: string): void => {
    const gameState = this.options.getGameState();

    if (gameState === null || this.options.finishGameIfNeeded()) {
      return;
    }

    const addition = addIngredientWithReactions(gameState, ingredientId);
    const { state: nextState, ingredient, activatedReactions } = addition;

    if (nextState === gameState) {
      return;
    }

    if (ingredient === null) {
      return;
    }

    this.options.setGameState(nextState);

    if (this.options.finishGameIfNeeded()) {
      return;
    }

    this.options.saveCurrentGame();
    this.options.render();
    this.options.announcements.ingredientAdded(
      ingredient.name,
      nextState.cauldronIngredients.length,
      DIFFICULTY_SETTINGS[nextState.difficulty].maxCauldronIngredients,
      activatedReactions.map(({ name }) => name),
      activatedReactions.some(({ effects }) => effects?.clearCauldron === true),
    );
  };

  readonly brew = (): void => {
    const gameState = this.options.getGameState();

    if (
      gameState === null ||
      this.options.finishGameIfNeeded() ||
      gameState.cauldronIngredients.length === 0
    ) {
      return;
    }

    const values = resolveCauldronReactions(
      gameState.cauldronIngredients,
      gameState.activeReactionIds,
    ).values;
    const succeeded = isBrewSuccessful(
      values,
      gameState.activeRecipe,
      gameState.difficulty,
    );
    const nextState = applyBrewResult(gameState, succeeded);

    this.options.setGameState(nextState);

    if (this.options.finishGameIfNeeded()) {
      return;
    }

    this.options.saveCurrentGame();
    this.options.render();
    this.options.announcements.brewResult(
      succeeded,
      DIFFICULTY_SETTINGS[nextState.difficulty].scorePerBrew,
    );
  };

  readonly pourOut = (): void => {
    const gameState = this.options.getGameState();

    if (
      gameState === null ||
      this.options.finishGameIfNeeded() ||
      gameState.cauldronIngredients.length === 0
    ) {
      return;
    }

    const nextState = pourOut(gameState);

    if (nextState === gameState) {
      return;
    }

    this.options.setGameState(nextState);

    if (this.options.finishGameIfNeeded()) {
      return;
    }

    this.options.saveCurrentGame();
    this.options.render();
    this.options.announcements.cauldronPouredOut();
  };
}
