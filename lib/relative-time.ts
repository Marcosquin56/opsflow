const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function sqliteTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(`${isoDate.replace(" ", "T")}Z`);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "hace unos segundos";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;

  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}
