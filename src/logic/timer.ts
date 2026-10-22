export function getRemainingSeconds(
  endTime: number,
  currentTime: number = Date.now(),
): number {
  return Math.max(0, Math.ceil((endTime - currentTime) / 1000));
}
