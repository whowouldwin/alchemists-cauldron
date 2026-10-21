import { LEVEL_ONE_INGREDIENTS, type Ingredient } from "../data/ingredients.ts";
import {
  CAULDRON_CAPACITY,
  type GameState,
  isShelfBlocked,
} from "../logic/game-state.ts";
import { renderIngredientIcon } from "./ingredient-icons.ts";

function formatParameter(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  if (value < 0) {
    return `−${Math.abs(value)}`;
  }

  return "0";
}

function renderIngredientCard(
  ingredient: Ingredient,
  stock: number,
  shelfBlocked: boolean,
): string {
  const isEmpty = stock === 0;
  const isDisabled = isEmpty || shelfBlocked;

  return `
    <button class="ingredient-card${isEmpty ? " ingredient-card--empty" : ""}" type="button" data-ingredient-id="${ingredient.id}" data-icon="${ingredient.icon}"${isDisabled ? " disabled" : ""}>
      <span class="stock-badge" aria-label="${stock} portions in stock">${stock}</span>
      ${isEmpty ? '<div class="ingredient-card__art ingredient-card__art--empty" aria-hidden="true"></div>' : `<div class="ingredient-card__art">${renderIngredientIcon(ingredient.icon)}</div>`}
      <h3 class="ingredient-card__name">${ingredient.name}</h3>
      <dl class="ingredient-values" aria-label="Ingredient values">
        <div class="ingredient-values__item">
          <dt>Temperature</dt>
          <dd>${formatParameter(ingredient.temperature)}</dd>
        </div>
        <div class="ingredient-values__item">
          <dt>Density</dt>
          <dd>${formatParameter(ingredient.density)}</dd>
        </div>
        <div class="ingredient-values__item">
          <dt>Magic power</dt>
          <dd>${formatParameter(ingredient.magicPower)}</dd>
        </div>
      </dl>
    </button>`;
}

function renderCauldronIngredients(
  ingredientIds: GameState["cauldronIngredients"],
): string {
  if (ingredientIds.length === 0) {
    return `
      <div class="cauldron-illustration" aria-hidden="true">
        <span class="cauldron-steam cauldron-steam--one"></span>
        <span class="cauldron-steam cauldron-steam--two"></span>
        <svg viewBox="0 0 220 170" focusable="false">
          <path class="cauldron-rim" d="M37 64h146l-12 66a23 23 0 0 1-23 19H72a23 23 0 0 1-23-19L37 64Z" />
          <path class="cauldron-liquid" d="M48 89h124l-7 40a15 15 0 0 1-15 12H70a15 15 0 0 1-15-12l-7-40Z" />
          <path class="cauldron-highlight" d="M58 72h104M68 151l-7 10m91-10 7 10" />
          <circle class="cauldron-bubble cauldron-bubble--one" cx="87" cy="111" r="5" />
          <circle class="cauldron-bubble cauldron-bubble--two" cx="126" cy="123" r="3" />
          <circle class="cauldron-bubble cauldron-bubble--three" cx="143" cy="103" r="4" />
        </svg>
      </div>
      <p class="cauldron-empty-title">Waiting for its first brew</p>
      <p class="cauldron-empty-copy">The cauldron is clear and ready for your ingredients.</p>`;
  }

  const ingredients = ingredientIds
    .map((id, index) => {
      const ingredient = LEVEL_ONE_INGREDIENTS.find((item) => item.id === id);

      if (!ingredient) {
        return "";
      }

      return `<li class="cauldron-ingredient" data-icon="${ingredient.icon}">
      <span class="cauldron-ingredient__position">${index + 1}</span>
      <span class="cauldron-ingredient__icon">${renderIngredientIcon(ingredient.icon)}</span>
      <span class="cauldron-ingredient__name">${ingredient.name}</span>
    </li>`;
    })
    .join("");

  return `<ol class="cauldron-ingredients" aria-label="Ingredients in cauldron">${ingredients}</ol>
    <p class="cauldron-empty-title cauldron-empty-title--filled">Ingredients added in order</p>
    <button class="clear-cauldron-button" type="button" data-action="clear-cauldron">Clear cauldron</button>`;
}

export function renderGameMarkup(state: GameState): string {
  const shelfBlocked = isShelfBlocked(state);
  const shelfCards = LEVEL_ONE_INGREDIENTS.map((ingredient) =>
    renderIngredientCard(
      ingredient,
      state.shelfStock[ingredient.id] ?? 0,
      shelfBlocked,
    ),
  ).join("");
  const cauldronCount = state.cauldronIngredients.length;

  return `
    <div class="game-shell">
      <header class="game-header">
        <div>
          <p class="eyebrow">A small craft of wonder</p>
          <h1>Alchemist's Cauldron</h1>
          <p class="game-intro">Gather curious ingredients and brew a potion worthy of the old apothecary.</p>
        </div>
        <div class="level-badge"><span></span>Level 1 <b>·</b> Medium</div>
      </header>

      <div class="game-board">
        <section class="shelf-panel" aria-labelledby="shelf-title">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Your collection</p>
              <h2 id="shelf-title">Ingredient shelf</h2>
            </div>
            <span class="section-count">01 <i>/</i> 06</span>
          </div>
          <div class="ingredient-grid">${shelfCards}
          </div>
          <p class="shelf-note">Each ingredient is precious. Watch the stock badge as your supplies change.</p>
        </section>

        <aside class="cauldron-panel${shelfBlocked ? " cauldron-panel--full" : ""}" aria-labelledby="cauldron-title">
          <div class="section-heading section-heading--compact">
            <div>
              <p class="eyebrow">The brewing station</p>
              <h2 id="cauldron-title">Cauldron</h2>
            </div>
            <span class="cauldron-counter">${cauldronCount} <i>/</i> ${CAULDRON_CAPACITY}</span>
          </div>
          ${renderCauldronIngredients(state.cauldronIngredients)}
          <div class="capacity-meter" aria-label="Cauldron capacity: ${cauldronCount} of ${CAULDRON_CAPACITY} ingredients">
            <div class="capacity-meter__labels"><span>Cauldron capacity</span><strong>${cauldronCount} / ${CAULDRON_CAPACITY}</strong></div>
            <div class="capacity-meter__track"><span style="width: ${(cauldronCount / CAULDRON_CAPACITY) * 100}%"></span></div>
          </div>
        </aside>
      </div>

      <footer class="game-footer"><span>Keep your notes close.</span><span>Every potion begins with a little curiosity.</span></footer>
    </div>`;
}
