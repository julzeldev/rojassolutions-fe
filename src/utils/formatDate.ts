import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/es'; // Example for Spanish, add more as needed

dayjs.extend(localizedFormat);

/**
 * Formats a date into a human-readable string.
 *
 * @param input - the date to format, either a Date object, ISO string, or timestamp.
 * @param locale - optional BCP 47 locale string (default 'en-US').
 * @param options - optional Intl.DateTimeFormat options.
 * @returns formatted date string.
 *
 * @throws {Error} if the input cannot be parsed into a valid Date.
 */
export function formatDate(
  input: Date | string | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  let date = dayjs(input);
  if (!date.isValid()) {
    throw new Error('Invalid date input');
  }
  // Set locale if supported by dayjs
  try {
    date = date.locale(locale.toLowerCase());
  } catch {
    // Ignore locale errors; fallback to default
  }

  if (options) {
    // Use Intl.DateTimeFormat if options are provided
    return new Intl.DateTimeFormat(locale, options).format(date.toDate());
  }
  // Default to dayjs localized format
  return date.format('LL');
}
