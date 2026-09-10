"use client";

import { useState } from "react";
import { ChevronDown, ClipboardList, MapPin, Phone, User } from "lucide-react";
import type { OrderStatus } from "@/db/schema";
import type { OrderWithDetails } from "@/lib/queries";
import { cn, formatDate, formatPKR, orderNumber } from "@/lib/utils";
import { buildWhatsAppOrderUrl } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-300",
  CONFIRMED: "bg-cyan-500/15 text-cyan-300",
  DELIVERED: "bg-emerald-500/15 text-emerald-300",
  CANCELLED: "bg-red-500/15 text-red-300",
};

export function OrdersTable({
  orders,
  onUpdateStatus,
}: {
  orders: OrderWithDetails[];
  onUpdateStatus: (orderId: number, status: OrderStatus) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function changeStatus(orderId: number, status: OrderStatus) {
    setBusyId(orderId);
    try {
      await onUpdateStatus(orderId, status);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="font-display text-lg font-semibold text-white">
          Orders <span className="text-sm font-normal text-zinc-500">({orders.length} total)</span>
        </h2>
      </div>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <ClipboardList className="h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">No orders yet — they&apos;ll appear here as customers check out.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {orders.map(({ order, customer, items }) => {
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className={cn(busyId === order.id && "pointer-events-none opacity-60")}>
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="font-display text-sm font-bold tracking-wider text-white">
                    {orderNumber(order.id)}
                  </span>
                  <span className="text-sm text-zinc-400">{customer.fullName}</span>
                  <span className="text-xs text-zinc-600">{formatDate(order.createdAt)}</span>
                  <span className="text-sm font-semibold text-cyan-200">{formatPKR(order.total)}</span>
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", STATUS_STYLES[order.status])}>
                    {order.status}
                  </span>
                  <ChevronDown className={cn("ml-auto h-4 w-4 text-zinc-500 transition-transform duration-300", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                  <div className="grid gap-6 border-t border-white/5 bg-white/[0.02] px-6 py-5 lg:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Items
                      </p>
                      <div className="mt-3 space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-zinc-300">
                              <span className="font-semibold text-white">{item.quantity}×</span> {item.name}
                            </span>
                            <span className="shrink-0 text-zinc-200">{formatPKR(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-sm">
                          <span className="font-semibold text-white">Total (COD)</span>
                          <span className="font-display font-bold text-white">{formatPKR(order.total)}</span>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Status
                        </p>
                        <Select
                          className="mt-2 max-w-[220px]"
                          value={order.status}
                          onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Customer
                      </p>
                      <div className="mt-3 space-y-2.5 text-sm text-zinc-300">
                        <p className="flex items-center gap-2.5"><User className="h-4 w-4 text-cyan-300/70" /> {customer.fullName}</p>
                        <p className="flex items-center gap-2.5">
                          <Phone className="h-4 w-4 text-cyan-300/70" />
                          <a href={`tel:${customer.phone}`} className="hover:text-white">{customer.phone}</a>
                        </p>
                        <p className="flex items-start gap-2.5">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/70" />
                          {customer.address}, {customer.city}
                        </p>
                      </div>
                      <a
                        href={buildWhatsAppOrderUrl(
                          `Order ${orderNumber(order.id)} — ${items.map((i) => `${i.quantity}× ${i.name}`).join(", ")} | Total ${formatPKR(order.total)} COD | ${customer.fullName}, ${customer.address}, ${customer.city}`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/20"
                      >
                        Forward order to shop WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
