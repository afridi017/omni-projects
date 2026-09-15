export function formatDuration(t: number): string {
  const diff = Date.now() - t;
  if (diff < 0) return "0m";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return `${hours}h ${rest ? `${rest}m` : ""}`.trim();
}

export function formatClock(t: number): string {
  return new Date(t).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
