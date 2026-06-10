import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency, generateWhatsAppMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Minus, X, Clock, ShoppingCart, Lock } from "lucide-react";
import { Restaurant } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { buildMenuTheme } from "@/lib/theme";
import { createOrder } from "@/lib/orders";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export function CartDrawer({ isOpen, onClose, restaurant }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    reference: "",
    paymentMethod: "PIX",
    changeFor: "",
    generalNotes: ""
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const subtotal = getTotal();
  const minFree = restaurant.min_order_for_free_delivery || 0;
  const deliveryFee = minFree > 0 && subtotal >= minFree ? 0 : (restaurant.delivery_fee || 0);
  const total = subtotal + deliveryFee;
  const t = buildMenuTheme(restaurant);

  const handleSendOrder = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!customer.name) newErrors.name = true;
    if (!customer.phone) newErrors.phone = true;
    if (!customer.address) newErrors.address = true;
    if (!customer.neighborhood) newErrors.neighborhood = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const order = await createOrder({
      restaurantId: restaurant.id,
      items,
      customer,
      subtotal,
      deliveryFee,
      total,
    });
    if (!order) {
      toast.error("Não conseguimos salvar o pedido. Tente novamente.");
      return;
    }

    const orderTag = `*Pedido #${String(order.order_number).padStart(4, "0")}*\n`;
    const message = orderTag + generateWhatsAppMessage(
      restaurant.name,
      items,
      customer,
      subtotal,
      deliveryFee,
      total
    );

    window.open(`https://wa.me/${restaurant.whatsapp}?text=${message}`, "_blank");
    clearCart();
    onClose();
  };

  const inputClass = "h-12 rounded-xl text-sm placeholder:opacity-50";
  const inputStyle = (key: string) => ({
    backgroundColor: t.surface,
    color: t.text,
    border: `1px solid ${errors[key] ? '#f43f5e' : t.border}`,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Meu pedido"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed inset-0 sm:inset-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-[440px] sm:rounded-3xl z-50 flex flex-col overflow-hidden shadow-2xl"
            style={{ backgroundColor: t.background, color: t.text, fontFamily: t.font }}
          >
            {/* Header */}
            <div
              className="px-5 sm:px-6 py-4 flex items-center justify-between shrink-0"
              style={{ borderBottom: `1px solid ${t.border}` }}
            >
              <button
                onClick={onClose}
                type="button"
                aria-label="Fechar pedido"
                className="w-11 h-11 rounded-full shadow-sm flex items-center justify-center active:scale-95 transition-transform"
                style={{ backgroundColor: t.surface, color: t.text }}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-base font-black" style={{ color: t.text }}>Meu pedido</h2>
              <button
                onClick={() => {
                  if (items.length > 0 && confirm('Esvaziar o pedido?')) clearCart();
                }}
                type="button"
                aria-label="Esvaziar pedido"
                className="w-11 h-11 rounded-full shadow-sm flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
                style={{ backgroundColor: t.surface, color: t.textMuted }}
                disabled={items.length === 0}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Scroll body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-5 pb-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div
                    className="w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-4"
                    style={{ backgroundColor: t.surface }}
                  >
                    <ShoppingCart className="w-7 h-7" style={{ color: t.primary }} />
                  </div>
                  <p className="text-sm font-bold" style={{ color: t.text }}>Seu pedido está vazio</p>
                  <p className="text-xs mt-1" style={{ color: t.textMuted }}>Adicione itens do cardápio para continuar.</p>
                  <Button
                    onClick={onClose}
                    type="button"
                    className="mt-6 h-11 px-6 rounded-full text-xs font-black uppercase tracking-widest"
                    style={{ backgroundColor: t.primary, color: t.onPrimary }}
                  >
                    Ver cardápio
                  </Button>
                </div>
              ) : (
                <>
                  {/* Delivery info */}
                  <div
                    className="rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                    style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${t.primary}1a` }}
                    >
                      <Clock className="w-5 h-5" style={{ color: t.primary }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate" style={{ color: t.text }}>
                        {restaurant.average_delivery_time ? `Entrega em ${restaurant.average_delivery_time}` : 'Entrega rápida'}
                      </p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: t.textMuted }}>
                        {restaurant.delivery_fee > 0 ? `Taxa ${formatCurrency(restaurant.delivery_fee)}` : 'Entrega grátis'}
                        {minFree > 0 && ` · Grátis acima de ${formatCurrency(minFree)}`}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="rounded-2xl p-3 flex gap-3 shadow-sm"
                        style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
                      >
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex justify-between gap-2">
                            <h4 className="text-sm font-bold line-clamp-2 leading-snug" style={{ color: t.text }}>{item.name}</h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              type="button"
                              aria-label={`Remover ${item.name}`}
                              className="shrink-0 hover:text-rose-500 transition-colors"
                              style={{ color: t.textFaint }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-black" style={{ color: t.text }}>{formatCurrency(item.price * item.quantity)}</span>
                            <div
                              className="flex items-center gap-3 rounded-full px-2 py-1"
                              style={{ backgroundColor: t.surfaceMuted, border: `1px solid ${t.border}` }}
                            >
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                type="button"
                                aria-label="Diminuir quantidade"
                                className="w-7 h-7 flex items-center justify-center active:scale-90 transition-transform"
                                style={{ color: t.textMuted }}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black min-w-[16px] text-center" style={{ color: t.text }}>{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                type="button"
                                aria-label="Aumentar quantidade"
                                className="w-7 h-7 flex items-center justify-center active:scale-90 transition-transform"
                                style={{ color: t.primary }}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer form */}
                  <div className="space-y-4">
                    <SectionTitle color={t.textMuted}>Seus dados</SectionTitle>
                    <div className="space-y-3">
                      <Field label="Nome completo *" color={t.textMuted}>
                        <Input
                          value={customer.name}
                          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                          placeholder="Como devemos te chamar?"
                          className={inputClass}
                          style={inputStyle('name')}
                        />
                      </Field>
                      <Field label="Telefone (WhatsApp) *" color={t.textMuted}>
                        <Input
                          inputMode="tel"
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          placeholder="(11) 98765-4321"
                          className={inputClass}
                          style={inputStyle('phone')}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle color={t.textMuted}>Endereço de entrega</SectionTitle>
                    <div className="space-y-3">
                      <Field label="Endereço *" color={t.textMuted}>
                        <Input
                          value={customer.address}
                          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                          placeholder="Rua, número, complemento"
                          className={inputClass}
                          style={inputStyle('address')}
                        />
                      </Field>
                      <Field label="Bairro *" color={t.textMuted}>
                        <Input
                          value={customer.neighborhood}
                          onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                          placeholder="Centro"
                          className={inputClass}
                          style={inputStyle('neighborhood')}
                        />
                      </Field>
                      <Field label="Ponto de referência" color={t.textMuted}>
                        <Input
                          value={customer.reference}
                          onChange={(e) => setCustomer({ ...customer, reference: e.target.value })}
                          placeholder="Próximo ao mercado..."
                          className={inputClass}
                          style={inputStyle('reference')}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle color={t.textMuted}>Pagamento</SectionTitle>
                    <Select
                      value={customer.paymentMethod}
                      onValueChange={(v) => setCustomer({ ...customer, paymentMethod: v })}
                    >
                      <SelectTrigger
                        className="h-12 rounded-xl text-sm"
                        style={{ backgroundColor: t.surface, color: t.text, border: `1px solid ${t.border}` }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                        <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                    {customer.paymentMethod === 'Dinheiro' && (
                      <Field label="Troco para quanto?" color={t.textMuted}>
                        <Input
                          inputMode="decimal"
                          value={customer.changeFor}
                          onChange={(e) => setCustomer({ ...customer, changeFor: e.target.value })}
                          placeholder="Ex: 50"
                          className={inputClass}
                          style={inputStyle('changeFor')}
                        />
                      </Field>
                    )}
                  </div>

                  <Field label="Observação do pedido" color={t.textMuted}>
                    <Textarea
                      value={customer.generalNotes}
                      onChange={(e) => setCustomer({ ...customer, generalNotes: e.target.value })}
                      placeholder="Ex: Sem cebola, molho à parte..."
                      className="rounded-xl text-sm min-h-[80px] placeholder:opacity-50"
                      style={{ backgroundColor: t.surface, color: t.text, border: `1px solid ${t.border}` }}
                    />
                  </Field>

                  {/* Totals */}
                  <div
                    className="rounded-2xl p-4 space-y-2 shadow-sm"
                    style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
                  >
                    <Row label="Subtotal" value={formatCurrency(subtotal)} muted mutedColor={t.textMuted} textColor={t.text} />
                    <Row label="Taxa de entrega" value={deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)} muted mutedColor={t.textMuted} textColor={t.text} />
                    <div className="h-px my-2" style={{ backgroundColor: t.border }} />
                    <Row label="Total" value={formatCurrency(total)} bold accent={t.primary} textColor={t.text} />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="px-5 sm:px-6 py-4 shrink-0"
                style={{
                  borderTop: `1px solid ${t.border}`,
                  paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
                }}
              >
                <Button
                  onClick={handleSendOrder}
                  type="button"
                  className="w-full h-14 bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="font-black text-xs uppercase tracking-widest">Enviar no WhatsApp · {formatCurrency(total)}</span>
                </Button>
                <p className="text-center text-[11px] mt-3 flex items-center justify-center gap-1.5" style={{ color: t.textMuted }}>
                  <Lock className="w-3 h-3" />
                  Pedido enviado direto pelo WhatsApp
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children, color }: { label: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{label}</Label>
      {children}
    </div>
  );
}

function SectionTitle({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <h3 className="text-[11px] font-black uppercase tracking-widest" style={{ color }}>{children}</h3>
  );
}

function Row({ label, value, muted, bold, accent, textColor, mutedColor }: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  accent?: string;
  textColor?: string;
  mutedColor?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span
        className={muted ? 'text-xs font-medium' : 'text-sm font-black'}
        style={{ color: muted ? mutedColor : textColor }}
      >{label}</span>
      <span
        className={`${bold ? 'text-base font-black' : 'text-xs font-bold'}`}
        style={{ color: accent || textColor }}
      >
        {value}
      </span>
    </div>
  );
}
