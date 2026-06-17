import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { updateOrderStatus } from "@/lib/orders";
import { Printer, MapPin, Phone, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";

const STATUS_META: Record<
  Order["status"],
  { label: string; bg: string; fg: string; nextLabel?: string; next?: Order["status"] }
> = {
  novo: {
    label: "Novo",
    bg: "bg-rose-100",
    fg: "text-rose-700",
    nextLabel: "Aceitar pedido",
    next: "preparando",
  },
  preparando: {
    label: "Preparando",
    bg: "bg-amber-100",
    fg: "text-amber-700",
    nextLabel: "Marcar como pronto",
    next: "pronto",
  },
  pronto: {
    label: "Pronto",
    bg: "bg-sky-100",
    fg: "text-sky-700",
    nextLabel: "Marcar entregue",
    next: "entregue",
  },
  entregue: { label: "Entregue", bg: "bg-emerald-100", fg: "text-emerald-700" },
  cancelado: { label: "Cancelado", bg: "bg-zinc-200", fg: "text-zinc-600" },
};

export function OrderCard({
  order,
  isNew,
  onPrint,
  onChanged,
}: {
  order: Order;
  isNew: boolean;
  onPrint: () => void;
  onChanged: () => void;
}) {
  const meta = STATUS_META[order.status];
  const dt = new Date(order.created_at);
  const time = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const advance = async () => {
    if (!meta.next) return;
    await updateOrderStatus(order.id, meta.next);
    toast.success(`Pedido #${order.order_number} → ${STATUS_META[meta.next].label}`);
    onChanged();
  };

  const cancel = async () => {
    if (!confirm(`Cancelar pedido #${order.order_number}?`)) return;
    await updateOrderStatus(order.id, "cancelado");
    toast.success("Pedido cancelado");
    onChanged();
  };

  return (
    <article
      className={`bg-white border-2 rounded-2xl p-4 shadow-sm transition ${
        isNew ? "border-rose-400 animate-pulse-soft" : "border-zinc-200"
      }`}
    >
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-black text-zinc-900">
              #{String(order.order_number).padStart(4, "0")}
            </span>
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.bg} ${meta.fg}`}
            >
              {meta.label}
            </span>
          </div>
          <p className="text-base font-bold text-zinc-900 truncate">
            {order.customer_name}
          </p>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-black text-zinc-900">
            {formatCurrency(order.total)}
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">
            {order.payment_method ?? "—"}
          </div>
        </div>
      </header>

      {(order.items ?? []).length > 0 && (
        <ul className="text-sm text-zinc-700 space-y-1 mb-3 bg-zinc-50 rounded-xl p-3">
          {(order.items ?? []).map((it) => (
            <li key={it.id} className="flex justify-between gap-2">
              <span className="min-w-0 flex-1">
                <b>{it.quantity}x</b> {it.product_name}{it.size ? ` (${it.size})` : ''}
                {it.notes ? (
                  <em className="block text-zinc-500 whitespace-pre-line not-italic text-xs mt-0.5 pl-4">
                    {it.notes}
                  </em>
                ) : null}
              </span>
              <span className="text-zinc-500 shrink-0">
                {formatCurrency(it.unit_price * it.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="text-xs text-zinc-600 space-y-1 mb-3">
        {order.customer_phone && (
          <p className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            {order.customer_phone}
          </p>
        )}
        {order.customer_address && (
          <p className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {order.customer_address}
              {order.customer_neighborhood ? ` — ${order.customer_neighborhood}` : ""}
              {order.customer_reference ? ` (ref: ${order.customer_reference})` : ""}
            </span>
          </p>
        )}
        {order.notes && (
          <p className="flex items-start gap-1.5 text-amber-700">
            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{order.notes}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {meta.next && (
          <button
            onClick={advance}
            className="flex-1 h-12 rounded-xl bg-zinc-900 text-white font-black text-sm active:scale-[0.99] transition"
          >
            {meta.nextLabel}
          </button>
        )}
        <button
          onClick={onPrint}
          className="h-12 px-4 rounded-xl bg-zinc-100 text-zinc-900 font-bold text-sm flex items-center gap-1.5 active:scale-[0.99] transition"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
        {order.status !== "entregue" && order.status !== "cancelado" && (
          <button
            onClick={cancel}
            aria-label="Cancelar"
            className="h-12 px-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs active:scale-[0.99] transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </article>
  );
}