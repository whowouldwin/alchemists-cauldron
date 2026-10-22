import { LEVEL_ONE_INGREDIENTS } from "../../data/ingredients.ts";
import {
  calculateMarkerPosition,
  calculateParameterScale,
  calculateTargetPosition,
  isValueInTargetRange,
  type CauldronParameter,
  type ParameterScale,
  type ParameterTargetRange,
} from "../../logic/parameter-bar-scale.ts";
import { MAX_CAULDRON_INGREDIENTS } from "../../state/game-state.ts";
import { createElement } from "../shared/create-element.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import type { ParameterBarConfig } from "./parameter-bar-config.ts";

const previousMarkerPositions = new Map<CauldronParameter, number>();
const MARKER_ANIMATION_DURATION = 350;

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

function animateMarker(
  marker: HTMLSpanElement,
  startPosition: number,
  endPosition: number,
): void {
  if (
    startPosition !== endPosition &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    marker.animate(
      [{ left: `${startPosition}%` }, { left: `${endPosition}%` }],
      { duration: MARKER_ANIMATION_DURATION, easing: "ease-out" },
    );
  }

  marker.style.left = `${endPosition}%`;
}

export function renderParameterBar(
  parameter: ParameterBarConfig,
  value: number,
  targetRange?: ParameterTargetRange,
): HTMLDivElement {
  const scale = calculateParameterScale(
    LEVEL_ONE_INGREDIENTS,
    parameter.name,
    MAX_CAULDRON_INGREDIENTS,
    parameter.supportsNegativeValues,
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

  marker.style.left = `${startPosition}%`;
  track.append(marker);
  bar.append(label, output, track);
  animateMarker(marker, startPosition, position);
  previousMarkerPositions.set(parameter.name, position);

  return bar;
}
