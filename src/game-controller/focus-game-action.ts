export function focusGameAction(
  applicationRoot: HTMLElement,
  action: string,
): void {
  applicationRoot
    .querySelector<HTMLButtonElement>(`[data-action="${action}"]`)
    ?.focus();
}
