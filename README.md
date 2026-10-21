# Alchemist's Cauldron

Alchemist's Cauldron is a browser game where the player combines ingredients to match the target ranges of a randomly selected potion recipe. Each ingredient changes the cauldron's temperature, density, and magic power. The player earns points by brewing successful potions before time or lives run out.

## Project stages

- **Precondition 1:** repository, folder structure, and development quality tools.
- **Level 1 — Basic:** ingredient shelf, cauldron, recipes, brewing, timer, pause, and leaderboard.
- **Level 2 — Extended:** difficulty selection and saving or continuing an unfinished game.
- **Level 3 — Full game:** drag and drop, ingredient tooltips, chemical reactions, Pour Out, visual feedback, and keyboard shortcuts.

The game will use TypeScript, HTML, and CSS. Game rules will live separately from DOM rendering. Frameworks, game engines, CSS frameworks, and runtime libraries are out of scope.

## Status

The Level 1 ingredient shelf and empty cauldron view are in progress. The shelf shows the first six ingredients from the full eight-ingredient catalogue, with randomized starting stock for each ingredient.

## Run locally

Install dependencies with `npm ci`, then run the development server with `npm run dev`.
Installing dependencies also enables Git hooks: Commitlint checks commit messages against the
Conventional Commits format used by RS School, and pushes run ESLint and the Prettier check.

Run `npm run lint` to lint project code, `npm run format` to format project files, and
`npm run format:check` to check formatting. Run `npm run typecheck` to check TypeScript types.
Run `npm test` to check the ingredient catalogue and starting stock. Run `npm run build` to create a production build in `dist/`.
Use `npm run preview` to serve the production build locally.

## Requirements

The implementation follows the [Alchemist's Cauldron assignment](https://github.com/rolling-scopes-school/qualifying-stage/tree/main/tasks/game-alchemists-cauldron) and its common requirements.
