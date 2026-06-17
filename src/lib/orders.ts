import { supabase } from "@/integrations/supabase/client";
import type { CartItem, Order, OrderItem } from "@/types";

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  reference: string;
  paymentMethod: string;
  changeFor: string;
  generalNotes: string;
  orderType?: "delivery" | "pickup";
}

function pinToken(slug: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`pin_session:${slug}`);
}

export async function createOrder(params: {
  restaurantId: string;
  items: CartItem[];
  customer: CustomerInfo;
  subtotal: number;
  deliveryFee: number;
  total: number;
}): Promise<Order | null> {
  const { restaurantId, items, customer, subtotal, deliveryFee, total } = params;

  const { data, error } = await supabase.rpc("public_create_order" as any, {
    _restaurant_id: restaurantId,
    _customer: {
      name: customer.name,
      phone: customer.phone || "",
      address: customer.address || "",
      neighborhood: customer.neighborhood || "",
      reference: customer.reference || "",
      payment_method: customer.paymentMethod || "",
      change_for: customer.changeFor ? String(Number(customer.changeFor.replace(",", "."))) : "",
      notes: customer.generalNotes || "",
      order_type: customer.orderType ?? "delivery",
    },
    _totals: { subtotal, delivery_fee: deliveryFee, total },
    _items: items.map((it) => ({
      product_name: it.name,
      unit_price: it.price,
      quantity: it.quantity,
      notes: it.notes ?? "",
      size: it.size ?? "",
    })),
  } as any);

  if (error) {
    console.error("Failed to create order", error);
    return null;
  }

  const row: any = Array.isArray(data) ? data[0] : data;
  const newId = row?.order_id ?? row?.id;
  if (!newId) return null;

  return {
    id: newId,
    order_number: row.order_number,
    restaurant_id: restaurantId,
    customer_name: customer.name,
    status: "novo",
    total,
  } as unknown as Order;
}

export async function fetchOrders(restaurantId: string, slug: string): Promise<Order[]> {
  const _token = pinToken(slug);
  if (!_token) return [];
  const { data, error } = await supabase.rpc("owner_list_orders", {
    _token,
    _restaurant_id: restaurantId,
  } as any);
  if (error) {
    console.error(error);
    return [];
  }
  return ((data as any) ?? []) as Order[];
}

export async function fetchOrderItems(orderId: string, orders: Order[]): Promise<OrderItem[]> {
  const o = orders.find((x) => x.id === orderId);
  return (o?.items ?? []) as OrderItem[];
}

export async function updateOrderStatus(
  restaurantId: string,
  slug: string,
  orderId: string,
  status: Order["status"],
) {
  const _token = pinToken(slug);
  if (!_token) return;
  await supabase.rpc("owner_update_order_status", {
    _token,
    _restaurant_id: restaurantId,
    _order_id: orderId,
    _status: status,
  } as any);
}

export async function markPrinted(restaurantId: string, slug: string, orderId: string) {
  const _token = pinToken(slug);
  if (!_token) return;
  await supabase.rpc("owner_mark_order_printed", {
    _token,
    _restaurant_id: restaurantId,
    _order_id: orderId,
  } as any);
}

// Simple beep using Web Audio API — no asset needed
export function playNewOrderSound() {
  try {
    const AudioCtx =
      (typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)) ||
      null;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const beep = (freq: number, start: number, dur: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.02);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur + 0.02);
    };
    beep(880, 0, 0.18);
    beep(1175, 0.22, 0.22);
  } catch {
    /* ignore */
  }
}