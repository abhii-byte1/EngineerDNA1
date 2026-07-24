export function calculateJournalStreak(entries: { weekOf: Date | string }[], now: Date = new Date()): number {
  if (entries.length === 0) return 0;

  // Extract the start of the week for each entry to deduplicate
  // A simple way is to use the start of the ISO week or just a normalized week string.
  const weekStrings = new Set<string>();

  for (const entry of entries) {
    const d = new Date(entry.weekOf);
    // Normalize to the start of the week (Monday)
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    weekStrings.add(monday.toISOString());
  }

  // Sort descending
  const sortedWeeks = Array.from(weekStrings)
    .map(iso => new Date(iso))
    .sort((a, b) => b.getTime() - a.getTime());

  // Normalize "now" to this week's Monday
  const currentDay = now.getDay();
  const currentDiff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const currentMonday = new Date(new Date(now).setDate(currentDiff));
  currentMonday.setHours(0, 0, 0, 0);

  let streak = 0;
  let expectedMonday = currentMonday;

  // The latest entry could be from this week OR last week to keep the streak alive.
  // If the first entry is older than last week, streak is 0.
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  
  if (sortedWeeks.length > 0) {
    const diffWeeks = Math.round((currentMonday.getTime() - sortedWeeks[0].getTime()) / MS_PER_WEEK);
    if (diffWeeks > 1) {
      return 0; // Streak broken
    }
    
    // Start tracking from the most recent entry's week
    expectedMonday = sortedWeeks[0];
  }

  for (const week of sortedWeeks) {
    const diffWeeks = Math.round((expectedMonday.getTime() - week.getTime()) / MS_PER_WEEK);
    if (diffWeeks === 0) {
      streak++;
      // Expect the previous week next
      expectedMonday = new Date(expectedMonday.getTime() - MS_PER_WEEK);
    } else {
      break;
    }
  }

  return streak;
}
