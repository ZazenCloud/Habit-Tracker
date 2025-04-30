/**
 * Formats a Date object into a YYYY-MM-DD string based on the local timezone.
 * @param date The Date object to format.
 * @returns The date string in YYYY-MM-DD format.
 */
export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 