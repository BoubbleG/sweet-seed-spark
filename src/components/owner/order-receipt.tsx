import { Restaurant, Order } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function OrderReceipt({
  restaurant,
  order,
}: {
  restaurant: Restaurant;
  order: Order;
}) {
  const dt = new Date(order.created_at);
  const date = dt.toLocaleDateString("pt-BR");
  const time = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="print-receipt" data-print-target>
      <div className="text-center">
        <div className="font-bold text-base uppercase">{restaurant.name}</div>
        <div className="text-xs">================================</div>
        <div className="font-bold text-lg">PEDIDO #{String(order.order_number).padStart(4, "0")}</div>
        <div className="text-xs">
          {date} {time}
        </div>
        <div className="text-xs">--------------------------------</div>
      </div>

      <div className="text-xs mt-1">
        <div>CLIENTE: {order.customer_name}</div>
        {order.customer_phone && <div>TEL: {order.customer_phone}</div>}
        {order.customer_address && (
          <div>
            ENDERECO: {order.customer_address}
            {order.customer_neighborhood ? ` - ${order.customer_neighborhood}` : ""}
          </div>
        )}
        {order.customer_reference && <div>REF: {order.customer_reference}</div>}
      </div>

      <div className="text-xs text-center my-1">--------------------------------</div>

      <div className="text-xs">
        {(order.items ?? []).map((it) => (
          <div key={it.id} className="mb-1">
            <div className="flex justify-between font-bold">
              <span>
                {it.quantity}x {it.product_name}{it.size ? ` (${it.size})` : ''}
              </span>
              <span>{formatCurrency(it.unit_price * it.quantity)}</span>
            </div>
            {it.notes && <div className="pl-3 italic">obs: {it.notes}</div>}
          </div>
        ))}
      </div>

      <div className="text-xs text-center my-1">--------------------------------</div>

      <div className="text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Taxa entrega</span>
          <span>{order.delivery_fee === 0 ? "Gratis" : formatCurrency(order.delivery_fee)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="text-xs text-center my-1">--------------------------------</div>

      <div className="text-xs">
        <div>PAGAMENTO: {order.payment_method ?? "-"}</div>
        {order.payment_method === "Dinheiro" && order.change_for ? (
          <div>TROCO PARA: {formatCurrency(order.change_for)}</div>
        ) : null}
        {order.notes && (
          <div className="mt-1">
            <div className="font-bold">OBSERVACAO:</div>
            <div>{order.notes}</div>
          </div>
        )}
      </div>

      <div className="text-xs text-center mt-1">================================</div>
      <div className="text-center text-xs">Obrigado!</div>
    </div>
  );
}