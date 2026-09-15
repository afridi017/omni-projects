import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import CustomerApp from "./routes/CustomerApp";
import KitchenApp from "./routes/KitchenApp";
import AdminApp from "./routes/AdminApp";
import { isSupabaseConfigured } from "./lib/supabase";

type View = "customer" | "kitchen" | "admin";

function parseView(): View {
  const q = new URLSearchParams(window.location.search);
  const v = q.get("view");
  if (v === "kitchen") return "kitchen";
  if (v === "admin") return "admin";
  return "customer";
}

export default function App() {
  const [view, setView] = useState<View>(parseView);

  useEffect(() => {
    const onPop = () => setView(parseView());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = useCallback((v: View) => {
    setView(v);
    const url = new URL(window.location.href);
    if (v === "customer") url.searchParams.delete("view");
    else url.searchParams.set("view", v);
    window.history.pushState({}, "", url);
    window.scrollTo(0, 0);
  }, []);

  if (view === "kitchen") {
    return (
      <Shell title="Kitchen" onBack={() => go("customer")}>
        <KitchenApp />
      </Shell>
    );
  }
  if (view === "admin") {
    return (
      <Shell title="Admin" onBack={() => go("customer")}>
        <AdminApp />
      </Shell>
    );
  }
  return (
    <CustomerApp
      onOpenKitchen={() => go("kitchen")}
      onOpenAdmin={() => go("admin")}
    />
  );
}

function Shell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  const [setupOpen, setSetupOpen] = useState(false);
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-logo">🍕</span>
            <span className="brand-name">
              SABAR<small>X Cafe Peshawar</small>
            </span>
          </div>
          <div className="row">
            <span className="chip">{title}</span>
            <button className="chip" onClick={onBack}>
              ← Back
            </button>
          </div>
        </div>
      </header>
      {!isSupabaseConfigured && (
        <button
          className="chip mt-2 mb-1"
          style={{ color: "var(--orange)", borderColor: "rgba(255,107,0,.4)" }}
          onClick={() => setSetupOpen((s) => !s)}
        >
          🔌 Setup Supabase (demo mode active)
        </button>
      )}
      {setupOpen && <SetupHint />}
      {children}
    </div>
  );
}

function SetupHint() {
  return (
    <div className="glass card mb-2">
      <b className="small">⚡ Realtime ke liye:</b>
      <ol
        className="small muted"
        style={{ margin: "0.5rem 0 0 1.1rem", display: "grid", gap: "0.3rem" }}
      >
        <li>create .env.local likhein:</li>
        <code style={{ color: "var(--orange)", wordBreak: "break-all" }}>
          VITE_SUPABASE_URL=...
        </code>
        <code style={{ color: "var(--orange)", wordBreak: "break-all" }}>
          VITE_SUPABASE_ANON_KEY=...
        </code>
        <li>
          SQL schema <code>supabase/schema.sql</code> me hai
        </li>
        <li>
          Customer page ka QR scan → URL + <code>?scan=1</code> add karein
        </li>
      </ol>
    </div>
  );
}
