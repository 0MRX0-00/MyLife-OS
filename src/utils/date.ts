import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  addDays,
  isToday,
  isBefore,
  isAfter,
  differenceInDays,
} from "date-fns";

/**
 * Get today's date string in YYYY-MM-DD format, in the user's timezone.
 */
export function getTodayString(timezone: string = "UTC"): string {
  const now = new Date();
  return formatDateInTimezone(now, timezone);
}

/**
 * Format a Date object to YYYY-MM-DD in a given timezone.
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string = "UTC"
): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    // Fallback if timezone is invalid
    return format(date, "yyyy-MM-dd");
  }
}

/**
 * Parse YYYY-MM-DD string to a Date (at midnight UTC).
 */
export function parseDateString(dateStr: string): Date {
  return parseISO(dateStr);
}

/**
 * Get a range of dates as YYYY-MM-DD strings.
 */
export function getDateRange(
  startDate: string,
  endDate: string
): string[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const dates: string[] = [];
  let current = start;

  while (!isAfter(current, end)) {
    dates.push(format(current, "yyyy-MM-dd"));
    current = addDays(current, 1);
  }
  return dates;
}

/**
 * Get the last N days as YYYY-MM-DD strings.
 */
export function getLastNDays(n: number, timezone: string = "UTC"): string[] {
  const today = getTodayString(timezone);
  const start = format(subDays(parseISO(today), n - 1), "yyyy-MM-dd");
  return getDateRange(start, today);
}

/**
 * Format a date for display.
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isToday(addDays(date, -1))) return "Tomorrow";
  if (isToday(addDays(date, 1))) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

/**
 * Format a date for short display (e.g., "Mon, Sep 5").
 */
export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), "EEE, MMM d");
}

/**
 * Check if a date string is before today.
 */
export function isOverdue(dateStr: string, timezone: string = "UTC"): boolean {
  const today = getTodayString(timezone);
  return isBefore(parseISO(dateStr), parseISO(today));
}

/**
 * Get week boundaries for a date.
 */
export function getWeekBounds(dateStr: string) {
  const date = parseISO(dateStr);
  return {
    start: format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    end: format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
  };
}

/**
 * Get month boundaries for a date.
 */
export function getMonthBounds(dateStr: string) {
  const date = parseISO(dateStr);
  return {
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd"),
  };
}

// Re-export commonly used date-fns functions
export {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  isToday,
  isBefore,
  isAfter,
  differenceInDays,
};
