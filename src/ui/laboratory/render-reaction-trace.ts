import type { CauldronValues } from "../../logic/calculate-cauldron.ts";
import type { ReactionTrace } from "../../logic/reactions/reaction-trace.ts";
import { createElement } from "../shared/create-element.ts";
import { formatIngredientValue } from "../shared/format-ingredient-value.ts";
import { REACTION_NOTES } from "../shared/reaction-notes.ts";

export function renderReactionTrace(
  trace: ReactionTrace,
  isOpen: boolean,
): HTMLDetailsElement {
  const details = createElement("details", "reaction-trace");
  const count = trace.steps.length;
  const summary = createElement(
    "summary",
    undefined,
    `Calculation · ${count} active ${count === 1 ? "reaction" : "reactions"}`,
  );
  const table = createElement("table");
  const caption = createElement(
    "caption",
    undefined,
    "Conditions use the base sum. Effects follow your selected order. Time and life costs describe what would happen in a game.",
  );
  const head = createElement("thead");
  const header = createElement("tr");
  const body = createElement("tbody");
  const tableWrap = createElement("div", "reaction-trace__table-wrap");

  details.id = "laboratory-calculation";
  details.open = isOpen;
  for (const label of ["Step", "Temperature", "Density", "Magic Power"]) {
    const cell = createElement("th", undefined, label);
    cell.scope = "col";
    header.append(cell);
  }
  head.append(header);
  body.append(renderValuesRow("Base sum", trace.baseValues));

  for (const { reaction, before, after } of trace.steps) {
    const notes = REACTION_NOTES[reaction.id];
    body.append(renderValuesRow(reaction.name, after, before, notes?.effect));
  }

  body.append(renderValuesRow("Final values", trace.values));
  table.append(caption, head, body);
  tableWrap.tabIndex = 0;
  tableWrap.setAttribute("role", "region");
  tableWrap.setAttribute("aria-label", "Reaction calculation table");
  tableWrap.append(table);
  details.append(summary, tableWrap);

  return details;
}

function renderValuesRow(
  label: string,
  values: CauldronValues,
  previous?: CauldronValues,
  effect?: string,
): HTMLTableRowElement {
  const row = createElement("tr");
  const heading = createElement("th", undefined, label);
  heading.scope = "row";
  if (effect !== undefined) {
    heading.append(createElement("span", "reaction-trace__effect", effect));
  }
  row.append(heading);

  for (const key of ["temperature", "density", "magicPower"] as const) {
    const value = formatIngredientValue(values[key]);
    const previousValue = previous?.[key];
    const text =
      previousValue !== undefined && previousValue !== values[key]
        ? `${formatIngredientValue(previousValue)} → ${value}`
        : value;
    row.append(createElement("td", undefined, text));
  }

  return row;
}
