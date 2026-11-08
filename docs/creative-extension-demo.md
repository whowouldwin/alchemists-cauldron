# Creative Extension Demonstration

This plan takes approximately **8 minutes**. Walk through the steps and explain the calculations in your own words. Rehearse with `npm run dev` or use the [published game](https://whowouldwin.github.io/alchemists-cauldron/).

## Presentation outline

| Time      | What to show and explain                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:40 | Problem: learning reactions under a timer and remembering successful mixtures is difficult. Solution: a discovery journal and a separate practice laboratory. |
| 0:40–1:40 | Brew successfully on Easy, show the recipe in the journal, and introduce the Recipes/Reactions categories.                                                    |
| 1:40–2:40 | Practice in Lab: choose a recipe, build a mixture, explain targets with tolerance, and show that there is no timer or limited stock.                          |
| 2:40–3:50 | Acid Spark and Bubbling: base values, the change in Magic Power, the mixture no longer matching the target, and recalculation after removing the reaction.    |
| 3:50–5:00 | Save Ember Soup, reload the page, and open the experiment from the library.                                                                                   |
| 5:00–5:40 | Volatile Mix: an explosion warning and a mixture retained for inspection.                                                                                     |
| 5:40–7:30 | Show the shared reaction calculation, the separation of rules, controllers, and DOM rendering, the storage format, and a few meaningful tests.                |
| 7:30–8:00 | Summarize verified features and limitations: data is local to the browser, and unfinished practice sessions are not saved automatically.                      |

## 1. Make a discovery in a regular game

Choose **Settings → Easy**, then **Start Game**. The recipe is selected randomly; use the corresponding row:

| Recipe      | Ingredients                               |
| ----------- | ----------------------------------------- |
| Moon Mist   | Dragon Tears + Fairy Dust                 |
| Root Bloom  | Fairy Dust + Mandrake Root                |
| Frost Steam | Dragon Tears + Frost Lotus                |
| Quiet Swirl | Frost Lotus + Mandrake Root               |
| Bright Dew  | Dragon Tears + Fairy Dust + Mandrake Root |
| Snow Dust   | Fairy Dust + Frost Lotus + Mandrake Root  |

Select **Brew**. After a successful brew, use **Pause → Exit to Menu** and open **Journal**. The brewed recipe appears in Recipes; the count increases if the recipe has not been discovered before. Exiting to the menu ends this demonstration game, while discoveries are preserved.

To show a populated Reactions category, activate a reaction in a regular Medium or Hard game beforehand and check that it appears in the journal. Practice does not unlock discoveries, and reaction selection in regular games is random, so prepare this example during rehearsal.

## 2. Build a base mixture

Open **Practice in Lab** and select **Moon Mist**. Add **Dragon Tears**, then **Fairy Dust**.

| Parameter   | Calculation | Result | Accepted range with Easy ±12 |
| ----------- | ----------- | ------ | ---------------------------- |
| Temperature | 25 + 12     | 37     | 20…54                        |
| Density     | 8 + 9       | 17     | 0…34                         |
| Magic Power | 10 + 12     | 22     | 5…39                         |

The mixture matches. Open `Calculation`: with no reactions selected, the base sum equals the final values. Explain that portions are unlimited, but this mixture still has a maximum of four ingredient slots.

## 3. Show how a reaction changes the result

Select **Acid Spark**; the previous mixture will be cleared. Add **Fairy Dust + Caustic Acid**.

- Before the reaction: Temperature **22**, Density **23**, Magic Power **34**. The mixture matches.
- Select **Bubbling**. Its condition is met, so Magic Power becomes **34 × 1.5 = 51**.
- The Magic Power range with Medium ±8 is **21…47**. The mixture no longer matches, and saving is disabled.
- Open **Calculation** to show the base sum and the change from `34 → 51`.
- Remove Bubbling. Magic Power returns to **34**, and the mixture matches again.

Explain that activating Bubbling in a regular game also costs 10 seconds. Practice displays this cost in the description; it has no timer.

## 4. Save and repeat an experiment

1. Select **Ember Soup** from the Hard group.
2. Add **Phoenix Feather → Fairy Dust → Toad Slime**.
3. Select **Magma Flux**, then **Pressure Spike**.
4. The base values are **67 / 29 / 42**. Magma Flux activates at Temperature ≥60, producing **67 / 26.1 / 50.4**. Pressure Spike remains inactive because the base Density is below 70.
5. The mixture matches with Hard ±5: the targets are **57…77 / 19…39 / 32…52**. Select **Save experiment**.
6. Reload the page, then reopen **Practice in Lab → Saved experiments → Open** for Ember Soup.
7. Check the recipe, all three portions, and the **Magma Flux → Pressure Spike** order. The result is recalculated. The **Experiment saved** button is disabled to prevent saving the same entry again.

If useful, show **Remove**: the saved entry disappears from the library while the current mixture remains. Keep one prepared experiment available for the presentation.

## 5. Inspect an explosive mixture

Select **Void Flame**, add **Phoenix Feather + Essence of the Void + Toad Slime**, then select **Volatile Mix**.

The values remain **35 / 10 / 70**, but the result is not successful because the reaction causes an explosion. The laboratory keeps the mixture for inspection, displays a warning, and disables saving. Remove the reaction: the same mixture matches again.

## Example for a question about reaction order

Select any Hard recipe, such as Ember Soup. Add **Dragon Tears twice** and **Toad Slime twice**. The base sum is **60 / 76 / 20**.

| Order                       | Density changes                 | Final T / D / M |
| --------------------------- | ------------------------------- | --------------- |
| Magma Flux → Pressure Spike | 76 × 0.9 = 68.4; then set to 70 | 60 / 70 / 26.4  |
| Pressure Spike → Magma Flux | Set to 70; then 70 × 0.9 = 63   | 60 / 63 / 26.4  |

To change the order, remove Magma Flux and add it again. Pressure Spike activates in both cases because its condition uses the base Density of **76**. This example demonstrates calculation order; it does not match Ember Soup.

## Technical discussion

**Separate laboratory state.** A regular game has stock, a timer, lives, and a score. The laboratory has a selected recipe, ingredients, and reactions. Separate state allows both modes to share calculations while keeping practice independent.

**Pure functions and classes.** Rules take data and return results without accessing the page. Controllers manage the current screen state and connect actions to rendering. For example, [`LaboratoryController`](../src/game-controller/laboratory-controller.ts) calls functions from `src/laboratory`.

**Shared calculations.** Both modes use [`traceCauldronReactions()`](../src/logic/reactions/reaction-trace.ts) and the game's recipe check. Reaction conditions use the base sum, while effects transform the result in sequence. Tests cover reordered reactions and thresholds crossed by earlier effects.

**Storing IDs instead of calculated values.** IDs resolve to canonical ingredients and reactions. Values are recalculated, so stored JSON does not become a second source of game rules. Loading validates the format, the allowed mixture, and its success.

**Runtime JSON validation.** TypeScript checks code during development. `localStorage` data arrives at runtime and may have a different version or invalid structure. Loading accepts `unknown` and validates its fields.

**Storage failures.** An experiment is not reported as saved when a write fails. The mixture remains on screen, and the user sees a message. A malformed experiment library is not overwritten. Unsaved journal discoveries remain in memory; a successful brew or reaction activation triggers another save attempt.

**Meaningful tests.** Show [`reaction-trace.test.ts`](../tests/reaction-trace.test.ts), [`saved-experiments-storage.test.ts`](../tests/saved-experiments-storage.test.ts), and [`game-discoveries.test.ts`](../tests/game-discoveries.test.ts): effect order, write failures, and recording a discovery when an explosion ends the game. Passing logic tests does not replace checking clicks, focus, and rendering in a browser.

## Assessment criteria

The [assignment](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/creative-extension/mini-games.md) requires a 5–10 minute presentation and technical questions. The [assessment checklist](https://github.com/rolling-scopes-school/qualifying-stage/blob/main/tasks/creative-extension/mentors-check.md) awards up to 100 points for complexity, 50 for understanding and justification, 50 for presentation, and 50 for stability and code quality.

To demonstrate complexity, show how the journal, simulation, calculation trace, and persistence work together. To demonstrate understanding, explain reaction order and restoration by ID. Rehearse the presentation with a timer. To verify stability, complete the [browser acceptance check](creative-extension.md#browser-acceptance-check). The curator assigns the final score; implemented features alone do not guarantee full marks.
