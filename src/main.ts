import "./styles/game.css";

import { createInitialShelfStock } from "./logic/create-shelf-stock.ts";
import { renderGameMarkup } from "./ui/render-game.ts";

const applicationRoot = document.querySelector<HTMLElement>("#app");

if (applicationRoot === null) {
  throw new Error('Required app root element "#app" was not found.');
}

applicationRoot.innerHTML = renderGameMarkup(createInitialShelfStock());
