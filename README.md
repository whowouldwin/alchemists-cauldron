# Alchemist's Cauldron

Alchemist's Cauldron is a browser game where the player combines ingredients to match the target ranges of a randomly selected potion recipe. Each ingredient changes the cauldron's temperature, density, and magic power. The player earns points by brewing successful potions before time or lives run out.

## Project stages

- **Precondition 1:** repository, folder structure, TypeScript, ESLint, Prettier, and Git hooks.
- **Level 1 — Basic:** ingredient shelf, cauldron, recipes, brewing, timer, pause, and leaderboard.
- **Level 2 — Extended:** difficulty selection and automatic save / continue for unfinished games.
- **Level 3 — Full game:** drag and drop, ingredient tooltips, chemical reactions, Pour Out, visual feedback, and keyboard shortcuts.

The game uses TypeScript, native DOM APIs, HTML, and SCSS. Game rules live separately from DOM rendering. It has no runtime dependencies or UI framework.

## Status

All three levels are implemented. The final Story 3 pull request is open for RS School Cross-Check.

## How to play

Choose a difficulty and start a game. Select ingredients from the shelf by clicking or dragging them into the cauldron. Each ingredient changes the cauldron's temperature, density, and magic power; match those values to the current recipe and brew before time or lives run out. A successful brew earns points and selects another recipe. A failed brew spends the ingredients and a life. In Level 3, use **Pour Out** to clear the cauldron without brewing.

The game also provides Help and Settings panels, a Top-10 leaderboard, and a Continue Game option for a valid saved run. A continued game opens paused.

### Keyboard controls

- `1`–`8`: add the corresponding available ingredient.
- `B`: brew the current mixture.
- `O`: pour out the cauldron.
- `P`: pause the active game.
- On the pause screen, use the focusable **Resume** button with the browser's standard Enter or Space behavior.

Game shortcuts work only during active play and are ignored while typing in text fields.

## Run locally

Install dependencies with `npm ci`, then run the development server with `npm run dev`.
Installing dependencies also enables Git hooks: Commitlint checks commit messages against the
Conventional Commits format used by RS School, and pushes run ESLint and the Prettier check.

Run `npm run lint` to lint project code, `npm run format` to format project files, and
`npm run format:check` to check formatting. Run `npm run typecheck` to check TypeScript types.
Run `npm run build` to create a production build in `dist/`.
Use `npm run preview` to serve the production build locally.

## Requirements

The implementation follows the [Alchemist's Cauldron assignment](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron) and its common requirements.
