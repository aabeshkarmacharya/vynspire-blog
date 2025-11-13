// Deterministic UTC date formatting to avoid SSR/CSR hydration mismatches.
// Input: ISO 8601 string (e.g., from backend Post.created_at)
// Output: "YYYY-MM-DD HH:MM UTC"
export function formatDateUTC(iso: string | number | Date | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const Y = d.getUTCFullYear();
    const M = pad(d.getUTCMonth() + 1);
    const D = pad(d.getUTCDate());
    const h = pad(d.getUTCHours());
    const m = pad(d.getUTCMinutes());
    return `${Y}-${M}-${D} ${h}:${m} UTC`;
  } catch {
    return '';
  }
}

// Format in the user's local timezone using Intl for consistency across browsers.
// Example output: "Jan 5, 2025, 9:42 AM"
export function formatDateLocal(iso: string | number | Date | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const fmt = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return fmt.format(d);
  } catch {
    return '';
  }
}
