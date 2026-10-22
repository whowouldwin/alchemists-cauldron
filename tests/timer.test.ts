import assert from "node:assert/strict";
import test from "node:test";
import { getRemainingSeconds } from "../src/logic/timer.ts";
import { formatTimeRemaining } from "../src/ui/shared/format-time-remaining.ts";

test("calculates remaining seconds from an end timestamp", () => {
  assert.equal(getRemainingSeconds(10_000, 0), 10);
  assert.equal(getRemainingSeconds(10_000, 1_001), 9);
  assert.equal(getRemainingSeconds(10_000, 9_000), 1);
});

test("keeps one second until the end timestamp is reached", () => {
  assert.equal(getRemainingSeconds(10_000, 9_999), 1);
});

test("does not return a negative remaining time", () => {
  assert.equal(getRemainingSeconds(10_000, 10_000), 0);
  assert.equal(getRemainingSeconds(10_000, 12_000), 0);
});

test("formats time as MM:SS", () => {
  assert.equal(formatTimeRemaining(0), "00:00");
  assert.equal(formatTimeRemaining(9), "00:09");
  assert.equal(formatTimeRemaining(150), "02:30");
});

test("clamps negative time to zero when formatting", () => {
  assert.equal(formatTimeRemaining(-1), "00:00");
});
