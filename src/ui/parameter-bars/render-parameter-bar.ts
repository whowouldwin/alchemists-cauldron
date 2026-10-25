import { getIngredientsForDifficulty } from "../../data/ingredients.ts";
import type { Difficulty } from "../../data/recipes.ts";
import { DIFFICULTY_SETTINGS } from "../../data/difficulty-settings.ts";
import {
  calculateMarkerPosition,
  calculateParameterScale,
  calculateTargetPosition,
  isValueInTargetRange,
  type CauldronParameter,
  type ParameterScale,
  type ParameterTargetRange,
} from "../../logic/parameter-bar-scale.ts";
import { createElement } from "../shared/create-element.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import type { ParameterBarConfig } from "./parameter-bar-config.ts";

const previousMarkerPositions = new Map<CauldronParameter, number>();

function getAccessibleValueText(
  value: number,
  targetRange?: ParameterTargetRange,
): string {
  const formattedValue = formatIngredientValue(value);

  if (targetRange === undefined) {
    return formattedValue;
  }

  const range = `${formatIngredientValue(targetRange.minimum)} to ${formatIngredientValue(targetRange.maximum)}`;
  const status = isValueInTargetRange(value, targetRange)
    ? "within range"
    : "outside range";

  return `${formattedValue}; target ${range}; ${status}`;
}

function renderTargetZone(
  targetRange: ParameterTargetRange,
  scale: ParameterScale,
): HTMLSpanElement {
  const position = calculateTargetPosition(targetRange, scale);
  const targetZone = createElement("span", "parameter-bar__target-zone");

  targetZone.setAttribute("aria-hidden", "true");
  targetZone.style.left = `${position.left}%`;
  targetZone.style.width = `${position.width}%`;

  return targetZone;
}

function renderScaleLabels(
  scale: ParameterScale,
  supportsNegativeValues: boolean,
): HTMLDivElement {
  const labels = createElement("div", "parameter-bar__scale-labels");
  const minimumLabel = supportsNegativeValues
    ? `Min: ${formatIngredientValue(scale.minimum)}`
    : `Min / 0: ${formatIngredientValue(scale.minimum)}`;
  const minimum = createElement(
    "span",
    "parameter-bar__scale-label",
    minimumLabel,
  );
  const maximum = createElement(
    "span",
    "parameter-bar__scale-label",
    `Max: ${formatIngredientValue(scale.maximum)}`,
  );

  labels.setAttribute("aria-hidden", "true");
  labels.append(minimum);

  if (supportsNegativeValues) {
    labels.append(createElement("span", "parameter-bar__scale-label", "0"));
  }

  labels.append(maximum);

  return labels;
}

function transitionMarker(
  marker: HTMLSpanElement,
  startPosition: number,
  endPosition: number,
): void {
  const shouldTransition =
    startPosition !== endPosition &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  marker.style.left = `${shouldTransition ? startPosition : endPosition}%`;

  if (shouldTransition) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (marker.isConnected) {
          marker.style.left = `${endPosition}%`;
        }
      });
    });
  }
}

export function renderParameterBar(
  parameter: ParameterBarConfig,
  value: number,
  targetRange?: ParameterTargetRange,
  difficulty: Difficulty = "medium",
): HTMLDivElement {
  const scale = calculateParameterScale(
    getIngredientsForDifficulty(difficulty),
    parameter.name,
    DIFFICULTY_SETTINGS[difficulty].maxCauldronIngredients,
    parameter.supportsNegativeValues,
    value,
  );
  const position = calculateMarkerPosition(value, scale);
  const isInTargetRange =
    targetRange !== undefined && isValueInTargetRange(value, targetRange);
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
  const trackClassName = parameter.supportsNegativeValues
    ? "parameter-bar__track parameter-bar__track--signed"
    : "parameter-bar__track";
  const track = createElement("div", trackClassName);
  const marker = createElement("span", "parameter-bar__marker");
  const scaleLabels = renderScaleLabels(
    scale,
    parameter.supportsNegativeValues,
  );

  label.id = headingId;
  track.setAttribute("role", "meter");
  track.setAttribute("aria-labelledby", headingId);
  track.setAttribute("aria-valuemin", String(scale.minimum));
  track.setAttribute("aria-valuemax", String(scale.maximum));
  track.setAttribute("aria-valuenow", String(value));
  track.setAttribute(
    "aria-valuetext",
    getAccessibleValueText(value, targetRange),
  );

  if (targetRange !== undefined) {
    track.append(renderTargetZone(targetRange, scale));
  }

  if (isInTargetRange) {
    bar.classList.add("parameter-bar--in-range");
  }

  track.append(marker);
  bar.append(label, output);

  if (targetRange !== undefined) {
    bar.append(
      createElement(
        "span",
        "parameter-bar__target-label",
        `Target: ${formatIngredientValue(targetRange.minimum)} to ${formatIngredientValue(targetRange.maximum)}`,
      ),
    );
  }

  bar.append(track, scaleLabels);
  transitionMarker(marker, startPosition, position);
  previousMarkerPositions.set(parameter.name, position);

  return bar;
}
