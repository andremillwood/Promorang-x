/** Weekly settlement lands Friday morning. Used as the merchant emotional payoff, not a fake APY. */
export function nextWeeklyPayoutAt(from: Date = new Date()): Date {
  const next = new Date(from);
  const day = next.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  next.setDate(next.getDate() + daysUntilFriday);
  next.setHours(9, 0, 0, 0);
  return next;
}

export function formatPayoutDate(value?: string | Date | null): string {
  if (!value) return "Friday";
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(value instanceof Date ? value : new Date(value));
  } catch {
    return "Friday";
  }
}
