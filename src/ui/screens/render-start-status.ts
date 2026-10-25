import { createElement } from "../shared/create-element.ts";

const START_STATUS = [
  { label: "Ingredient shelf", value: "Empty" },
  { label: "Cauldron", value: "Empty" },
  { label: "Score", value: "0" },
  { label: "Time", value: "0:00" },
] as const;

export function renderStartStatus(): HTMLElement {
  const status = createElement("dl", "start-status");

  status.setAttribute("aria-label", "Game status before starting");

  for (const { label, value } of START_STATUS) {
    const item = createElement("div", "start-status__item");
    const term = createElement("dt", "start-status__label", label);
    const description = createElement("dd", "start-status__value", value);

    item.append(term, description);
    status.append(item);
  }

  return status;
}
