import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function generateWhatsAppMessage(restaurantName: string, items: any[], customer: any, subtotal: number, deliveryFee: number, total: number) {
  let message = `Olá, gostaria de fazer um pedido:\n\n`;
  message += `Restaurante: *${restaurantName}*\n\n`;
  message += `*Itens:*\n`;
  
  items.forEach(item => {
    message += `${item.quantity}x ${item.name} — ${formatCurrency(item.price * item.quantity)}\n`;
    if (item.notes) message += `Observação: ${item.notes}\n`;
    message += `\n`;
  });

  message += `*Resumo:*\n`;
  message += `Subtotal: ${formatCurrency(subtotal)}\n`;
  message += `Taxa de entrega: ${formatCurrency(deliveryFee)}\n`;
  message += `*Total: ${formatCurrency(total)}*\n\n`;

  message += `*Dados do cliente:*\n`;
  message += `Nome: ${customer.name}\n`;
  message += `Telefone: ${customer.phone}\n`;
  message += `Endereço: ${customer.address}\n`;
  message += `Bairro: ${customer.neighborhood}\n`;
  message += `Referência: ${customer.reference || 'N/A'}\n`;
  message += `Forma de pagamento: ${customer.paymentMethod}\n`;
  if (customer.paymentMethod === 'Dinheiro' && customer.changeFor) {
    message += `Troco para: ${formatCurrency(parseFloat(customer.changeFor))}\n`;
  }
  
  if (customer.generalNotes) {
    message += `\n*Observação geral:*\n${customer.generalNotes}`;
  }

  return encodeURIComponent(message);
}
