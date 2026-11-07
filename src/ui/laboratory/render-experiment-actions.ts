import { createElement } from "../shared/create-element.ts";

export interface ExperimentFeedback {
  readonly text: string;
  readonly isError: boolean;
}

export function renderExperimentActions(
  canSave: boolean,
  isSaved: boolean,
  feedback: ExperimentFeedback | null,
): HTMLElement {
  const actions = createElement("div", "experiment-actions");
  const saveButton = createElement(
    "button",
    "leaderboard-link",
    isSaved ? "Experiment saved" : "Save experiment",
  );
  const hint = createElement(
    "p",
    "experiment-actions__hint",
    feedback?.text ??
      "Save a matching mixture to repeat it later. Explosive mixtures cannot be saved.",
  );

  saveButton.type = "button";
  saveButton.dataset.action = "save-laboratory-experiment";
  saveButton.disabled = !canSave || isSaved;
  hint.id = "experiment-save-hint";
  hint.classList.toggle(
    "experiment-actions__hint--error",
    feedback?.isError === true,
  );
  saveButton.setAttribute("aria-describedby", hint.id);
  actions.append(saveButton, hint);

  return actions;
}
