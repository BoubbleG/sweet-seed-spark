import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  ArrowLeft, ArrowRight, ShoppingBag, Plus, Minus, Check, MapPin, CreditCard, Banknote,
  QrCode, Truck, Store, MessageCircle, Sparkles, Flame, Leaf, UtensilsCrossed, X, Loader2,
} from "lucide-react";

/* ============ DATA ============ */

type Item = { id: string; name: string; desc: string; price: number; img: string; tag?: string };
const CATS = [
  { id: "burgers", label: "Hambúrgueres", icon: Flame },
  { id: "pizzas", label: "Pizzas", icon: UtensilsCrossed },
  { id: "salads", label: "Saladas", icon: Leaf },
  { id: "drinks", label: "Bebidas", icon: ShoppingBag },
] as const;

const MENU: Record<string, Item[]> = {
  burgers: [
    { id: "b1", name: "Smash Truffle", desc: "Dois smash, cheddar inglês, maionese de trufa.", price: 39.9, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", tag: "Top" },
    { id: "b2", name: "Bacon Royale", desc: "Blend 180g, bacon crocante, geléia de bacon.", price: 42, img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&q=80" },
    { id: "b3", name: "Classic Master", desc: "Carne 160g, queijo prato, molho da casa.", price: 32, img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80" },
  ],
  pizzas: [
    { id: "p1", name: "Margherita D.O.P.", desc: "San Marzano, búfala, manjericão.", price: 58, img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80", tag: "Clássica" },
    { id: "p2", name: "Pepperoni Fire", desc: "Pepperoni, mel apimentado, fior di latte.", price: 64, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80" },
  ],
  salads: [
    { id: "s1", name: "Caesar Premium", desc: "Frango grelhado, croutons, parmesão.", price: 34, img: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80" },
    { id: "s2", name: "Buddha Bowl", desc: "Quinoa, grão-de-bico, abacate, tahine.", price: 38.9, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80", tag: "Fit" },
  ],
  drinks: [
    { id: "d1", name: "Limonada Suíça", desc: "Limão siciliano e leite condensado.", price: 12, img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80" },
    { id: "d2", name: "Coca-Cola 350ml", desc: "Lata gelada.", price: 7, img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80" },
  ],
};

const BUMPS: Array<{ id: string; name: string; img: string; from: number; price: number; tag: string }> = [
  { id: "bump1", name: "Batata Rústica c/ Cheddar", img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80", from: 22, price: 14, tag: "−36%" },
  { id: "bump2", name: "Brownie c/ Sorvete", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80", from: 24, price: 16, tag: "Combo" },
  { id: "bump3", name: "Molho da Casa Extra", img: "https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=600&q=80", from: 8, price: 4, tag: "−50%" },
  { id: "bump4", name: "Refri 600ml Gelado", img: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=600&q=80", from: 12, price: 9, tag: "Oferta" },
];

const formatBRL = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

/* ============ VALIDATION ============ */

const addressSchema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido (use 00000-000)"),
  street: z.string().trim().min(3, "Informe a rua").max(120),
  number: z.string().trim().min(1, "Número obrigatório").max(10),
  district: z.string().trim().min(2, "Informe o bairro").max(60),
  complement: z.string().trim().max(60).optional().or(z.literal("")),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
});

/* ============ COMPONENT ============ */

type PaymentMethod = "pix" | "credit" | "debit" | "cash";

export function DemoCheckoutFlow({ open, onOpenChange, onCreateCta }: { open: boolean; onOpenChange: (o: boolean) => void; onCreateCta: () => void }) {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<Record<string, { item: Item; qty: number }>>({});
  const [cat, setCat] = useState<string>("burgers");
  const [bumps, setBumps] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState({ cep: "", street: "", number: "", complement: "", district: "", reference: "" });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [cardData, setCardData] = useState({ number: "", exp: "", cvv: "", name: "" });
  const [changeFor, setChangeFor] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // reset when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1); setCart({}); setBumps(new Set()); setMode("delivery");
        setAddress({ cep: "", street: "", number: "", complement: "", district: "", reference: "" });
        setAddressErrors({}); setPayment(null); setCardData({ number: "", exp: "", cvv: "", name: "" });
        setChangeFor(""); setSending(false); setSent(false);
      }, 300);
    }
  }, [open]);

  const cartEntries = Object.values(cart);
  const totalQty = cartEntries.reduce((s, e) => s + e.qty, 0);
  const subtotalItems = cartEntries.reduce((s, e) => s + e.item.price * e.qty, 0);
  const bumpsTotal = useMemo(() => Array.from(bumps).reduce((s, id) => s + (BUMPS.find(b => b.id === id)?.price ?? 0), 0), [bumps]);
  const subtotal = subtotalItems + bumpsTotal;
  const deliveryFee = mode === "delivery" && subtotal > 0 ? 7.9 : 0;
  const pixDiscount = payment === "pix" ? subtotal * 0.05 : 0;
  const total = subtotal + deliveryFee - pixDiscount;

  const add = (it: Item) => setCart(p => ({ ...p, [it.id]: { item: it, qty: (p[it.id]?.qty ?? 0) + 1 } }));
  const sub = (id: string) => setCart(p => {
    const e = p[id]; if (!e) return p;
    if (e.qty <= 1) { const { [id]: _, ...rest } = p; return rest; }
    return { ...p, [id]: { ...e, qty: e.qty - 1 } };
  });
  const toggleBump = (id: string) => setBumps(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const formatCEP = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  const formatCardNumber = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExp = (v: string) => v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");

  const validateAddress = () => {
    if (mode === "pickup") return true;
    const r = addressSchema.safeParse(address);
    if (r.success) { setAddressErrors({}); return true; }
    const errs: Record<string, string> = {};
    r.error.issues.forEach(i => { const k = i.path[0] as string; if (!errs[k]) errs[k] = i.message; });
    setAddressErrors(errs);
    return false;
  };

  const canContinue = () => {
    if (step === 1) return totalQty > 0;
    if (step === 3) return mode === "pickup" || addressSchema.safeParse(address).success;
    if (step === 4) return !!payment;
    return true;
  };

  const next = () => {
    if (step === 3 && !validateAddress()) return;
    if (step < 5) setStep(s => s + 1);
  };
  const back = () => step > 1 && setStep(s => s - 1);

  const sendOrder = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1500);
  };

  const STEPS = ["Cardápio", "Sugestões", "Entrega", "Pagamento", "Revisão"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 max-w-full w-screen h-[100dvh] sm:h-[90vh] sm:max-w-md sm:rounded-3xl overflow-hidden border-0 sm:border bg-zinc-50 flex flex-col [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Simulação de pedido — Bistro Master</DialogTitle>
        <DialogDescription className="sr-only">Demonstração interativa de um pedido completo, do cardápio ao checkout.</DialogDescription>

        {/* HEADER */}
        <header className="bg-white border-b border-zinc-100 px-4 pt-4 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => (step > 1 && !sent ? back() : onOpenChange(false))}
              className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center active:scale-95 transition-transform"
              aria-label={step > 1 && !sent ? "Voltar" : "Fechar"}
            >
              {step > 1 && !sent ? <ArrowLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
            <div className="text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Passo {step}/5</div>
              <div className="text-sm font-black text-zinc-900">{STEPS[step - 1]}</div>
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              {totalQty > 0 && !sent && (
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-zinc-700" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">{totalQty}</span>
                </div>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? "bg-emerald-500" : "bg-zinc-200"}`} />
            ))}
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait">
            {sent ? (
              <SuccessScreen key="success" total={total} onCreateCta={() => { onOpenChange(false); onCreateCta(); }} onClose={() => onOpenChange(false)} />
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-4 pb-8"
              >
                {step === 1 && <StepMenu cat={cat} setCat={setCat} cart={cart} add={add} sub={sub} />}
                {step === 2 && <StepBumps bumps={bumps} toggle={toggleBump} />}
                {step === 3 && <StepAddress mode={mode} setMode={setMode} address={address} setAddress={setAddress} errors={addressErrors} formatCEP={formatCEP} />}
                {step === 4 && (
                  <StepPayment
                    payment={payment} setPayment={setPayment}
                    card={cardData} setCard={setCardData}
                    changeFor={changeFor} setChangeFor={setChangeFor}
                    formatCardNumber={formatCardNumber} formatExp={formatExp}
                    subtotal={subtotal} deliveryFee={deliveryFee} pixDiscount={pixDiscount} total={total}
                  />
                )}
                {step === 5 && (
                  <StepReview
                    cart={cart} bumps={bumps} mode={mode} address={address}
                    payment={payment} cardData={cardData} changeFor={changeFor}
                    subtotal={subtotal} deliveryFee={deliveryFee} pixDiscount={pixDiscount} total={total}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        {!sent && (
          <footer className="bg-white border-t border-zinc-100 p-4 shrink-0 [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
            {step > 1 && subtotal > 0 && (
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-zinc-500 font-medium">Total parcial</span>
                <span className="text-zinc-900 font-black text-lg tabular-nums">{formatBRL(total)}</span>
              </div>
            )}
            {step < 5 ? (
              <button
                onClick={next}
                disabled={!canContinue()}
                className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-xs inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:bg-zinc-200 disabled:text-zinc-400 shadow-lg shadow-zinc-900/10"
              >
                {step === 1 && totalQty === 0 ? "Adicione itens" : "Continuar"} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={sendOrder}
                disabled={sending}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black uppercase tracking-widest text-xs inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-emerald-500/30 disabled:opacity-70"
              >
                {sending ? (<><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>) : (<><MessageCircle className="w-5 h-5" /> Enviar no WhatsApp</>)}
              </button>
            )}
          </footer>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============ STEP 1: MENU ============ */
function StepMenu({ cat, setCat, cart, add, sub }: any) {
  const items: Item[] = MENU[cat];
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Monte seu pedido</h2>
        <p className="text-sm text-zinc-500 font-medium">Toque em + para adicionar.</p>
      </div>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-none">
        {CATS.map(c => {
          const I = c.icon; const active = c.id === cat;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 h-11 rounded-full text-sm font-bold transition-all ${active ? "bg-zinc-900 text-white shadow-lg" : "bg-white border border-zinc-200 text-zinc-600"}`}>
              <I className="w-4 h-4" /> {c.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-3">
        {items.map(it => {
          const e = cart[it.id];
          return (
            <article key={it.id} className={`flex gap-3 p-3 rounded-2xl bg-white border transition-colors ${e ? "border-emerald-300 ring-2 ring-emerald-100" : "border-zinc-100"}`}>
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                <img src={it.img} alt={it.name} className="w-full h-full object-cover" />
                {it.tag && <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/95 text-[8px] font-black uppercase rounded">{it.tag}</span>}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-black text-zinc-900 text-base truncate">{it.name}</h3>
                <p className="text-xs text-zinc-500 font-medium line-clamp-2 mb-2">{it.desc}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-black text-zinc-900">{formatBRL(it.price)}</span>
                  {e ? (
                    <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full p-1">
                      <button onClick={() => sub(it.id)} className="w-8 h-8 rounded-full bg-white text-emerald-700 active:scale-90"><Minus className="w-4 h-4 mx-auto" /></button>
                      <span className="font-black text-emerald-700 min-w-[1.5ch] text-center">{e.qty}</span>
                      <button onClick={() => add(it)} className="w-8 h-8 rounded-full bg-emerald-500 text-white active:scale-90"><Plus className="w-4 h-4 mx-auto" /></button>
                    </div>
                  ) : (
                    <button onClick={() => add(it)} className="w-11 h-11 rounded-full bg-zinc-900 text-white active:scale-90 shadow-md" aria-label={`Adicionar ${it.name}`}><Plus className="w-5 h-5 mx-auto" /></button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ============ STEP 2: BUMPS ============ */
function StepBumps({ bumps, toggle }: { bumps: Set<string>; toggle: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Aproveite e adicione</h2>
      </div>
      <p className="text-sm text-zinc-500 font-medium -mt-2">Ofertas exclusivas só para este pedido.</p>
      <div className="space-y-3">
        {BUMPS.map(b => {
          const added = bumps.has(b.id);
          return (
            <article key={b.id} className={`relative flex gap-3 p-3 rounded-2xl bg-white border-2 transition-all ${added ? "border-emerald-500 shadow-lg shadow-emerald-500/10" : "border-zinc-100"}`}>
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                <img src={b.img} alt={b.name} className="w-full h-full object-cover" />
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-amber-400 text-zinc-900 text-[9px] font-black uppercase rounded">{b.tag}</span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-black text-zinc-900 text-base truncate">{b.name}</h3>
                <div className="flex items-baseline gap-2 mt-1 mb-2">
                  <span className="text-xs text-zinc-400 line-through">{formatBRL(b.from)}</span>
                  <span className="text-lg font-black text-emerald-600 animate-pulse">{formatBRL(b.price)}</span>
                </div>
                <button
                  onClick={() => toggle(b.id)}
                  className={`mt-auto h-11 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all inline-flex items-center justify-center gap-2 ${added ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-700"}`}
                >
                  {added ? (<><Check className="w-4 h-4" /> Adicionado</>) : (<><Plus className="w-4 h-4" /> Adicionar</>)}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="text-[11px] text-zinc-400 text-center font-medium pt-2">Você pode pular esta etapa se preferir.</p>
    </div>
  );
}

/* ============ STEP 3: ADDRESS ============ */
function StepAddress({ mode, setMode, address, setAddress, errors, formatCEP }: any) {
  const upd = (k: string, v: string) => setAddress((p: any) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Como você vai receber?</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setMode("delivery")} className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${mode === "delivery" ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-white"}`}>
          <Truck className={`w-7 h-7 mb-2 ${mode === "delivery" ? "text-emerald-600" : "text-zinc-400"}`} />
          <div className="font-black text-zinc-900">Entrega</div>
          <div className="text-[11px] text-zinc-500 font-medium">30-45 min · R$ 7,90</div>
        </button>
        <button onClick={() => setMode("pickup")} className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${mode === "pickup" ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-white"}`}>
          <Store className={`w-7 h-7 mb-2 ${mode === "pickup" ? "text-emerald-600" : "text-zinc-400"}`} />
          <div className="font-black text-zinc-900">Retirar</div>
          <div className="text-[11px] text-zinc-500 font-medium">20 min · Grátis</div>
        </button>
      </div>

      {mode === "delivery" && (
        <div className="space-y-3 bg-white p-4 rounded-2xl border border-zinc-100">
          <Field label="CEP" error={errors.cep}>
            <input
              id="addr-cep" inputMode="numeric" placeholder="00000-000"
              value={address.cep} onChange={e => upd("cep", formatCEP(e.target.value))}
              className="h-14 w-full rounded-xl border border-zinc-200 px-4 text-base font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              maxLength={9}
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Rua" error={errors.street}>
                <input id="addr-street" value={address.street} onChange={e => upd("street", e.target.value)} placeholder="Av. Brasil"
                  className="h-14 w-full rounded-xl border border-zinc-200 px-4 text-base font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" maxLength={120} />
              </Field>
            </div>
            <Field label="Número" error={errors.number}>
              <input id="addr-number" inputMode="numeric" value={address.number} onChange={e => upd("number", e.target.value)} placeholder="123"
                className="h-14 w-full rounded-xl border border-zinc-200 px-4 text-base font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" maxLength={10} />
            </Field>
          </div>
          <Field label="Bairro" error={errors.district}>
            <input id="addr-district" value={address.district} onChange={e => upd("district", e.target.value)} placeholder="Vila Madalena"
              className="h-14 w-full rounded-xl border border-zinc-200 px-4 text-base font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" maxLength={60} />
          </Field>
          <Field label="Complemento (opcional)">
            <input id="addr-complement" value={address.complement} onChange={e => upd("complement", e.target.value)} placeholder="Apto 42, Bloco B"
              className="h-14 w-full rounded-xl border border-zinc-200 px-4 text-base font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" maxLength={60} />
          </Field>
          <Field label="Ponto de referência (opcional)">
            <input id="addr-reference" value={address.reference} onChange={e => upd("reference", e.target.value)} placeholder="Próximo ao mercado"
              className="h-14 w-full rounded-xl border border-zinc-200 px-4 text-base font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" maxLength={120} />
          </Field>
        </div>
      )}

      {mode === "pickup" && (
        <div className="p-5 rounded-2xl bg-white border border-zinc-100 flex gap-3 items-start">
          <MapPin className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-zinc-900">Bistro Master</div>
            <div className="text-sm text-zinc-500 font-medium">Rua Aspicuelta, 421 — Vila Madalena, SP</div>
            <div className="text-xs text-emerald-600 font-bold mt-2">Pronto para retirada em ~20 min</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs font-bold text-red-500 mt-1">{error}</span>}
    </label>
  );
}

/* ============ STEP 4: PAYMENT ============ */
function StepPayment({ payment, setPayment, card, setCard, changeFor, setChangeFor, formatCardNumber, formatExp, subtotal, deliveryFee, pixDiscount, total }: any) {
  const methods: Array<{ id: PaymentMethod; label: string; icon: any; badge?: string; color: string }> = [
    { id: "pix", label: "PIX", icon: QrCode, badge: "5% OFF", color: "bg-emerald-500" },
    { id: "credit", label: "Cartão de Crédito", icon: CreditCard, color: "bg-blue-500" },
    { id: "debit", label: "Cartão de Débito", icon: CreditCard, color: "bg-violet-500" },
    { id: "cash", label: "Dinheiro", icon: Banknote, color: "bg-amber-500" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight text-zinc-900">Forma de pagamento</h2>

      {/* Resumo */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 space-y-1.5 text-sm">
        <Row k="Subtotal" v={formatBRL(subtotal)} />
        {deliveryFee > 0 && <Row k="Entrega" v={formatBRL(deliveryFee)} />}
        {pixDiscount > 0 && <Row k="Desconto PIX" v={`− ${formatBRL(pixDiscount)}`} accent />}
        <div className="flex justify-between pt-2 border-t border-zinc-100">
          <span className="font-black text-zinc-900">Total</span>
          <span className="font-black text-xl text-emerald-600 tabular-nums">{formatBRL(total)}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {methods.map(m => {
          const I = m.icon; const active = payment === m.id;
          return (
            <button key={m.id} onClick={() => setPayment(m.id)}
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 active:scale-[0.98] transition-all ${active ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-white"}`}>
              <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center text-white shrink-0`}><I className="w-6 h-6" /></div>
              <div className="flex-1 text-left">
                <div className="font-black text-zinc-900">{m.label}</div>
                {m.badge && <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded">{m.badge}</span>}
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? "bg-emerald-500 border-emerald-500" : "border-zinc-300"}`}>
                {active && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {payment === "pix" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 items-start">
          <QrCode className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-zinc-900 text-sm">Pagamento via PIX</div>
            <p className="text-xs text-zinc-600 font-medium mt-1">A chave PIX será enviada pelo WhatsApp junto com a confirmação do pedido. Você ganha <span className="font-black text-emerald-700">5% de desconto</span>.</p>
          </div>
        </div>
      )}

      {(payment === "credit" || payment === "debit") && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 items-start">
          <CreditCard className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-zinc-900 text-sm">Pagamento na entrega</div>
            <p className="text-xs text-zinc-600 font-medium mt-1">Você passará o cartão na maquininha quando o pedido chegar. Sem dados sensíveis aqui — mais segurança para você.</p>
          </div>
        </div>
      )}

      {payment === "cash" && (
        <div className="bg-white border border-zinc-100 rounded-2xl p-4">
          <Field label="Precisa de troco para quanto? (opcional)">
            <input id="cash-change" inputMode="decimal" placeholder="Ex: 100,00" value={changeFor}
              onChange={e => setChangeFor(e.target.value.replace(/[^\d,]/g, "").slice(0, 10))}
              className="h-14 w-full rounded-xl border border-zinc-200 px-4 text-base font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
          </Field>
        </div>
      )}
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500 font-medium">{k}</span>
      <span className={`tabular-nums font-bold ${accent ? "text-emerald-600" : "text-zinc-900"}`}>{v}</span>
    </div>
  );
}

/* ============ STEP 5: REVIEW ============ */
function StepReview({ cart, bumps, mode, address, payment, cardData, changeFor, subtotal, deliveryFee, pixDiscount, total }: any) {
  const entries = Object.values(cart) as Array<{ item: Item; qty: number }>;
  const bumpItems = Array.from(bumps as Set<string>).map(id => BUMPS.find(b => b.id === id)!).filter(Boolean);
  const payLabel = { pix: "PIX (5% OFF) — chave enviada no WhatsApp", credit: "Cartão de Crédito (na entrega)", debit: "Cartão de Débito (na entrega)", cash: `Dinheiro${changeFor ? ` (troco p/ R$ ${changeFor})` : ""}` }[payment as PaymentMethod];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight text-zinc-900">Revise seu pedido</h2>

      <Section title="Itens">
        <ul className="space-y-2 text-sm">
          {entries.map(e => (
            <li key={e.item.id} className="flex justify-between gap-2">
              <span className="text-zinc-700 font-medium truncate">{e.qty}× {e.item.name}</span>
              <span className="font-bold text-zinc-900 tabular-nums shrink-0">{formatBRL(e.item.price * e.qty)}</span>
            </li>
          ))}
          {bumpItems.map(b => (
            <li key={b.id} className="flex justify-between gap-2">
              <span className="text-emerald-700 font-medium truncate">＋ {b.name}</span>
              <span className="font-bold text-emerald-700 tabular-nums shrink-0">{formatBRL(b.price)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={mode === "delivery" ? "Entrega" : "Retirada"} icon={mode === "delivery" ? Truck : Store}>
        {mode === "delivery" ? (
          <p className="text-sm text-zinc-700 font-medium leading-relaxed">
            {address.street}, {address.number}{address.complement ? ` — ${address.complement}` : ""}<br />
            {address.district} · CEP {address.cep}
            {address.reference && <><br /><span className="text-zinc-500">Ref: {address.reference}</span></>}
          </p>
        ) : (
          <p className="text-sm text-zinc-700 font-medium">Rua Aspicuelta, 421 — Vila Madalena, SP</p>
        )}
      </Section>

      <Section title="Pagamento" icon={CreditCard}>
        <p className="text-sm text-zinc-700 font-medium">{payLabel}</p>
      </Section>

      <Section title="Valores">
        <div className="space-y-1.5 text-sm">
          <Row k="Subtotal" v={formatBRL(subtotal)} />
          {deliveryFee > 0 && <Row k="Entrega" v={formatBRL(deliveryFee)} />}
          {pixDiscount > 0 && <Row k="Desconto PIX" v={`− ${formatBRL(pixDiscount)}`} accent />}
          <div className="flex justify-between pt-2 border-t border-zinc-100">
            <span className="font-black text-zinc-900 text-base">Total</span>
            <span className="font-black text-2xl text-emerald-600 tabular-nums">{formatBRL(total)}</span>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ============ SUCCESS ============ */
function SuccessScreen({ total, onCreateCta, onClose }: { total: number; onCreateCta: () => void; onClose: () => void }) {
  const orderNum = useMemo(() => Math.floor(1000 + Math.random() * 9000), []);
  return (
    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 min-h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }} className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <Check className="w-14 h-14 text-emerald-600" strokeWidth={3} />
        </motion.div>
        <h2 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">Pedido enviado!</h2>
        <p className="text-zinc-500 font-medium mb-6 max-w-xs">O restaurante recebeu seu pedido <span className="font-black text-zinc-900">#{orderNum}</span> pelo WhatsApp e já está preparando.</p>
        <div className="bg-white border border-zinc-100 rounded-2xl p-5 w-full max-w-xs space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 font-medium">Tempo estimado</span>
            <span className="font-black text-zinc-900">30-45 min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 font-medium">Total pago</span>
            <span className="font-black text-emerald-600 tabular-nums">{formatBRL(total)}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 pt-4">
        <button onClick={onCreateCta} className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-xs inline-flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg">
          Quero um cardápio assim <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onClose} className="w-full h-12 rounded-2xl bg-transparent text-zinc-500 font-bold text-sm">Fechar</button>
      </div>
    </motion.div>
  );
}