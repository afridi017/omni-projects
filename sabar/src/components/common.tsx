import { motion, AnimatePresence } from "framer-motion";
import { RUSH_META, type RushLevel } from "../types";

export function RushMeter({ level }: { level: RushLevel }) {
  const meta = RUSH_META[level];
  const pct = level === "rush" ? 92 : level === "normal" ? 55 : 18;

  return (
    <div className="glass card" style={{ marginBottom: "1rem" }}>
      <div className="row mb-1">
        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
          {meta.emoji} {meta.label}
        </span>
        <span className="small muted">Rush Meter</span>
      </div>
      <div className="rush-bar">
        <motion.div
          className="rush-fill"
          style={{ background: meta.color, width: pct + "%" }}
          initial={false}
          animate={{ width: pct + "%" }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
      <p className="small muted mt-2" style={{ marginTop: "0.6rem" }}>
        {meta.tagline}
      </p>
    </div>
  );
}

/** Flips digits when the token number changes */
export function TokenFlip({ value }: { value: string }) {
  const digits = value.split("");
  return (
    <div
      style={{ display: "flex", justifyContent: "center", gap: "0.35rem" }}
      aria-label={value}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {digits.map((d, i) => (
          <motion.span
            key={i + "-" + d}
            className="token-digit"
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{
              duration: 0.45,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: "inline-block" }}
          >
            {d}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const label =
    status === "waiting"
      ? "⏳ Waiting"
      : status === "preparing"
        ? "🍳 Preparing"
        : status === "ready"
          ? "✅ Ready"
          : status === "delivered"
            ? "📦 Delivered"
            : "❌ Rejected";
  return <span className={`chip-status ${status}`}>{label}</span>;
}
