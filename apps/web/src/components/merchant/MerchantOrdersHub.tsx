import React, { useState } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  DollarSign,
  QrCode,
  Users,
  Search,
  Filter,
  ArrowRight,
  PackageCheck,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerTier: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  paymentMethod: "lynk" | "card" | "points" | "cash";
  status: "pending" | "preparing" | "ready" | "completed";
  timePlaced: string;
  isRepeat: boolean;
}

export function MerchantOrdersHub({
  onOpenScanner,
}: {
  onOpenScanner?: () => void;
}) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const statusLabel = (status: OrderItem["status"]) => {
    const keys: Record<OrderItem["status"], TranslationKey> = {
      pending: "merchOrders.stPending",
      preparing: "merchOrders.stPreparing",
      ready: "merchOrders.stReady",
      completed: "merchOrders.stCompleted",
    };
    return t(keys[status]);
  };

  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: "ord-1",
      orderNumber: "ORD-88210",
      customerName: "Camille Watson",
      customerTier: "Scout L2",
      items: [
        { name: "Signature Iced Latte", qty: 2, price: 5.5 },
        { name: "Almond Croissant", qty: 1, price: 4.0 },
      ],
      total: 15.0,
      paymentMethod: "lynk",
      status: "pending",
      timePlaced: "4 mins ago",
      isRepeat: true,
    },
    {
      id: "ord-2",
      orderNumber: "ORD-88209",
      customerName: "David Sterling",
      customerTier: "Explorer",
      items: [
        { name: "Kingston Brunch Bowl", qty: 1, price: 16.0 },
        { name: "Fresh Soursop Juice", qty: 1, price: 6.0 },
      ],
      total: 22.0,
      paymentMethod: "card",
      status: "preparing",
      timePlaced: "11 mins ago",
      isRepeat: false,
    },
    {
      id: "ord-3",
      orderNumber: "ORD-88208",
      customerName: "Tanya Miller",
      customerTier: "Vanguard Host",
      items: [
        { name: "Coffee Beans 250g (Whole)", qty: 2, price: 18.0 },
      ],
      total: 36.0,
      paymentMethod: "points",
      status: "ready",
      timePlaced: "25 mins ago",
      isRepeat: true,
    },
    {
      id: "ord-4",
      orderNumber: "ORD-88205",
      customerName: "Rohan Marley",
      customerTier: "Scout L1",
      items: [
        { name: "Pour-Over Tasting Trio", qty: 1, price: 12.0 },
      ],
      total: 12.0,
      paymentMethod: "lynk",
      status: "completed",
      timePlaced: "52 mins ago",
      isRepeat: true,
    },
  ]);

  const updateOrderStatus = (orderId: string, newStatus: OrderItem["status"]) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    toast({
      title: t("merchOrders.updated"),
      description: t("merchOrders.updatedCopy", { status: statusLabel(newStatus) }),
    });
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = filterStatus === "all" || ord.status === filterStatus;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeCount = orders.filter((o) => o.status !== "completed").length;
  const totalVolume = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Order Telemetry */}
      <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <ShoppingBag className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{t("merchOrders.title")}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                {t("merchOrders.active", { count: activeCount })}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {t("merchOrders.copy")}
            </p>
          </div>
        </div>

        {/* Rapid KPI Chips */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
            <p className="text-[10px] uppercase font-bold text-white/50">{t("merchOrders.volume")}</p>
            <p className="text-base font-black text-emerald-400">${totalVolume.toFixed(2)}</p>
          </div>
          <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
            <p className="text-[10px] uppercase font-bold text-white/50">{t("merchOrders.handover")}</p>
            <p className="text-base font-black text-white">{t("merchOrders.handoverVal")}</p>
          </div>
        </div>
      </div>

      {/* 2. Filter Strip & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { value: "all", label: t("merchOrders.all") },
            { value: "pending", label: t("merchOrders.pending") },
            { value: "preparing", label: t("merchOrders.preparing") },
            { value: "ready", label: t("merchOrders.ready") },
            { value: "completed", label: t("merchOrders.completed") },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
                filterStatus === tab.value
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("merchOrders.search")}
            className="h-10 pl-9 rounded-2xl border-white/10 bg-white/5 text-white text-xs"
          />
        </div>
      </div>

      {/* 3. Orders Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const isPending = order.status === "pending";
          const isPreparing = order.status === "preparing";
          const isReady = order.status === "ready";
          const isDone = order.status === "completed";

          return (
            <div
              key={order.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-200 ${
                isPending
                  ? "border-amber-500/40 bg-[#161208] shadow-lg shadow-amber-500/5"
                  : isReady
                  ? "border-emerald-500/40 bg-[#08160f] shadow-lg shadow-emerald-500/5"
                  : "border-white/10 bg-[#0e1015]"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-white">{order.orderNumber}</span>
                    {order.isRepeat && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-extrabold flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        {t("merchOrders.loyal")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-white/80 mt-0.5">
                    {order.customerName}{" "}
                    <span className="text-white/40 font-normal">({order.customerTier})</span>
                  </p>
                </div>

                <Badge
                  className={`text-[10px] font-black uppercase ${
                    isPending
                      ? "bg-amber-500 text-black"
                      : isPreparing
                      ? "bg-blue-500 text-white"
                      : isReady
                      ? "bg-emerald-500 text-black"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {statusLabel(order.status)}
                </Badge>
              </div>

              {/* Items List */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-white/90">
                    <span>
                      <span className="font-bold text-emerald-400">{item.qty}x</span> {item.name}
                    </span>
                    <span className="font-mono text-white/60">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Payment & Time Footprint */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Clock className="h-3.5 w-3.5 text-white/40" />
                  <span>{order.timePlaced}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-white/70">
                    {order.paymentMethod === "lynk"
                      ? t("merchOrders.lynk")
                      : order.paymentMethod === "points"
                      ? t("merchOrders.points")
                      : order.paymentMethod === "cash"
                      ? t("merchOrders.cash")
                      : t("merchOrders.card")}
                  </span>
                  <span className="font-black text-sm text-emerald-400">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {isPending && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, "preparing")}
                    className="w-full h-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs"
                  >
                    {t("merchOrders.accept")}
                  </Button>
                )}
                {isPreparing && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, "ready")}
                    className="w-full h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs"
                  >
                    <PackageCheck className="h-4 w-4 mr-1.5" />
                    {t("merchOrders.markReady")}
                  </Button>
                )}
                {isReady && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, "completed")}
                    className="w-full h-10 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-black font-extrabold text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    {t("merchOrders.confirmHand")}
                  </Button>
                )}
                {isDone && (
                  <div className="text-center py-1">
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t("merchOrders.done")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MerchantOrdersHub;
