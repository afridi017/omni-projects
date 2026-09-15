import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { RushMeter, TokenFlip, StatusChip } from "../components/common";
import {
  estimateWaitMinutes,
  formatEta,
  rushLevel,
  sastaDiscount,
  discountedTotal,
  isActive,
} from "../lib/queue";
import { shareNative } from "../lib/whatsapp";
import { playTokenCallSound } from "../lib/sound";
import type { CartItem, MenuItem } from "../types";
import QRCanvas from "../components/QRCanvas";

const PHONE_RE = /^(\+?92|0092|0)?3\d{9}$/;
const MY_TOKEN_KEY = "sabar_my_token";

type Step = "scan" | "join" | "menu" | "track";

export default function CustomerApp({
  onOpenKitchen,
  onOpenAdmin,
}: {
  onOpenKitchen: () => void;
  onOpenAdmin: () => void;
}) {
  const { queues, menu, joinQueue, updateQueue } = useRealtimeData();
  const [step, setStep] = useState<Step>("scan");
  const [hadScanned, setHadScanned] = useState(false);
  const [myQueue, setMyQueue] = useState<string | null>(() =>
    localStorage.getItem(MY_TOKEN_KEY),
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({
    msg: "",
    show: false,
  });
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const firedConfetti = useRef(new Set<string>());

  // QR scan detection: /?scan=1 or hash
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (params.get("scan") === "1" || hash === "#scan") {
      setHadScanned(true);
      if (myQueue) setStep("track");
      else setStep("join");
    }
  }, [myQueue]);

  const myEntry = useMemo(
    () => (myQueue ? (queues.find((q) => q.id === myQueue) ?? null) : null),
    [queues, myQueue],
  );

  const waitMins = myEntry ? estimateWaitMinutes(myEntry, queues) : 0;
  const hasDiscount = myEntry ? sastaDiscount(waitMins) : false;
  const menuTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const activeCount = queues.filter(isActive).length;
  const inProgressCount = queues.filter((q) =>
    ["preparing", "ready"].includes(q.status),
  ).length;
  const rush = rushLevel(activeCount, inProgressCount);

  // Confetti when order becomes ready
  useEffect(() => {
    if (
      myEntry &&
      myEntry.status === "ready" &&
      !firedConfetti.current.has(myEntry.id)
    ) {
      firedConfetti.current.add(myEntry.id);
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    }
  }, [myEntry]);

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast({ msg: "", show: false }), 2600);
  };

  const handleJoin = async () => {
    setError("");
    if (!PHONE_RE.test(phone.trim())) {
      setError("Valid Pakistani number daalein — 03XX XXXXXXX");
      return;
    }
    setJoining(true);
    try {
      // Ask permission so "token near/ready" notifications work
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
      const entry = await joinQueue(phone.trim(), name.trim(), cart);
      setMyQueue(entry.id);
      localStorage.setItem(MY_TOKEN_KEY, entry.id);
      playTokenCallSound();
      setStep("track");
    } catch (e) {
      setError("Queue join nahi hua — dobara try karein");
      console.error(e);
    } finally {
      setJoining(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.item_id === item.id);
      if (ex)
        return prev.map((c) =>
          c.item_id === item.id ? { ...c, qty: c.qty + 1 } : c,
        );
      return [
        ...prev,
        {
          item_id: item.id,
          name: item.name,
          emoji: item.emoji,
          price: item.price,
          qty: 1,
        },
      ];
    });
  };

  const changeQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item_id === itemId ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0),
    );
  };

  const markReadyClick = async () => {
    if (!myEntry) return;
    showToast("Kitchen ko bataya — order ready queue me hai ✅");
  };

  // =============== ROUTES ===============
  if (step === "scan") {
    return (
      <ScanScreen
        hadScanned={hadScanned}
        onScanEnter={() => {
          setHadScanned(true);
          setStep(myQueue ? "track" : "join");
        }}
        onOpenKitchen={onOpenKitchen}
        onOpenAdmin={onOpenAdmin}
      />
    );
  }

  if (step === "join") {
    return (
      <div className="app-shell">
        <Header showMenu={false} />
        <RushMeter level={rush} />
        <motion.div
          className="glass card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="section-title">📲 Queue join karein</h2>
          <div className="field">
            <label>Name (optional)</label>
            <input
              className="input"
              placeholder="Aapka naam"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label>WhatsApp Number</label>
            <input
              className="input"
              placeholder="03XX XXXXXXX"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {error && (
            <p className="small" style={{ color: "var(--red)" }}>
              {error}
            </p>
          )}
          <button
            className="btn btn-primary btn-block mt-2"
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? "Joining..." : `🚀 Token lo — Queue join`}
          </button>
          <p className="small muted mt-2 center">
            Har order ≈ 7 min. Token milte hi wait time live update hoga.
          </p>
        </motion.div>
        <div className="glass card mt-2">
          <h3 className="section-title" style={{ fontSize: "1rem" }}>
            🛒 Pre-order (optional)
          </h3>
          {menu.length === 0 && (
            <div className="shimmer" style={{ height: 80 }} />
          )}
          <div className="stack">
            {menu.map((item) => {
              const inCart = cart.find((c) => c.item_id === item.id);
              return (
                <div className="menu-item" key={item.id}>
                  <span className="menu-item-emoji">{item.emoji}</span>
                  <div className="menu-item-body">
                    <div className="menu-item-name">{item.name}</div>
                    <div className="menu-item-desc">{item.desc}</div>
                  </div>
                  <div className="row" style={{ gap: "0.5rem" }}>
                    <span className="menu-item-price">
                      Rs {item.price.toLocaleString()}
                    </span>
                    {inCart ? (
                      <div className="stepper">
                        <button onClick={() => changeQty(item.id, -1)}>
                          −
                        </button>
                        <span className="qty">{inCart.qty}</span>
                        <button onClick={() => changeQty(item.id, 1)}>+</button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => addToCart(item)}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {cart.length > 0 && (
            <div className="glass card mt-2">
              <div className="row">
                <span className="muted">Total</span>
                <span style={{ fontWeight: 800, color: "var(--orange)" }}>
                  Rs {menuTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
        <Toast msg={toast.msg} />
      </div>
    );
  }

  if (step === "track" && myEntry) {
    return (
      <div className="app-shell">
        <Header showMenu={false} />
        <RushMeter level={rush} />
        <motion.div
          className="glass token-hero card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <p
            className="muted small"
            style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            Aapka Token
          </p>
          <TokenFlip value={myEntry.token_no} />
          <StatusChip status={myEntry.status} />
        </motion.div>

        <div className="glass card mt-2">
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div className="stack" style={{ gap: "0.4rem" }}>
              <span className="muted small">Estimated wait</span>
              <span
                style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}
              >
                {formatEta(waitMins)}
              </span>
            </div>
            <div
              className="stack"
              style={{ gap: "0.4rem", textAlign: "right" }}
            >
              <span className="muted small">Aap se pehle</span>
              <span
                style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}
              >
                {
                  queues.filter(
                    (q) =>
                      q.id !== myEntry.id &&
                      isActive(q) &&
                      new Date(q.created_at).getTime() <
                        new Date(myEntry.created_at).getTime(),
                  ).length
                }
              </span>
            </div>
          </div>
          <div className="sasta-meter mt-2">
            {hasDiscount ? (
              <motion.div
                className="chip"
                style={{
                  background: "rgba(34,197,94,0.15)",
                  color: "var(--green)",
                  borderColor: "rgba(34,197,94,0.4)",
                  fontSize: "0.9rem",
                  padding: "0.5rem 1rem",
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                🎉 SASTA METER — 10% OFF bonus! Sabar ka phal meetha!
              </motion.div>
            ) : (
              <p className="small muted">
                🏷️ Sasta Meter: {formatEta(waitMins)} — agar 30 min se zyada{" "}
                {">"} to 10% OFF!
              </p>
            )}
          </div>
        </div>

        {myEntry.status === "ready" && (
          <motion.div
            className="glass card mt-2"
            style={{ borderColor: "rgba(34,197,94,0.5)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 style={{ color: "var(--green)", fontWeight: 800 }}>
              ✅ Aapka order ready hai!
            </h3>
            <p className="small muted">
              Counter se utha lein — shukriya X Cafe!
            </p>
            <button
              className="btn btn-green btn-block mt-2"
              onClick={markReadyClick}
            >
              Done — Shukriya 🎉
            </button>
          </motion.div>
        )}

        {myEntry.status === "rejected" && (
          <div
            className="glass card mt-2"
            style={{ borderColor: "rgba(225,29,72,0.5)" }}
          >
            <h3 style={{ color: "var(--red)", fontWeight: 800 }}>
              ❌ Order reject hua
            </h3>
            <p className="small muted">Kitchen se baat karein — 0337 1377555</p>
          </div>
        )}

        <div className="glass card mt-2 stack">
          <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>🛒 Aapka order</h3>
          {myEntry.items.length === 0 && (
            <p className="small muted">
              No pre-order — counter se bhi order kar sakte hain.
            </p>
          )}
          {myEntry.items.map((it, i) => (
            <div className="row" key={i}>
              <span className="small">
                {it.emoji} {it.name} × {it.qty}
              </span>
              <span className="small" style={{ fontWeight: 600 }}>
                Rs {(it.price * it.qty).toLocaleString()}
              </span>
            </div>
          ))}
          <div
            className="row"
            style={{
              borderTop: "1px solid var(--stroke)",
              paddingTop: "0.6rem",
            }}
          >
            <span className="muted">Total</span>
            <span style={{ fontWeight: 800 }}>
              {hasDiscount && waitMins > 0 && myEntry.total > 0 ? (
                <>
                  <s className="muted" style={{ marginRight: "0.5rem" }}>
                    Rs {myEntry.total.toLocaleString()}
                  </s>
                  <span style={{ color: "var(--green)" }}>
                    Rs {discountedTotal(myEntry.total, true).toLocaleString()}{" "}
                    🎉
                  </span>
                </>
              ) : (
                <>Rs {myEntry.total.toLocaleString()}</>
              )}
            </span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-block mt-2"
          onClick={() => {
            shareNative(myEntry.token_no, waitMins);
            showToast("WhatsApp share kiya ✅");
          }}
        >
          📲 WhatsApp par share karein
        </button>
        <p className="small muted center mt-2">
          "Mera token {myEntry.token_no} hai, {formatEta(waitMins)} baad ana"
        </p>
        <Toast msg={toast.msg} />
      </div>
    );
  }

  // track but no entry yet
  return (
    <div className="app-shell">
      <Header showMenu={false} />
      <div className="glass card center">
        <p className="muted">Token dhoond rahe hain...</p>
      </div>
      <Toast msg={toast.msg} />
    </div>
  );
}

function Header({ showMenu }: { showMenu: boolean }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-logo">🍕</span>
          <span className="brand-name">
            SABAR<small>X Cafe Peshawar</small>
          </span>
        </div>
        {showMenu && <span />}
        <span className="tagline-urdu"># میں ہوں سب سے سستا</span>
      </div>
    </header>
  );
}

function Toast({ msg }: { msg: string }) {
  return <div className={`toast ${msg ? "show" : ""}`}>✅ {msg}</div>;
}

function ScanScreen({
  hadScanned,
  onScanEnter,
  onOpenKitchen,
  onOpenAdmin,
}: {
  hadScanned: boolean;
  onScanEnter: () => void;
  onOpenKitchen: () => void;
  onOpenAdmin: () => void;
}) {
  return (
    <div className="app-shell center">
      <Header showMenu={false} />
      <div className="mt-3">
        <div className="float" style={{ fontSize: "4rem" }}>
          🍕
        </div>
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            margin: "0.5rem 0 0.2rem",
          }}
        >
          SABAR
        </h1>
        <p className="tagline-urdu" style={{ fontSize: "1.15rem" }}>
          # میں ہوں سب سے سستا
        </p>
        <p
          className="muted small mt-2"
          style={{ maxWidth: "360px", margin: "0.5rem auto" }}
        >
          X Cafe Peshawar — queue join karein, live token dekhein, pre-order
          karein, WhatsApp par update paaiye.
        </p>
      </div>

      <div className="glass card mt-3">
        <p className="muted small" style={{ marginBottom: "0.6rem" }}>
          Counter par mojood QR scan karein:
        </p>
        <div className="qr-frame" style={{ margin: "0 auto" }}>
          <QRCanvas value="https://sabar-xcafe.vercel.app/?scan=1" size={196} />
        </div>
        <button
          className="btn btn-primary btn-block mt-3"
          onClick={onScanEnter}
        >
          {hadScanned
            ? "↩ Main hoon — aage badhein"
            : "📱 Main counter par hoon"}
        </button>
      </div>

      <div className="glass card mt-2 stack" style={{ textAlign: "left" }}>
        <div className="row">
          <span className="small muted">🍳 Kitchen dashboard</span>
          <button className="btn btn-ghost btn-sm" onClick={onOpenKitchen}>
            Open →
          </button>
        </div>
        <div className="row">
          <span className="small muted">⚙️ Admin — menu & prices</span>
          <button className="btn btn-ghost btn-sm" onClick={onOpenAdmin}>
            Open →
          </button>
        </div>
        <p className="small muted" style={{ fontSize: "0.72rem" }}>
          💡 Demo mode: Supabase configure nahi hai — data browser localStorage
          me saves hota hai. Realtime live ke liye setup hint follow karein.
        </p>
      </div>
    </div>
  );
}
