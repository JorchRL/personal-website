// Dates as the pages show them. Posts store an ISO date or date-time; they
// are read in UTC so a post never moves a day with the reader's time zone.

const long = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const short = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });

/** "4 March 2022" */
export function formatDate(iso: string): string {
  return long.format(new Date(iso));
}

/** "04 Mar" */
export function formatDayMonth(iso: string): string {
  return short.format(new Date(iso));
}

export function yearOf(iso: string): number {
  return new Date(iso).getUTCFullYear();
}

/** "2023-01-20" */
export function isoDay(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
