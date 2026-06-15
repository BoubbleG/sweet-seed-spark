import type { Order, Restaurant } from "@/types";

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const WIDTH = 32; // 58mm printers; use 48 for 80mm

function strToBytes(s: string): number[] {
  // CP860 / CP850 approximation: strip accents to ASCII so any printer renders correctly.
  const ascii = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const out: number[] = [];
  for (let i = 0; i < ascii.length; i++) {
    const c = ascii.charCodeAt(i);
    out.push(c < 128 ? c : 63); // '?' for non-ASCII
  }
  return out;
}

function line(s = "", bytes: number[] = []) {
  bytes.push(...strToBytes(s), LF);
}

function center(bytes: number[]) {
  bytes.push(ESC, 0x61, 0x01);
}
function left(bytes: number[]) {
  bytes.push(ESC, 0x61, 0x00);
}
function bold(on: boolean, bytes: number[]) {
  bytes.push(ESC, 0x45, on ? 1 : 0);
}
function doubleSize(on: boolean, bytes: number[]) {
  bytes.push(GS, 0x21, on ? 0x11 : 0x00);
}

function pad(left: string, right: string, w = WIDTH) {
  const l = left.length;
  const r = right.length;
  if (l + r + 1 > w) {
    // wrap left text
    const cut = w - r - 1;
    return left.slice(0, Math.max(0, cut)) + " " + right;
  }
  return left + " ".repeat(w - l - r) + right;
}

function money(n: number) {
  return n.toFixed(2).replace(".", ",");
}

export function buildReceiptBytes(restaurant: Restaurant, order: Order): Uint8Array {
  const b: number[] = [];
  // init
  b.push(ESC, 0x40);

  // header
  center(b);
  bold(true, b);
  doubleSize(true, b);
  line(restaurant.name.toUpperCase(), b);
  doubleSize(false, b);
  bold(false, b);
  line("================================", b);
  bold(true, b);
  line(`PEDIDO #${String(order.order_number).padStart(4, "0")}`, b);
  bold(false, b);
  const dt = new Date(order.created_at);
  line(
    `${dt.toLocaleDateString("pt-BR")} ${dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    b,
  );
  line("--------------------------------", b);

  left(b);
  line(`CLIENTE: ${order.customer_name}`, b);
  if (order.customer_phone) line(`TEL: ${order.customer_phone}`, b);
  if (order.customer_address) {
    line(
      `END: ${order.customer_address}${order.customer_neighborhood ? " - " + order.customer_neighborhood : ""}`,
      b,
    );
  }
  if (order.customer_reference) line(`REF: ${order.customer_reference}`, b);
  line("--------------------------------", b);

  for (const it of order.items ?? []) {
    const name = `${it.quantity}x ${it.product_name}${it.size ? ` (${it.size})` : ""}`;
    const tot = `R$${money(it.unit_price * it.quantity)}`;
    bold(true, b);
    line(pad(name, tot), b);
    bold(false, b);
    if (it.notes) line(`  obs: ${it.notes}`, b);
  }
  line("--------------------------------", b);

  line(pad("Subtotal", `R$${money(order.subtotal)}`), b);
  line(
    pad("Taxa entrega", order.delivery_fee === 0 ? "Gratis" : `R$${money(order.delivery_fee)}`),
    b,
  );
  bold(true, b);
  doubleSize(true, b);
  line(pad("TOTAL", `R$${money(order.total)}`, 16), b);
  doubleSize(false, b);
  bold(false, b);
  line("--------------------------------", b);

  line(`PAGAMENTO: ${order.payment_method ?? "-"}`, b);
  if (order.payment_method === "Dinheiro" && order.change_for) {
    line(`TROCO PARA: R$${money(order.change_for)}`, b);
  }
  if (order.notes) {
    bold(true, b);
    line("OBSERVACAO:", b);
    bold(false, b);
    line(order.notes, b);
  }

  line("================================", b);
  center(b);
  line("Obrigado!", b);
  left(b);

  // feed + cut
  b.push(LF, LF, LF, LF);
  b.push(GS, 0x56, 0x00);

  return new Uint8Array(b);
}