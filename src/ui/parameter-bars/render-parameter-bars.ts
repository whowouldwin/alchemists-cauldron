import { LEVEL_ONE_INGREDIENTS } from "../../data/ingredients.ts";
import type { CauldronValues } from "../../logic/calculate-cauldron.ts";
import { MAX_CAULDRON_INGREDIENTS } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";

type ParameterName = keyof CauldronValues;

interface ParameterConfig {
  readonly name: ParameterName;
  readonly label: string;
  readonly supportsNegativeValues: boolean;
}

const PARAMETERS: readonly ParameterConfig[] = [
  {
    name: "temperature",
    label: "Temperature",
    supportsNegativeValues: true,
  },
  { name: "density", label: "Density", supportsNegativeValues: true },
  {
    name: "magicPower",
    label: "Magic Power",
    supportsNegativeValues: false,
  },
];

const previousMarkerPositions = new Map<ParameterName, number>();
const MARKER_ANIMATION_DURATION = 350;

function getMaximumMagnitude(name: ParameterName): number {
  const largestIngredientValue = LEVEL_ONE_INGREDIENTS.reduce(
    (largestValue, ingredient) =>
      Math.max(largestValue, Math.abs(ingredient[name])),
    0,
  );

  return largestIngredientValue * MAX_CAULDRON_INGREDIENTS;
}

function renderParameterBar(
  parameter: ParameterConfig,
  values: CauldronValues,
): HTMLElement {
  const value = values[parameter.name];
  const maximum = getMaximumMagnitude(parameter.name);
  const minimum = parameter.supportsNegativeValues ? -maximum : 0;
  const position = ((value - minimum) / (maximum - minimum)) * 100;
  const previousPosition = previousMarkerPositions.get(parameter.name);
  const zeroPosition = parameter.supportsNegativeValues ? 50 : 0;
  const startPosition = previousPosition ?? zeroPosition;
  const headingId = `parameter-${parameter.name}-heading`;
  const bar = createElement("div", "parameter-bar");
  const label = createElement("h3", "parameter-bar__label", parameter.label);
  const output = createElement(
    "output",
    "parameter-bar__value",
    formatIngredientValue(value),
  );
  const track = createElement("div", "parameter-bar__track");
  const marker = createElement("span", "parameter-bar__marker");

  label.id = headingId;
  track.setAttribute("role", "meter");
  track.setAttribute("aria-labelledby", headingId);
  track.setAttribute("aria-valuemin", String(minimum));
  track.setAttribute("aria-valuemax", String(maximum));
  track.setAttribute("aria-valuenow", String(value));
  track.setAttribute("aria-valuetext", formatIngredientValue(value));
  marker.style.left = `${startPosition}%`;
  track.append(marker);
  bar.append(label, output, track);

  if (
    startPosition !== position &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    marker.animate([{ left: `${startPosition}%` }, { left: `${position}%` }], {
      duration: MARKER_ANIMATION_DURATION,
      easing: "ease-out",
    });
  }

  marker.style.left = `${position}%`;
  previousMarkerPositions.set(parameter.name, position);

  return bar;
}

export function renderParameterBars(values: CauldronValues): HTMLElement {
  const panel = createElement("section", "panel parameter-panel");
  const heading = createElement(
    "h2",
    "parameter-panel__heading",
    "Cauldron values",
  );
  const bars = createElement("div", "parameter-bars");

  panel.setAttribute("aria-labelledby", "parameter-panel-heading");
  heading.id = "parameter-panel-heading";
  bars.append(
    ...PARAMETERS.map((parameter) => renderParameterBar(parameter, values)),
  );
  panel.append(heading, bars);

  return panel;
}
