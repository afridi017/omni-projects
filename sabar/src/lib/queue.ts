import {
  ORDER_MINUTES,
  NEAR_ALERT_AHEAD,
  SASTA_DISCOUNT_MIN,
  type QueueEntry,
  type RushLevel,
} from "../types";

/** A queue entry is "ahead" of us if it is not delivered/rejected and created before us */
export function isActive(q: QueueEntry): boolean {
  return q.status !== "delivered" && q.status !== "rejected";
}

/** A queue entry currently being worked on (started or ready, not yet delivered) */
export function isInProgress(q: QueueEntry): boolean {
  return q.status === "preparing" || q.status === "ready";
}

export function minutesAgo(iso: string): number {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
  );
}

/**
 * Estimated wait time for a queue entry.
 * Active orders in front (waiting + preparing + ready, excluding delivered/rejected)
 * each take ORDER_MINUTES minutes. The current entry starts immediately when it's
 * the last active token in front of the kitchen.
 */
export function estimateWaitMinutes(
  entry: QueueEntry,
  all: QueueEntry[],
): number {
  const ahead = all
    .filter(
      (q) =>
        q.id !== entry.id &&
        isActive(q) &&
        new Date(q.created_at).getTime() <=
          new Date(entry.created_at).getTime(),
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

  return Math.max(0, ahead.length * ORDER_MINUTES);
}

export function formatEta(mins: number): string {
  if (mins <= 0) return "Abhi likh rahe hain 🔥";
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `~${h}h ${m}m` : `~${h}h`;
}

export function rushLevel(
  activeCount: number,
  inProgressCount: number,
): RushLevel {
  if (inProgressCount >= 4 || activeCount >= 6) return "rush";
  if (inProgressCount >= 2 || activeCount >= 3) return "normal";
  return "khaali";
}

/** Sasta Meter: if your wait > 30 min, you get a 10% discount badge */
export function sastaDiscount(waitMins: number): boolean {
  return waitMins > SASTA_DISCOUNT_MIN;
}

export function discountedTotal(total: number, hasDiscount: boolean): number {
  return hasDiscount ? Math.round(total * 0.9) : total;
}

/** Generates next token, e.g. A101 → A102. Handles rollover A999 → A1000. */
export function nextToken(entries: QueueEntry[]): string {
  const tokens = entries
    .map((q) => q.token_no)
    .filter((t) => /^A\d+$/.test(t))
    .map((t) => parseInt(t.slice(1), 10));
  const max = tokens.length ? Math.max(...tokens) : 100;
  return "A" + (max + 1);
}

/** People currently ahead of you in the queue */
export function peopleAhead(entry: QueueEntry, all: QueueEntry[]): number {
  return all.filter(
    (q) =>
      q.id !== entry.id &&
      isActive(q) &&
      new Date(q.created_at).getTime() < new Date(entry.created_at).getTime(),
  ).length;
}

/** Should we buzz "token near"? True once when inProgress count dropped to threshold */
export function isNear(entry: QueueEntry, all: QueueEntry[]): boolean {
  return (
    peopleAhead(entry, all) <= NEAR_ALERT_AHEAD &&
    isActive(entry) &&
    entry.status === "waiting"
  );
}
