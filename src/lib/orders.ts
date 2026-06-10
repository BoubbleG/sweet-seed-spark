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

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      restaurant_id: restaurantId,
      customer_name: customer.name,
      customer_phone: customer.phone || null,
      customer_address: customer.address || null,
      customer_neighborhood: customer.neighborhood || null,
      customer_reference: customer.reference || null,
      payment_method: customer.paymentMethod || null,
      change_for: customer.changeFor ? Number(customer.changeFor.replace(",", ".")) : null,
      notes: customer.generalNotes || null,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      order_type: "delivery",
      status: "novo",
    })
    .select()
    .single();

  if (error || !order) {
    console.error("Failed to create order", error);
    return null;
  }

  if (items.length > 0) {
    const rows = items.map((it) => ({
      order_id: order.id,
      product_name: it.name,
      unit_price: it.price,
      quantity: it.quantity,
      notes: it.notes ?? null,
    }));
    await supabase.from("order_items").insert(rows);
  }

  return order as Order;
}

export async function fetchOrders(restaurantId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as unknown as Order[];
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  return (data ?? []) as OrderItem[];
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  await supabase.from("orders").update({ status }).eq("id", orderId);
}

export async function markPrinted(orderId: string) {
  await supabase
    .from("orders")
    .update({ printed_at: new Date().toISOString() })
    .eq("id", orderId);
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