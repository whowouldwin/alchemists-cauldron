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

export function renderLeaderboardButton(): HTMLButtonElement {
  const button = createElement("button", "leaderboard-link", "Leaderboard");

  button.type = "button";
  button.dataset.action = "open-leaderboard";

  return button;
}
