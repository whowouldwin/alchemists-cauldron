export const TIMER_WARNING_THRESHOLD_SECONDS = 15;

export function getRemainingSeconds(
  endTime: number,
  currentTime: number = Date.now(),
): number {
  return Math.max(0, Math.ceil((endTime - currentTime) / 1000));
}

export function isTimerUrgent(remainingSeconds: number): boolean {
  return remainingSeconds < TIMER_WARNING_THRESHOLD_SECONDS;
}
