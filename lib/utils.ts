/**
 * Utility functions for KHOCAN BETTA FARM
 */

/**
 * Formats a number to Indonesian Rupiah currency format.
 * Example: 150000 -> "Rp 150.000"
 */
export function formatIDR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into readable Indonesian format.
 * Example: "2026-11-05" -> "Kamis, 5 November 2026"
 */
export function formatIndoDate(dateStr: string | null | undefined, options?: { withDay?: boolean; shortMonth?: boolean }): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('id-ID', {
      weekday: options?.withDay ? 'long' : undefined,
      day: 'numeric',
      month: options?.shortMonth ? 'short' : 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date range for auction sessions.
 * Example: "05 Nov - 06 Nov 2026"
 */
export function formatSessionPeriod(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(end);
    const year = end.getFullYear();

    return `${startDay} - ${endDay} ${month} ${year}`;
  } catch {
    return `${startDate} - ${endDate}`;
  }
}

/**
 * Converts a winner name into a safe, clean URL slug.
 * Example: "IDRIS YU" -> "idris-yu"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Standard CSS classnames combiner
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
