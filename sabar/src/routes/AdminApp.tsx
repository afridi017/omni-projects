import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { RushMeter } from "../components/common";
import { rushLevel, isActive } from "../lib/queue";
import type { MenuItem } from "../types";

const CATEGORIES = ["Pizza", "Burger", "Shawarma", "Sides", "Deals"];

export default function AdminApp() {
  const { queues, menu, upsertMenu } = useRealtimeData();
  const [cat, setCat] = useState("All");
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);

  const activeCount = queues.filter(isActive).length;
  const inProgressCount = queues.filter((q) =>
    ["preparing", "ready"].includes(q.status),
  ).length;
  const rush = rushLevel(activeCount, inProgressCount);

  const filtered = useMemo(
    () => (cat === "All" ? menu : menu.filter((m) => m.category === cat)),
    [menu, cat],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const saveItem = async (item: Partial<MenuItem> & { id?: string }) => {
    if (!item.name || !item.price) {
      showToast("Name aur price zaroori hai");
      return;
    }
    await upsertMenu(item);
    setEditing(null);
    showToast(item.id ? "Update ho gaya ✅" : "Menu me add ✅");
  };

  return (
    <div className="app-shell">
      <RushMeter level={rush} />
      <div className="glass card mb-2">
        <h3 className="section-title">⚙️ Menu Manager</h3>
        <div className="tabs mb-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              className={`tab ${cat === c ? "active" : ""}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="stack">
          <AnimatePresence initial={false}>
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="menu-item"
              >
                <span className="menu-item-emoji">{item.emoji}</span>
                <div className="menu-item-body">
                  <div className="menu-item-name">
                    {item.name}
                    {!item.available && (
                      <span
                        className="chip"
                        style={{
                          marginLeft: "0.4rem",
                          background: "rgba(225,29,72,.15)",
                          color: "var(--red)",
                        }}
                      >
                        Sold out
                      </span>
                    )}
                  </div>
                  <div className="menu-item-desc">{item.desc}</div>
                </div>
                <span className="menu-item-price">
                  Rs {item.price.toLocaleString()}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditing(item)}
                >
                  ✏️
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <p className="small muted center">Koi item nahi — add karein 👇</p>
          )}
        </div>
        <button
          className="btn btn-primary btn-block mt-2"
          onClick={() =>
            setEditing({
              category: cat === "All" ? "Pizza" : cat,
              available: true,
            })
          }
        >
          ➕ Add Item
        </button>
      </div>

      <div className="glass card mb-2">
        <h3 className="section-title">🧠 Rush Logic</h3>
        <div className="stack small">
          <p className="muted">
            Current:{" "}
            <b style={{ color: "var(--text)" }}>{activeCount} active orders</b>{" "}
            •{" "}
            <b style={{ color: "var(--text)" }}>{inProgressCount} in kitchen</b>
          </p>
          <p className="muted">
            • Har order ≈ <b style={{ color: "var(--orange)" }}>7 min</b> — wait
            time auto-calculate hota hai
          </p>
          <p className="muted">
            • Next token:{" "}
            <b style={{ color: "var(--orange)" }}>
              A
              {Math.max(
                ...queues.map((q) =>
                  parseInt((q.token_no || "A100").replace("A", ""), 10),
                ),
                100,
              ) + 1}
            </b>
          </p>
          <p className="muted">
            • Sasta Meter: wait &gt; 30 min →{" "}
            <b style={{ color: "var(--green)" }}>10% OFF</b> badge
          </p>
        </div>
      </div>

      <div className="glass card">
        <h3 className="section-title">🗂 Database Setup</h3>
        <p className="small muted">
          Supabase SQL schema{" "}
          <code style={{ color: "var(--orange)" }}>supabase/schema.sql</code> me
          hai — tables: <b>queues</b>, <b>menu</b>.
        </p>
        <p className="small muted mt-2">
          Realtime channels: <code>sabar-realtime</code> on <code>queues</code>{" "}
          & <code>menu</code>.
        </p>
        <p className="small muted mt-2">
          Orders + items queues table ke <code>items</code> (jsonb) column me —
          simple MVP.
        </p>
      </div>

      <AnimatePresence>
        {editing && (
          <ItemEditor
            initial={editing}
            onSave={saveItem}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemEditor({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<MenuItem> & { id?: string };
  onSave: (item: Partial<MenuItem> & { id?: string }) => void;
  onClose: () => void;
}) {
  const [item, setItem] = useState<Partial<MenuItem> & { id?: string }>(
    initial,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <motion.div
        className="glass-strong card"
        style={{
          width: "100%",
          maxWidth: 420,
          maxHeight: "86vh",
          overflowY: "auto",
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="section-title">
          {item.id ? "✏️ Edit Item" : "➕ New Item"}
        </h3>
        <div className="field">
          <label>Name</label>
          <input
            className="input"
            value={item.name ?? ""}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Emoji</label>
          <input
            className="input"
            value={item.emoji ?? ""}
            onChange={(e) => setItem({ ...item, emoji: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Category</label>
          <select
            className="input"
            value={item.category ?? "Pizza"}
            onChange={(e) => setItem({ ...item, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Price (Rs)</label>
          <input
            className="input"
            type="number"
            value={item.price ?? ""}
            onChange={(e) =>
              setItem({ ...item, price: Number(e.target.value) })
            }
          />
        </div>
        <div className="field">
          <label>Description</label>
          <input
            className="input"
            value={item.desc ?? ""}
            onChange={(e) => setItem({ ...item, desc: e.target.value })}
          />
        </div>
        {item.id && (
          <div className="field">
            <label>Availability</label>
            <button
              className={`btn ${item.available ? "btn-green" : "btn-red"} btn-sm btn-block`}
              onClick={() => setItem({ ...item, available: !item.available })}
            >
              {item.available ? "✅ Available" : "❌ Sold Out"}
            </button>
          </div>
        )}
        <div className="row mt-2">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onSave(item)}>
            💾 Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
