# Creative Extension: Discovery Journal and Practice Laboratory

The extension helps players understand recipes and reactions. The journal records discoveries from regular games, while the laboratory provides a place to try mixtures, inspect calculations, and revisit successful experiments.

## Features

| Feature            | Behavior                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Discovery journal  | Records successfully brewed recipes and activated reactions. Repeated discoveries do not create duplicates.                                                          |
| Recipe selection   | All 20 recipes are available. Changing the recipe clears the mixture and selected reactions.                                                                         |
| Practice mode      | No timer or lives, and portions never run out. Difficulty limits still apply: 4/6/8 ingredient types and 4/4/5 mixture slots for Easy/Medium/Hard.                   |
| Reaction selection | Easy has no reactions; Medium allows up to 2; Hard allows up to 3. Each difficulty uses eligible reactions from the shared catalogue.                                |
| Calculation        | `Calculation` shows the base sum, each activated reaction's effect, and the final values. Conditions use the base mixture; effects follow the selected order.        |
| Saved experiments  | Only successful mixtures without an explosion can be saved. Entries can be opened or removed. Ingredient order, repeated portions, and reaction order are preserved. |

Laboratory targets already include the difficulty tolerance: Easy ±12, Medium ±8, Hard ±5. The journal shows each recipe's base ranges with an explanation of the extra tolerance.

When a mixture explodes, the laboratory keeps it for inspection and displays a warning. In a regular game, the same reaction empties the cauldron and costs a life. Practice does not change scores, ingredient stock, the saved game, or journal discoveries.

## Code structure

| Responsibility                   | Where to look                                                                                                                                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Catalogues and difficulty limits | [`src/data`](../src/data) and [`reaction-definitions.ts`](../src/logic/reactions/reaction-definitions.ts)                                                                                                                                        |
| Practice state changes           | [`laboratory-state.ts`](../src/laboratory/laboratory-state.ts), [`laboratory-reactions.ts`](../src/laboratory/laboratory-reactions.ts)                                                                                                           |
| Shared reaction calculation      | [`reaction-trace.ts`](../src/logic/reactions/reaction-trace.ts); regular games use it through [`reaction-engine.ts`](../src/logic/reactions/reaction-engine.ts)                                                                                  |
| Laboratory result evaluation     | [`laboratory-result.ts`](../src/laboratory/laboratory-result.ts) reuses the game's recipe check                                                                                                                                                  |
| Experiment snapshots             | [`saved-experiment.ts`](../src/laboratory/saved-experiment.ts) stores IDs and restores state through the current rules                                                                                                                           |
| Data loading and saving          | [`src/storage`](../src/storage); JSON structure is validated when loading                                                                                                                                                                        |
| Screen state and actions         | [`LaboratoryController`](../src/game-controller/laboratory-controller.ts), [`LaboratoryExperimentsController`](../src/game-controller/laboratory-experiments-controller.ts), [`ExperimentLibrary`](../src/game-controller/experiment-library.ts) |
| Rendering and events             | [`src/ui/laboratory`](../src/ui/laboratory) and [`src/ui/journal`](../src/ui/journal), using native DOM APIs                                                                                                                                     |

Calculations and state transformations are pure functions without DOM or `localStorage` access. Classes manage screen and library state, connecting actions to calculations, persistence, and rendering. No new dependencies were added.

## Persistence and limitations

- The journal uses `alchemists-cauldron.journal`; experiments use `alchemists-cauldron.experiments`. Both document formats have `version: 1`.
- An experiment stores only recipe, ingredient, and reaction IDs. Opening it resolves data from the current catalogues and recalculates the result.
- Duplicate experiments are identified by the recipe and the two ordered ID lists. A different order is treated as a separate entry.
- If the experiment library is malformed or has an unsupported version, the application reports an error and does not overwrite it. `Retry loading` tries reading again; it does not automatically repair malformed JSON.
- If saving an experiment fails, the current mixture stays on screen. Unsaved journal discoveries remain in memory until the page closes; the next attempt to record a discovery retries saving.
- Loading the journal filters out unknown IDs and duplicates. An invalid document loads as an empty journal, without writing to storage during the read.
- Data belongs to the browser and site origin. The local development site and GitHub Pages have separate storage. There is no synchronization between devices or automatic saving of unfinished practice sessions.
- The library is read again before it is changed. This preserves sequential updates from different instances, but does not provide transactional synchronization between tabs.

## Logic verification

Verified on **8 November 2026** for implementation commit `87b2ddf`, using Node **22.23.3**. All **127 tests** passed, with none skipped. Type checking, ESLint, and the production build also passed.

| Requirement or risk                                                                                                             | Evidence                                                                       | Result                                 |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| Discoveries are recorded once and survive reloading                                                                             | `discovery-journal.test.ts`, `discovery-journal-storage.test.ts`               | Passed                                 |
| The brewed recipe is recorded, including the last successful brew; a reaction is recorded even when its explosion ends the game | `game-discoveries.test.ts`                                                     | Passed                                 |
| Difficulty limits, repeated portions, clearing, and recipe changes                                                              | `laboratory-state.test.ts`, `laboratory-reactions.test.ts`                     | Passed                                 |
| Effect order, conditions checked against the base mixture, and explosions                                                       | `reaction-trace.test.ts`, `laboratory-reactions.test.ts`                       | Passed                                 |
| Restoring mixtures, duplicates, invalid data, and write failures                                                                | `saved-experiment.test.ts`, `saved-experiments-storage.test.ts`                | Passed                                 |
| Regular game regressions                                                                                                        | Existing brewing, timer, game-over, save, and reaction tests in the full suite | Passed within the scope of those tests |
| Actual clicks, focus, rendering, and page reloads                                                                               | Browser verification required                                                  | Pending                                |

Additional checks through the pure functions covered seven examples from the demonstration guide and a valid, saveable practice mixture for each of the 20 recipes with no reactions selected. These checks verify calculations and restoration, not visual behavior.

Commands to repeat the automated checks:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

## Browser acceptance check

Automated access to the in-app browser was unavailable during verification (`The browser access host is unavailable`). The following items have not yet been marked as complete:

- [ ] Open Journal, switch between Recipes and Reactions, inspect the empty state or existing discoveries, and go back.
- [ ] Follow the Moon Mist and Acid Spark examples in the [demonstration guide](creative-extension-demo.md): values, target labels, and the save button state should match the result.
- [ ] Fill the mixture to 4/4 or 5/5: ingredient buttons become unavailable. `Clear mixture` enables them again and preserves selected reactions; changing the recipe clears both the mixture and reactions.
- [ ] Save Ember Soup, reload the page, reopen the laboratory, and restore the entry. Check reaction order, duplicate prevention, and removal of the saved entry without clearing the current mixture.
- [ ] Follow the Volatile Mix example: a warning appears, the mixture remains available for inspection, and saving is disabled.
- [ ] Navigate the laboratory using Tab, Shift+Tab, Enter/Space, and arrow keys in selects. Focus remains visible after adding, clearing, saving, and opening an entry. An expanded Calculation table stays open after recalculation.
- [ ] Check a 1366×768 desktop viewport and a narrow window around 390 px wide: text and buttons remain accessible, with no horizontal page scrolling. The calculation table may scroll inside its own container.
- [ ] In a regular game, check ingredient addition, Brew, Pause/Resume, and game over. After a successful brew, open the journal and confirm that it records the brewed recipe. The discovery remains after reloading.
- [ ] Save a regular game by reloading the page, practice in the laboratory from the menu, then choose Continue Game. The game opens paused with its previous score, stock, and mixture; practice has not added discoveries.

## Publication status

The extension was published on **8 November 2026**: [play the game](https://whowouldwin.github.io/alchemists-cauldron/) or [view the source branch](https://github.com/whowouldwin/alchemists-cauldron/tree/feature/alchemist-journal). The [GitHub Pages deployment](https://github.com/whowouldwin/alchemists-cauldron/actions/runs/42490263057) succeeded, and the public HTML, JavaScript, and CSS matched the production build from source commit `7d71d94`.

Browser acceptance and a demonstration rehearsal remain. Any fixes to the interface or game rules should be reviewed locally before publication.
