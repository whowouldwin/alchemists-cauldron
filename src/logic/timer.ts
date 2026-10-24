export const TIMER_WARNING_THRESHOLD_SECONDS = 15;
export const MILLISECONDS_PER_SECOND = 1000;

export function getRemainingSeconds(
  endTime: number,
  currentTime: number = Date.now(),
): number {
  return Math.max(
    0,
    Math.ceil((endTime - currentTime) / MILLISECONDS_PER_SECOND),
  );
}

export function isTimerUrgent(remainingSeconds: number): boolean {
  return remainingSeconds < TIMER_WARNING_THRESHOLD_SECONDS;
}
