import "./styles/game.scss";
import { initializeGameController } from "./game-controller.ts";
import { createGameAnnouncements } from "./ui/game-announcements.ts";

const announcements = createGameAnnouncements();
const applicationRoot = document.createElement("div");
applicationRoot.id = "app";

document.body.append(announcements.region, applicationRoot);
initializeGameController(applicationRoot, announcements);
