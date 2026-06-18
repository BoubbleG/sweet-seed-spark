import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency, generateWhatsAppMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2, Plus, Minus, X, Clock, ShoppingCart, Lock,
  User, Phone, MapPin, Home, Navigation, Smartphone, Banknote, CreditCard,
  ArrowLeft, ArrowRight, Check, MessageSquare, Bike, Store, Ticket, Sparkles,
} from "lucide-react";
import { Restaurant } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { buildMenuTheme } from "@/lib/theme";
import { createOrder } from "@/lib/orders";
import { toast } from "sonner";
import {
  readLocalProfile,
  findRemoteProfile,
  saveCustomerProfile,
  writeLocalProfile,
  clearLocalProfile,
  deleteRemoteProfile,
} from "@/lib/customer-profile";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  isPreview?: boolean;
}

type Step = 1 | 2 | 3 | 4;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function CartDrawer({ isOpen, onClose, restaurant, isPreview = false }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>(1);
  const acceptsDelivery = restaurant.accepts_delivery !== false;
  const acceptsPickup = restaurant.accepts_pickup === true;
  const initialOrderType: "delivery" | "pickup" =
    acceptsDelivery ? "delivery" : acceptsPickup ? "pickup" : "delivery";
  const [orderType, setOrderType] = useState<"delivery" | "pickup">(initialOrderType);
  const pm = restaurant.payment_methods ?? {
    pix: true, credit_card: true, debit_card: true, cash: true, meal_voucher: false,
  };
  const paymentOptions = [
    { key: "PIX", label: "PIX", icon: <Smartphone className="w-8 h-8" />, enabled: pm.pix !== false },
    { key: "Dinheiro", label: "Dinheiro", icon: <Banknote className="w-8 h-8" />, enabled: pm.cash !== false },
    { key: "Cartão de Crédito", label: "Crédito", icon: <CreditCard className="w-8 h-8" />, enabled: pm.credit_card !== false },
    { key: "Cartão de Débito", label: "Débito", icon: <CreditCard className="w-8 h-8" />, enabled: pm.debit_card !== false },
    { key: "Vale-refeição", label: "Vale-refeição", icon: <Ticket className="w-8 h-8" />, enabled: pm.meal_voucher === true },
  ].filter((p) => p.enabled);
  const defaultPayment = paymentOptions[0]?.key ?? "PIX";
  const [customer, setCustomer] = useState(() => {
    const local = readLocalProfile(restaurant.id) ?? {};
    return {
      name: local.name ?? "",
      phone: local.phone ?? "",
      address: local.address ?? "",
      neighborhood: local.neighborhood ?? "",
      reference: local.reference ?? "",
      paymentMethod: local.paymentMethod || defaultPayment,
      changeFor: "",
      generalNotes: "",
    };
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [welcomeBack, setWelcomeBack] = useState<string | null>(null);
  const [lookupPhone, setLookupPhone] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Procura perfil pelo telefone quando o cliente acaba de digitar
  useEffect(() => {
    if (isPreview) return;
    const digits = customer.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits === lookupPhone) return;
    setLookupPhone(digits);
    let cancelled = false;
    (async () => {
      const remote = await findRemoteProfile(restaurant.id, digits);
      if (cancelled || !remote) return;
      setCustomer((prev) => ({
        ...prev,
        name: prev.name || remote.name || "",
        address: prev.address || remote.address || "",
        neighborhood: prev.neighborhood || remote.neighborhood || "",
        reference: prev.reference || remote.reference || "",
        paymentMethod: remote.paymentMethod || prev.paymentMethod,
      }));
      if (remote.name) {
        setWelcomeBack(remote.name);
        setTimeout(() => setWelcomeBack(null), 5000);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customer.phone, restaurant.id, isPreview, lookupPhone]);

  const forgetMe = async () => {
    if (!confirm("Apagar seus dados salvos deste cardápio?")) return;
    clearLocalProfile(restaurant.id);
    const digits = customer.phone.replace(/\D/g, "");
    if (digits.length >= 10) await deleteRemoteProfile(restaurant.id, digits);
    setCustomer({
      name: "",
      phone: "",
      address: "",
      neighborhood: "",
      reference: "",
      paymentMethod: defaultPayment,
      changeFor: "",
      generalNotes: "",
    });
    setWelcomeBack(null);
    toast.success("Seus dados foram apagados deste cardápio.");
  };

  const subtotal = getTotal();
  const minFree = restaurant.min_order_for_free_delivery || 0;
  const deliveryFee = orderType === "pickup"
    ? 0
    : (minFree > 0 && subtotal >= minFree ? 0 : (restaurant.delivery_fee || 0));
  const total = subtotal + deliveryFee;
  const t = buildMenuTheme(restaurant);

  const goNext = () => {
    const e: Record<string, boolean> = {};
    if (step === 2) {
      if (!customer.name.trim()) e.name = true;
      if (customer.phone.replace(/\D/g, "").length < 10) e.phone = true;
    }
    if (step === 3 && orderType === "delivery") {
      if (!customer.address.trim()) e.address = true;
      if (!customer.neighborhood.trim()) e.neighborhood = true;
    }
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => (Math.min(4, s + 1) as Step));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => (Math.max(1, s - 1) as Step));
  };

  const handleSendOrder = async () => {
    if (isPreview) {
      toast.success("Demonstração: em um cardápio real, o pedido seria enviado pelo WhatsApp agora! 🎉");
      clearCart();
      setStep(1);
      onClose();
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    // Salva local imediatamente (UX: próximo pedido já vem preenchido mesmo offline)
    writeLocalProfile(restaurant.id, {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      neighborhood: customer.neighborhood,
      reference: customer.reference,
      paymentMethod: customer.paymentMethod,
    });
    const order = await createOrder({
      restaurantId: restaurant.id,
      items,
      customer: { ...customer, orderType },
      subtotal,
      deliveryFee,
      total,
    });
    if (!order) {
      setSubmitting(false);
      toast.error("Conexão instável. Verifique sua internet e tente enviar de novo.");
      return;
    }

    // Salva o perfil remoto em segundo plano — não bloqueia o WhatsApp
    saveCustomerProfile(restaurant.id, {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      neighborhood: customer.neighborhood,
      reference: customer.reference,
      paymentMethod: customer.paymentMethod,
    }).catch(() => {});

    const orderTag = encodeURIComponent(
      `*Pedido #${String(order.order_number).padStart(4, "0")}*\n\n`,
    );
    const message = orderTag + generateWhatsAppMessage(
      restaurant.name,
      items,
      { ...customer, orderType },
      subtotal,
      deliveryFee,
      total,
      restaurant.address ?? undefined,
    );

    window.open(`https://wa.me/${restaurant.whatsapp}?text=${message}`, "_blank");
    clearCart();
    setStep(1);
    onClose();
    setSubmitting(false);
  };

  if (!isOpen) return null;

  const stepTitles: Record<Step, string> = {
    1: "Seu pedido",
    2: "Quem está pedindo?",
    3: orderType === "pickup" ? "Retirada no local" : "Onde entregar?",
    4: "Como vai pagar?",
  };

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
              <h2 className="text-base font-black" style={{ color: t.text }}>{stepTitles[step]}</h2>
              <button
                onClick={() => {
                  if (items.length > 0 && confirm('Esvaziar o pedido?')) {
                    clearCart();
                    setStep(1);
                  }
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

            {/* Stepper */}
            {items.length > 0 && (
              <Stepper step={step} theme={t} />
            )}

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
              ) : step === 1 ? (
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
                          <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex justify-between gap-2">
                            <h4 className="text-base font-bold line-clamp-2 leading-snug" style={{ color: t.text }}>
                              {item.name}{item.size ? ` (${item.size})` : ''}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              type="button"
                              aria-label={`Remover ${item.name}`}
                              className="shrink-0 w-9 h-9 -mr-1 -mt-1 flex items-center justify-center rounded-full active:scale-90 transition"
                              style={{ color: t.textFaint }}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          {item.notes && (
                            <p
                              className="text-xs mt-1 whitespace-pre-line leading-snug"
                              style={{ color: t.textMuted }}
                            >
                              {item.notes}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-black" style={{ color: t.text }}>{formatCurrency(item.price * item.quantity)}</span>
                            <div
                              className="flex items-center gap-2 rounded-full px-1.5 py-1"
                              style={{ backgroundColor: t.surfaceMuted, border: `1px solid ${t.border}` }}
                            >
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                type="button"
                                aria-label="Diminuir quantidade"
                                className="w-9 h-9 flex items-center justify-center active:scale-90 transition-transform"
                                style={{ color: t.textMuted }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-black min-w-[20px] text-center" style={{ color: t.text }}>{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                type="button"
                                aria-label="Aumentar quantidade"
                                className="w-9 h-9 flex items-center justify-center active:scale-90 transition-transform"
                                style={{ color: t.primary }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : step === 2 ? (
                <div className="space-y-5">
                  {welcomeBack && (
                    <div
                      className="rounded-2xl p-3 flex items-center gap-2 text-sm font-bold animate-in fade-in"
                      style={{
                        backgroundColor: `${t.primary}15`,
                        color: t.primary,
                        border: `2px solid ${t.primary}40`,
                      }}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Bem-vindo de volta, {welcomeBack.split(" ")[0]}! Seus dados foram preenchidos.</span>
                    </div>
                  )}
                  <BigField
                    icon={<User className="w-6 h-6" />}
                    label="Seu nome"
                    error={errors.name ? "Escreva seu nome" : undefined}
                    theme={t}
                  >
                    <Input
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Ex: Maria Silva"
                      autoFocus
                      className="h-14 rounded-2xl text-base px-4 placeholder:opacity-40"
                      style={{ backgroundColor: t.surface, color: t.text, border: `2px solid ${errors.name ? '#f43f5e' : t.border}` }}
                    />
                  </BigField>
                  <BigField
                    icon={<Phone className="w-6 h-6" />}
                    label="WhatsApp com DDD"
                    error={errors.phone ? "Telefone incompleto" : undefined}
                    theme={t}
                  >
                    <Input
                      inputMode="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: formatPhone(e.target.value) })}
                      placeholder="(11) 98765-4321"
                      className="h-14 rounded-2xl text-lg px-4 placeholder:opacity-40 tracking-wide"
                      style={{ backgroundColor: t.surface, color: t.text, border: `2px solid ${errors.phone ? '#f43f5e' : t.border}` }}
                    />
                  </BigField>
                  {(customer.name || customer.address || customer.phone) && (
                    <button
                      type="button"
                      onClick={forgetMe}
                      className="text-xs underline mx-auto block"
                      style={{ color: t.textMuted }}
                    >
                      Limpar meus dados salvos deste cardápio
                    </button>
                  )}
                </div>
              ) : step === 3 ? (
                <div className="space-y-5">
                  {acceptsDelivery && acceptsPickup && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderType("delivery")}
                        className="h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-[0.97] transition shadow-sm"
                        style={{
                          backgroundColor: orderType === "delivery" ? `${t.primary}15` : t.surface,
                          color: orderType === "delivery" ? t.primary : t.text,
                          border: `3px solid ${orderType === "delivery" ? t.primary : t.border}`,
                        }}
                      >
                        <Bike className="w-7 h-7" />
                        <span className="text-sm font-black">Entrega</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType("pickup")}
                        className="h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-[0.97] transition shadow-sm"
                        style={{
                          backgroundColor: orderType === "pickup" ? `${t.primary}15` : t.surface,
                          color: orderType === "pickup" ? t.primary : t.text,
                          border: `3px solid ${orderType === "pickup" ? t.primary : t.border}`,
                        }}
                      >
                        <Store className="w-7 h-7" />
                        <span className="text-sm font-black">Retirar no local</span>
                      </button>
                    </div>
                  )}

                  {orderType === "pickup" ? (
                    <>
                      <div
                        className="rounded-2xl p-4 shadow-sm space-y-2"
                        style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
                      >
                        <div className="flex items-center gap-2">
                          <Store className="w-5 h-5" style={{ color: t.primary }} />
                          <p className="text-sm font-black" style={{ color: t.text }}>Retire seu pedido em:</p>
                        </div>
                        {restaurant.address && (
                          <p className="text-sm" style={{ color: t.text }}>
                            {restaurant.address}{restaurant.city ? ` — ${restaurant.city}` : ''}
                          </p>
                        )}
                        {restaurant.opening_hours && (
                          <p className="text-xs flex items-center gap-1.5" style={{ color: t.textMuted }}>
                            <Clock className="w-3.5 h-3.5" />
                            {restaurant.opening_hours}
                          </p>
                        )}
                      </div>
                      <BigField
                        icon={<MessageSquare className="w-6 h-6" />}
                        label="Algum recado? (opcional)"
                        theme={t}
                      >
                        <Textarea
                          value={customer.generalNotes}
                          onChange={(e) => setCustomer({ ...customer, generalNotes: e.target.value })}
                          placeholder="Ex: sem cebola, retiro às 19h..."
                          className="rounded-2xl text-base p-4 min-h-[90px] placeholder:opacity-40"
                          style={{ backgroundColor: t.surface, color: t.text, border: `2px solid ${t.border}` }}
                        />
                      </BigField>
                    </>
                  ) : (
                  <>
                  <BigField
                    icon={<Home className="w-6 h-6" />}
                    label="Rua e número"
                    error={errors.address ? "Diga onde entregar" : undefined}
                    theme={t}
                  >
                    <Input
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      placeholder="Ex: Rua das Flores, 123"
                      autoFocus
                      className="h-14 rounded-2xl text-base px-4 placeholder:opacity-40"
                      style={{ backgroundColor: t.surface, color: t.text, border: `2px solid ${errors.address ? '#f43f5e' : t.border}` }}
                    />
                  </BigField>
                  <BigField
                    icon={<MapPin className="w-6 h-6" />}
                    label="Bairro"
                    error={errors.neighborhood ? "Falta o bairro" : undefined}
                    theme={t}
                  >
                    <Input
                      value={customer.neighborhood}
                      onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                      placeholder="Ex: Centro"
                      className="h-14 rounded-2xl text-base px-4 placeholder:opacity-40"
                      style={{ backgroundColor: t.surface, color: t.text, border: `2px solid ${errors.neighborhood ? '#f43f5e' : t.border}` }}
                    />
                  </BigField>
                  <BigField
                    icon={<Navigation className="w-6 h-6" />}
                    label="Ponto de referência (opcional)"
                    theme={t}
                  >
                    <Input
                      value={customer.reference}
                      onChange={(e) => setCustomer({ ...customer, reference: e.target.value })}
                      placeholder="Ex: Em frente à padaria"
                      className="h-14 rounded-2xl text-base px-4 placeholder:opacity-40"
                      style={{ backgroundColor: t.surface, color: t.text, border: `2px solid ${t.border}` }}
                    />
                  </BigField>
                  <BigField
                    icon={<MessageSquare className="w-6 h-6" />}
                    label="Algum recado? (opcional)"
                    theme={t}
                  >
                    <Textarea
                      value={customer.generalNotes}
                      onChange={(e) => setCustomer({ ...customer, generalNotes: e.target.value })}
                      placeholder="Ex: sem cebola, molho à parte..."
                      className="rounded-2xl text-base p-4 min-h-[90px] placeholder:opacity-40"
                      style={{ backgroundColor: t.surface, color: t.text, border: `2px solid ${t.border}` }}
                    />
                  </BigField>
                  </>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: t.textMuted }}>
                      Escolha como pagar
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentOptions.map((p) => (
                        <PaymentCard
                          key={p.key}
                          label={p.label}
                          icon={p.icon}
                          selected={customer.paymentMethod === p.key}
                          onClick={() => setCustomer({ ...customer, paymentMethod: p.key })}
                          theme={t}
                        />
                      ))}
                    </div>
                  </div>

                  {customer.paymentMethod === "Dinheiro" && (
                    <div className="space-y-3">
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: t.textMuted }}>
                        Precisa de troco?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {["20", "50", "100", "sem"].map((v) => {
                          const label = v === "sem" ? "Sem troco" : `R$ ${v}`;
                          const value = v === "sem" ? "Não preciso" : v;
                          const active = customer.changeFor === value;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setCustomer({ ...customer, changeFor: value })}
                              className="h-12 rounded-2xl text-sm font-black active:scale-95 transition"
                              style={{
                                backgroundColor: active ? t.primary : t.surface,
                                color: active ? t.onPrimary : t.text,
                                border: `2px solid ${active ? t.primary : t.border}`,
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <Input
                        inputMode="decimal"
                        value={customer.changeFor}
                        onChange={(e) => setCustomer({ ...customer, changeFor: e.target.value })}
                        placeholder="Outro valor..."
                        className="h-14 rounded-2xl text-base px-4 placeholder:opacity-40"
                        style={{ backgroundColor: t.surface, color: t.text, border: `2px solid ${t.border}` }}
                      />
                    </div>
                  )}

                  {/* Big totals */}
                  <div
                    className="rounded-2xl p-5 shadow-sm"
                    style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
                  >
                    <div className="flex justify-between text-sm mb-1.5" style={{ color: t.textMuted }}>
                      <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                    </div>
                    {orderType === "pickup" ? (
                      <div className="flex justify-between text-sm" style={{ color: t.textMuted }}>
                        <span>Retirada no local</span><span>Sem taxa</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm" style={{ color: t.textMuted }}>
                        <span>Entrega</span><span>{deliveryFee === 0 ? "Grátis" : formatCurrency(deliveryFee)}</span>
                      </div>
                    )}
                    <div className="h-px my-3" style={{ backgroundColor: t.border }} />
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-black uppercase tracking-widest" style={{ color: t.text }}>Total</span>
                      <span className="text-3xl font-black" style={{ color: t.primary }}>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
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
                <div className="flex gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="h-16 px-5 rounded-2xl flex items-center justify-center gap-2 font-black text-sm active:scale-[0.98] transition"
                      style={{ backgroundColor: t.surface, color: t.text, border: `2px solid ${t.border}` }}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Voltar
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex-1 h-16 rounded-2xl flex items-center justify-center gap-2 font-black text-base shadow-lg active:scale-[0.98] transition"
                      style={{ backgroundColor: t.primary, color: t.onPrimary }}
                    >
                      Continuar
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOrder}
                      disabled={submitting}
                      className="flex-1 h-16 bg-[#25D366] hover:bg-[#1ebe5b] disabled:opacity-70 disabled:cursor-wait text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg font-black text-base active:scale-[0.98] transition"
                    >
                      {submitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Enviando…
                        </>
                      ) : (
                        <>
                          <Check className="w-6 h-6" />
                          Enviar pedido
                        </>
                      )}
                    </button>
                  )}
                </div>
                {step === 4 && (
                  <p className="text-center text-[11px] mt-3 flex items-center justify-center gap-1.5" style={{ color: t.textMuted }}>
                    <Lock className="w-3 h-3" />
                    Enviado direto pelo WhatsApp · {formatCurrency(total)}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

type Theme = ReturnType<typeof buildMenuTheme>;

function Stepper({ step, theme: t }: { step: Step; theme: Theme }) {
  const labels = ["Itens", "Você", "Entrega", "Pagar"];
  return (
    <div className="px-5 sm:px-6 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${t.border}` }}>
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition"
              style={{
                backgroundColor: active || done ? t.primary : t.surface,
                color: active || done ? t.onPrimary : t.textMuted,
                border: `2px solid ${active || done ? t.primary : t.border}`,
              }}
            >
              {done ? <Check className="w-4 h-4" /> : n}
            </div>
            {active && (
              <span className="text-xs font-black" style={{ color: t.text }}>{label}</span>
            )}
            {i < labels.length - 1 && (
              <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: done ? t.primary : t.border }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BigField({
  icon, label, error, theme: t, children,
}: {
  icon: React.ReactNode;
  label: string;
  error?: string;
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-black" style={{ color: t.text }}>
        <span style={{ color: t.primary }}>{icon}</span>
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs font-bold text-rose-500 ml-1">{error}</p>
      )}
    </div>
  );
}

function PaymentCard({
  label, icon, selected, onClick, theme: t,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  theme: Theme;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-28 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-[0.97] transition shadow-sm"
      style={{
        backgroundColor: selected ? `${t.primary}15` : t.surface,
        color: selected ? t.primary : t.text,
        border: `3px solid ${selected ? t.primary : t.border}`,
      }}
    >
      {selected && (
        <span
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: t.primary, color: t.onPrimary }}
        >
          <Check className="w-4 h-4" />
        </span>
      )}
      {icon}
      <span className="text-sm font-black">{label}</span>
    </button>
  );
}
