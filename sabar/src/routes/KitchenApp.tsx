import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { RushMeter, StatusChip, TokenFlip } from "../components/common";
import { rushLevel, isActive, minutesAgo } from "../lib/queue";
import { playTokenCallSound } from "../lib/sound";
import type { QueueEntry } from "../types";

type Filter = "active" | "ready" | "done";

export default function KitchenApp() {
  const { queues, updateQueue } = useRealtimeData();
  const [filter, setFilter] = useState<Filter>("active");
  const called = useRef<Set<string>>(new Set());

  const activeCount = queues.filter(isActive).length;
  const inProgressCount = queues.filter((q) =>
    ["preparing", "ready"].includes(q.status),
  ).length;
  const rush = rushLevel(activeCount, inProgressCount);

  const visible = useMemo(() => {
    const sorted = [...queues].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    if (filter === "active")
      return sorted.filter(
        (q) =>
          q.status === "waiting" ||
          q.status === "preparing" ||
          q.status === "ready",
      );
    if (filter === "ready") return sorted.filter((q) => q.status === "ready");
    return sorted.filter(
      (q) => q.status === "delivered" || q.status === "rejected",
    );
  }, [queues, filter]);

  const callToken = async (q: QueueEntry) => {
    playTokenCallSound();
    if (!called.current.has(q.id)) {
      called.current.add(q.id);
    }
    await updateQueue(q.id, {
      status: "preparing",
      called_at: new Date().toISOString(),
    });
  };

  const advance = async (q: QueueEntry, status: QueueEntry["status"]) => {
    await updateQueue(q.id, { status });
  };

  // stats
  const stats = [
    {
      label: "Waiting",
      value: queues.filter((q) => q.status === "waiting").length,
      color: "var(--yellow)",
    },
    {
      label: "Preparing",
      value: queues.filter((q) => q.status === "preparing").length,
      color: "var(--orange)",
    },
    {
      label: "Ready",
      value: queues.filter((q) => q.status === "ready").length,
      color: "var(--green)",
    },
    {
      label: "Delivered",
      value: queues.filter((q) => q.status === "delivered").length,
      color: "var(--muted)",
    },
  ];

  return (
    <div className="app-shell">
      <RushMeter level={rush} />

      <div className="row mb-2" style={{ gap: "0.5rem" }}>
        {stats.map((s) => (
          <div
            className="glass card"
            key={s.label}
            style={{ flex: 1, padding: "0.8rem", textAlign: "center" }}
          >
            <span
              style={{
                fontSize: "1.4rem",
                fontWeight: 900,
                color: s.color,
                display: "block",
                lineHeight: 1.2,
              }}
            >
              {s.value}
            </span>
            <span className="small muted" style={{ fontSize: "0.68rem" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="tabs mb-2">
        {(["active", "ready", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            className={`tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "active"
              ? "🔴 Active"
              : f === "ready"
                ? "✅ Ready"
                : "📦 Done"}
          </button>
        ))}
      </div>

      <div className="stack">
        <AnimatePresence initial={false}>
          {visible.length === 0 && (
            <motion.p
              className="muted small center glass card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Queue khaali hai — sukoon! 😌
            </motion.p>
          )}
          {visible.map((q) => (
            <motion.div
              key={q.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`kitchen-card ${q.status === "ready" ? "ready-card" : ""} ${q.status === "waiting" ? "rush-card" : ""}`}
            >
              <div className="row">
                <TokenFlip value={q.token_no} />
                <StatusChip status={q.status} />
              </div>
              <div className="row mt-2" style={{ alignItems: "flex-start" }}>
                <div className="stack" style={{ gap: "0.2rem", flex: 1 }}>
                  <span className="small" style={{ fontWeight: 600 }}>
                    {q.name}
                  </span>
                  <span className="small muted">{q.phone}</span>
                  <span className="small muted">
                    🕐 {minutesAgo(q.created_at)} min pehle
                  </span>
                </div>
                <div
                  className="stack"
                  style={{ gap: "0.3rem", textAlign: "right" }}
                >
                  <span
                    className="small"
                    style={{ fontWeight: 800, color: "var(--orange)" }}
                  >
                    Rs {q.total.toLocaleString()}
                  </span>
                  {q.items.length > 0 && (
                    <span className="small muted" style={{ maxWidth: 180 }}>
                      {q.items
                        .map((i) => `${i.emoji}${i.name}×${i.qty}`)
                        .join(" · ")}
                    </span>
                  )}
                </div>
              </div>

              <div
                className="row mt-2"
                style={{ gap: "0.5rem", flexWrap: "wrap" }}
              >
                {q.status === "waiting" && (
                  <>
                    <button
                      className="btn btn-red btn-sm"
                      onClick={() => advance(q, "rejected")}
                    >
                      ✕ Reject
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => callToken(q)}
                    >
                      🔔 Accept & Call Token
                    </button>
                  </>
                )}
                {q.status === "preparing" && (
                  <button
                    className="btn btn-green btn-sm"
                    onClick={() => advance(q, "ready")}
                  >
                    ✅ Ready
                  </button>
                )}
                {q.status === "ready" && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => advance(q, "delivered")}
                  >
                    📦 Delivered
                  </button>
                )}
                {q.status === "waiting" && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => advance(q, "preparing")}
                  >
                    🍳 Start (no call)
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
