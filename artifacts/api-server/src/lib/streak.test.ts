import assert from "node:assert";
import { calculateJournalStreak } from "./streak.js";

function runTests() {
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  // Test 1
  assert.strictEqual(calculateJournalStreak([], new Date()), 0, "returns 0 for no entries");

  // Test 2
  let now = new Date("2023-10-18T12:00:00Z"); // Wednesday
  let entries: { weekOf: Date | string }[] = [{ weekOf: new Date("2023-10-17T12:00:00Z") }]; // Tuesday
  assert.strictEqual(calculateJournalStreak(entries, now), 1, "returns 1 for an entry this week");

  // Test 3
  entries = [{ weekOf: new Date("2023-10-10T12:00:00Z") }]; // Last Tuesday
  assert.strictEqual(calculateJournalStreak(entries, now), 1, "returns 1 for an entry last week (streak alive)");

  // Test 4
  entries = [{ weekOf: new Date("2023-10-03T12:00:00Z") }]; // 2 weeks ago
  assert.strictEqual(calculateJournalStreak(entries, now), 0, "returns 0 for an entry two weeks ago (streak broken)");

  // Test 5
  entries = [
    { weekOf: new Date("2023-10-17T12:00:00Z") }, // This week
    { weekOf: new Date("2023-10-10T12:00:00Z") }, // Last week
    { weekOf: new Date("2023-10-03T12:00:00Z") }, // 2 weeks ago
  ];
  assert.strictEqual(calculateJournalStreak(entries, now), 3, "counts multiple consecutive weeks");

  // Test 6
  entries = [
    { weekOf: new Date("2023-10-17T12:00:00Z") }, // This week Tue
    { weekOf: new Date("2023-10-16T12:00:00Z") }, // This week Mon
    { weekOf: new Date("2023-10-10T12:00:00Z") }, // Last week Tue
  ];
  assert.strictEqual(calculateJournalStreak(entries, now), 2, "deduplicates multiple entries in the same week");

  // Test 7
  entries = [
    { weekOf: new Date("2023-10-17T12:00:00Z") }, // This week
    { weekOf: new Date("2023-10-10T12:00:00Z") }, // Last week
    { weekOf: new Date("2023-09-26T12:00:00Z") }, // 3 weeks ago (gap)
  ];
  assert.strictEqual(calculateJournalStreak(entries, now), 2, "stops counting when streak breaks");

  console.log("All streak tests passed!");
}

runTests();
