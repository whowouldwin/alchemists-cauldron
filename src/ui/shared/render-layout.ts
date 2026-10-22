import { createElement } from "./create-element.ts";

export function renderBrand(): HTMLElement {
  const brand = createElement("div", "brand");
  const brandMark = createElement("span", "brand-mark", "✦");
  const brandName = createElement("span", undefined, "Alchemist's Cauldron");

  brand.append(brandMark, brandName);

  return brand;
}

export function renderTopbar(tagline = ""): HTMLElement {
  const topbar = createElement("header", "topbar");
  topbar.append(renderBrand());

  if (tagline !== "") {
    topbar.append(createElement("span", "topbar-tag", tagline));
  }

  return topbar;
}

export function renderEmptyPanel(
  id: string,
  title: string,
  eyebrow: string,
  message: string,
): HTMLElement {
  const headingId = `${id}-heading`;
  const panel = createElement("section", "panel empty-panel");
  const panelHeading = createElement("div", "panel-heading");
  const headingContent = createElement("div");
  const eyebrowText = createElement("p", "eyebrow", eyebrow);
  const titleText = createElement("h2", undefined, title);
  const messageText = createElement("p", "empty-panel__text", message);

  panel.setAttribute("aria-labelledby", headingId);
  titleText.id = headingId;
  headingContent.append(eyebrowText, titleText);
  panelHeading.append(headingContent);
  panel.append(panelHeading, messageText);

  return panel;
}
