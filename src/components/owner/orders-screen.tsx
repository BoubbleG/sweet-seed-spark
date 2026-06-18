import { useEffect, useMemo, useRef, useState } from "react";
import { SectionShell } from "./shared";
import { OrderCard } from "./order-card";
import { OrderReceipt } from "./order-receipt";
import { PrinterHelp } from "./printer-help";
import {
  fetchOrders,
  markPrinted,
  playNewOrderSound,
} from "@/lib/orders";
import {
  isBluetoothSupported,
  isPrinterConnected,
  getConnectedPrinterName,
  requestPrinter,
  printOrderBluetooth,
  disconnectPrinter,
} from "@/lib/bluetooth-printer";
import { supabase } from "@/integrations/supabase/client";
import type { Order, Restaurant } from "@/types";
import { ReceiptText, Bluetooth, BluetoothConnected } from "lucide-react";
import { toast } from "sonner";

const FILTERS = [
  { key: "ativos", label: "Ativos" },
  { key: "novo", label: "Novos" },
  { key: "preparando", label: "Preparando" },
  { key: "pronto", label: "Prontos" },
  { key: "todos", label: "Todos" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const AUTOPRINT_KEY = "owner_autoprint_v1";

export function OwnerOrdersScreen({
  restaurant,
  onBack,
}: {
  restaurant: Restaurant;
  onBack: () => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterKey>("ativos");
  const [autoPrint, setAutoPrint] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(AUTOPRINT_KEY) === "1";
  });
  const [printing, setPrinting] = useState<Order | null>(null);
  const [btName, setBtName] = useState<string | null>(getConnectedPrinterName());
  const seenIds = useRef<Set<string>>(new Set());
  const newlyArrived = useRef<Set<string>>(new Set());
  const initialLoaded = useRef(false);

  useEffect(() => {
    localStorage.setItem(AUTOPRINT_KEY, autoPrint ? "1" : "0");
  }, [autoPrint]);

  const load = async () => {
    const data = await fetchOrders(restaurant.id, restaurant.slug);
    data.forEach((o) => seenIds.current.add(o.id));
    initialLoaded.current = true;
    setOrders(data);
  };

  useEffect(() => {
    load();
    // Realtime broadcasts were removed for security; poll instead.
    // Pausa quando a aba está em segundo plano para reduzir carga.
    const tick = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      const data = await fetchOrders(restaurant.id, restaurant.slug);
      let arrivedToPrint: Order | null = null;
      for (const o of data) {
        if (!seenIds.current.has(o.id)) {
          seenIds.current.add(o.id);
          if (initialLoaded.current) {
            newlyArrived.current.add(o.id);
            playNewOrderSound();
            if (autoPrint && !o.printed_at && !arrivedToPrint) arrivedToPrint = o;
          }
        }
      }
      initialLoaded.current = true;
      setOrders(data);
      if (arrivedToPrint) triggerPrint(arrivedToPrint);
    };
    const interval = setInterval(tick, 15000);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant.id, autoPrint]);

  const triggerPrint = async (order: Order) => {
    if (isPrinterConnected()) {
      try {
        await printOrderBluetooth(restaurant, order);
        await markPrinted(restaurant.id, restaurant.slug, order.id);
        toast.success(`Pedido #${order.order_number} impresso`);
        return;
      } catch (e: any) {
        toast.error("Falha na impressora Bluetooth — usando impressão do sistema");
        console.error(e);
      }
    }
    setPrinting(order);
    // Allow React to render the receipt before window.print()
    await new Promise((r) => setTimeout(r, 100));
    window.print();
    await markPrinted(restaurant.id, restaurant.slug, order.id);
    setTimeout(() => setPrinting(null), 400);
  };

  const connectBt = async () => {
    try {
      const name = await requestPrinter();
      setBtName(name);
      toast.success(`Conectado: ${name}`);
    } catch (e: any) {
      if (e?.name !== "NotFoundError") {
        toast.error(e?.message ?? "Não foi possível conectar");
      }
    }
  };

  const disconnectBt = () => {
    disconnectPrinter();
    setBtName(null);
    toast.success("Impressora desconectada");
  };

  const filtered = useMemo(() => {
    if (filter === "ativos")
      return orders.filter((o) => o.status === "novo" || o.status === "preparando" || o.status === "pronto");
    if (filter === "todos") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const newCount = orders.filter((o) => o.status === "novo").length;

  return (
    <SectionShell
      title="Pedidos chegando"
      subtitle={newCount > 0 ? `${newCount} novo(s) aguardando` : "Tudo em dia"}
      onBack={onBack}
    >
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-zinc-900">Imprimir automático</p>
          <p className="text-xs text-zinc-500 leading-tight">
            Cada pedido novo imprime sozinho. Mantenha esta aba aberta.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={autoPrint}
          onClick={() => setAutoPrint((v) => !v)}
          className={`relative w-14 h-8 rounded-full transition shrink-0 ${
            autoPrint ? "bg-emerald-500" : "bg-zinc-300"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              autoPrint ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>

      {isBluetoothSupported() && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                btName ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {btName ? (
                <BluetoothConnected className="w-5 h-5" />
              ) : (
                <Bluetooth className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-zinc-900 leading-tight">
                Impressora Bluetooth
              </p>
              <p className="text-xs text-zinc-500 leading-tight truncate">
                {btName
                  ? `Conectada: ${btName} — imprime grátis, sem app extra`
                  : "Conecte sua impressora térmica para imprimir grátis (sem RawBT)"}
              </p>
            </div>
            {btName ? (
              <button
                onClick={disconnectBt}
                className="h-10 px-3 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold shrink-0"
              >
                Desconectar
              </button>
            ) : (
              <button
                onClick={connectBt}
                className="h-10 px-3 rounded-xl bg-zinc-900 text-white text-xs font-bold shrink-0"
              >
                Conectar
              </button>
            )}
          </div>
        </div>
      )}

      <PrinterHelp />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 h-10 px-4 rounded-full text-xs font-bold transition ${
              filter === f.key
                ? "bg-zinc-900 text-white"
                : "bg-white border border-zinc-200 text-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-3">
            <ReceiptText className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-zinc-700">Nenhum pedido por aqui</p>
          <p className="text-xs text-zinc-500 mt-1">
            Quando um cliente fizer um pedido pelo cardápio, ele aparece aqui na hora.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              restaurant={restaurant}
              isNew={newlyArrived.current.has(o.id) && o.status === "novo"}
              onPrint={() => triggerPrint(o)}
              onChanged={load}
            />
          ))}
        </div>
      )}

      {printing && (
        <div className="hidden-on-screen">
          <OrderReceipt restaurant={restaurant} order={printing} />
        </div>
      )}
    </SectionShell>
  );
}