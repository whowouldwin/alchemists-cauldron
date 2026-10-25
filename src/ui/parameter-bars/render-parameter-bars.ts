import type { CauldronValues } from "../../logic/calculate-cauldron.ts";
import type { Difficulty } from "../../data/recipes.ts";
import { createElement } from "../shared/create-element.ts";
import {
  PARAMETER_BAR_CONFIGS,
  type CauldronTargetRanges,
} from "./parameter-bar-config.ts";
import { renderParameterBar } from "./render-parameter-bar.ts";

export type { CauldronTargetRanges } from "./parameter-bar-config.ts";

export function renderParameterBars(
  values: CauldronValues,
  targetRanges?: CauldronTargetRanges,
  difficulty: Difficulty = "medium",
): HTMLElement {
  const panel = createElement("section", "parameter-panel");
  const heading = createElement(
    "h2",
    "parameter-panel__heading",
    "Cauldron values",
  );
  const bars = createElement("div", "parameter-bars");

  panel.setAttribute("aria-labelledby", "parameter-panel-heading");
  heading.id = "parameter-panel-heading";
  bars.append(
    ...PARAMETER_BAR_CONFIGS.map((parameter) =>
      renderParameterBar(
        parameter,
        values[parameter.name],
        targetRanges?.[parameter.name],
        difficulty,
      ),
    ),
  );
  panel.append(heading, bars);

  return panel;
}
