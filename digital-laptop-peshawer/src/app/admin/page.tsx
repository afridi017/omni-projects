"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Package,
  PlusCircle,
  RefreshCw,
  Settings,
  Zap,
} from "lucide-react";
import type { Product } from "@/db/schema";
import type { AdminStats, OrderWithDetails } from "@/lib/queries";
import { cn, formatPKR, orderNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ProductsTable } from "@/components/admin/products-table";
import {
  ProductForm,
  emptyProductDraft,
  type ProductDraft,
} from "@/components/admin/product-form";
import { OrdersTable } from "@/components/admin/orders-table";
import { SettingsPanel } from "@/components/admin/settings-panel";

type Tab = "dashboard" | "products" | "add" | "orders" | "settings";
const SESSION_KEY = "dl-admin-key";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "add", label: "Add Laptop", icon: PlusCircle },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminPage() {
  const [key, setKey] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    if (stored) setKey(stored);
    setBooted(true);
  }, []);

  const authedFetch = useCallback(
    async (url: string, init?: RequestInit) => {
      const res = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key ?? "",
          ...(init?.headers ?? {}),
        },
      });
      if (res.status === 401) {
        window.sessionStorage.removeItem(SESSION_KEY);
        setKey(null);
        throw new Error("Session expired — please log in again.");
      }
      return res;
    },
    [key],
  );

  const loadAll = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        authedFetch("/api/admin/stats"),
        fetch("/api/products"),
        authedFetch("/api/admin/orders"),
      ]);
      setStats(await statsRes.json());
      setProducts(await productsRes.json());
      setOrders(await ordersRes.json());
    } catch {
      /* handled by authedFetch logout */
    } finally {
      setLoading(false);
    }
  }, [key, authedFetch]);

  useEffect(() => {
    if (key) loadAll();
  }, [key, loadAll]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError("Incorrect password. Try again.");
        return;
      }
      const data = await res.json();
      // Store the signed session token (NOT the raw password).
      window.sessionStorage.setItem(SESSION_KEY, data.token);
      setKey(data.token);
    } finally {
      setLoggingIn(false);
    }
  }

  function logout() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setKey(null);
    setPassword("");
  }

  if (!booted) return null;

  /* ---------------- login gate ---------------- */
  if (!key) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="hero-glow absolute inset-0" />
        <div className="bg-grid absolute inset-0" />
        <Card className="relative w-full max-w-sm p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.35)]">
              <Lock className="h-6 w-6 text-white" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-white">
              Admin Access
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              DIGITAL LAPTOP — management console
            </p>
          </div>
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {loginError && <p className="text-xs text-red-300">{loginError}</p>}
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              disabled={loggingIn || !password}
            >
              {loggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Unlock Dashboard
            </Button>
          </form>
          <Link
            href="/"
            className="mt-5 block text-center text-xs text-zinc-600 transition-colors hover:text-zinc-400"
          >
            ← Back to store
          </Link>
        </Card>
      </div>
    );
  }

  const draft: ProductDraft = editing
    ? {
        ...editing,
        price: String(editing.price),
        originalPrice: editing.originalPrice
          ? String(editing.originalPrice)
          : "",
        stock: String(editing.stock),
        battery: editing.battery ?? "",
      }
    : emptyProductDraft;

  /* ---------------- dashboard shell ---------------- */
  return (
    <div className="min-h-screen bg-[#05060a]">
      <div className="border-b border-white/10 bg-[#06070b]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400">
              <Zap className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-sm font-bold tracking-[0.2em] text-white">
              DIGITAL LAPTOP <span className="text-cyan-300">ADMIN</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3.5 w-3.5" /> View Store
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAll}
              disabled={loading}
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", loading && "animate-spin")}
              />{" "}
              Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                if (t.id !== "add") setEditing(null);
              }}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                tab === t.id
                  ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Package,
                  label: "Total Products",
                  value: stats?.totalProducts ?? "—",
                  tint: "from-indigo-500/25 to-indigo-500/5",
                  iconColor: "text-indigo-300",
                },
                {
                  icon: ClipboardList,
                  label: "Total Orders",
                  value: stats?.totalOrders ?? "—",
                  tint: "from-cyan-500/25 to-cyan-500/5",
                  iconColor: "text-cyan-300",
                },
                {
                  icon: Banknote,
                  label: "Revenue",
                  value: stats ? formatPKR(stats.revenue) : "—",
                  tint: "from-emerald-500/25 to-emerald-500/5",
                  iconColor: "text-emerald-300",
                },
                {
                  icon: AlertTriangle,
                  label: "Low Stock Items",
                  value: stats?.lowStock.length ?? "—",
                  tint: "from-amber-500/25 to-amber-500/5",
                  iconColor: "text-amber-300",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={cn(
                    "rounded-3xl border border-white/10 bg-gradient-to-br p-6 backdrop-blur-xl",
                    s.tint,
                  )}
                >
                  <s.icon className={cn("h-5 w-5", s.iconColor)} />
                  <p className="mt-4 font-display text-3xl font-bold tracking-tight text-white">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-white">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-300" /> Low
                  Stock Alerts
                </h3>
                <div className="mt-5 space-y-3">
                  {stats?.lowStock.length ? (
                    stats.lowStock.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3"
                      >
                        <span className="line-clamp-1 text-sm text-zinc-300">
                          {p.name}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                            p.stock === 0
                              ? "bg-red-500/15 text-red-300"
                              : "bg-amber-500/15 text-amber-300",
                          )}
                        >
                          {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">
                      All products are well stocked. ✓
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold text-white">
                  <ClipboardList className="h-4.5 w-4.5 text-cyan-300" /> Recent
                  Orders
                </h3>
                <div className="mt-5 space-y-3">
                  {orders.length ? (
                    orders.slice(0, 6).map(({ order, customer }) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-white">
                            {orderNumber(order.id)}
                          </span>
                          <span className="ml-2 text-xs text-zinc-500">
                            {customer.fullName}
                          </span>
                        </div>
                        <span className="shrink-0 text-sm font-medium text-cyan-200">
                          {formatPKR(order.total)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">No orders yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "products" && (
          <ProductsTable
            products={products}
            onEdit={(p) => {
              setEditing(p);
              setTab("add");
            }}
            onToggleFeatured={async (p) => {
              await authedFetch(`/api/products/${p.id}`, {
                method: "PATCH",
                body: JSON.stringify({ featured: !p.featured }),
              });
              loadAll();
            }}
            onDelete={async (p) => {
              await authedFetch(`/api/products/${p.id}`, { method: "DELETE" });
              loadAll();
            }}
          />
        )}

        {tab === "add" && (
          <ProductForm
            key={editing?.id ?? "new"}
            editingId={editing?.id ?? null}
            initial={draft}
            authedFetch={authedFetch}
            onSaved={() => {
              setEditing(null);
              setTab("products");
              loadAll();
            }}
            onCancel={() => {
              setEditing(null);
              setTab("products");
            }}
          />
        )}

        {tab === "orders" && (
          <OrdersTable
            orders={orders}
            onUpdateStatus={async (orderId, status) => {
              await authedFetch("/api/admin/orders", {
                method: "PATCH",
                body: JSON.stringify({ orderId, status }),
              });
              loadAll();
            }}
          />
        )}

        {tab === "settings" && <SettingsPanel authedFetch={authedFetch} />}
      </div>
    </div>
  );
}
