const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

// Users may type Bangla digits. The API needs ASCII digits.
export function toAsciiDigits(value: string): string {
  return value.replace(/[০-৯]/g, (digit) =>
    String(BANGLA_DIGITS.indexOf(digit)),
  );
}

const numberFormat = new Intl.NumberFormat("bn-BD");
const dateFormat = new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium" });
const dateTimeFormat = new Intl.DateTimeFormat("bn-BD", {
  dateStyle: "medium",
  timeStyle: "short",
});
const relativeFormat = new Intl.RelativeTimeFormat("bn-BD", { numeric: "auto" });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatMoney(value: number): string {
  return `৳${numberFormat.format(value)}`;
}

export function formatDate(value: string | Date, withTime = false): string {
  const date = new Date(value);
  return withTime ? dateTimeFormat.format(date) : dateFormat.format(date);
}

export function formatRelative(value: string | Date, now = new Date()): string {
  const diffSeconds = Math.round(
    (new Date(value).getTime() - now.getTime()) / 1000,
  );
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return relativeFormat.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return relativeFormat.format(diffSeconds, "second");
}