/* Formats a string to x digits */
export function formatDigits(data: number, digits: number): string {
  return data.toLocaleString("en-US", {
    minimumIntegerDigits: digits,
    useGrouping: false,
  });
}
