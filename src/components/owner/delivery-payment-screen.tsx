import { useEffect, useState } from "react";
import { Restaurant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SectionShell, SectionCard, StickySaveBar, Field, Toggle } from "./shared";
import { Truck, CreditCard } from "lucide-react";
import { recordSnapshot } from "@/lib/snapshots";

export function OwnerDeliveryPaymentScreen({
  restaurant,
  onBack,
}: {
  restaurant: Restaurant;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Restaurant>>(restaurant);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(restaurant), [restaurant.id]);

  const pm = (form.payment_methods ?? {
    pix: true, credit_card: true, debit_card: true, cash: true, meal_voucher: false,
  }) as NonNullable<Restaurant["payment_methods"]>;
  const setPm = (key: keyof NonNullable<Restaurant["payment_methods"]>, value: boolean) =>
    setForm({ ...form, payment_methods: { ...pm, [key]: value } });

  const save = async () => {
    const acceptsDelivery = form.accepts_delivery !== false;
    const acceptsPickup = form.accepts_pickup === true;
    if (!acceptsDelivery && !acceptsPickup) {
      toast.error("Ative ao menos uma opção: entrega ou retirada.");
      return;
    }
    const anyPayment = Object.values(pm).some(Boolean);
    if (!anyPayment) {
      toast.error("Ative ao menos uma forma de pagamento.");
      return;
    }
    setSaving(true);
    setSaved(false);
    await recordSnapshot(restaurant.id, "Alterou entrega e pagamento", "delivery");
    const { error } = await supabase
      .from("restaurants")
      .update({
        accepts_delivery: acceptsDelivery,
        accepts_pickup: acceptsPickup,
        delivery_fee: Number(form.delivery_fee) || 0,
        min_order_for_free_delivery: form.min_order_for_free_delivery
          ? Number(form.min_order_for_free_delivery)
          : null,
        average_delivery_time: form.average_delivery_time ?? null,
        payment_methods: pm,
      })
      .eq("id", restaurant.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["restaurant-by-token"] });
    qc.invalidateQueries({ queryKey: ["restaurant", restaurant.slug] });
    setSaved(true);
    toast.success("Salvo!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SectionShell
      title="Entrega e Pagamento"
      subtitle="Ative entrega, retirada e formas de pagamento"
      onBack={onBack}
    >
      <SectionCard title="Entrega" icon={<Truck className="w-4 h-4" />}>
        <Toggle
          label="Aceitar entrega"
          hint="Cliente informa endereço."
          checked={form.accepts_delivery !== false}
          onChange={(v) => setForm({ ...form, accepts_delivery: v })}
        />
        <Toggle
          label="Aceitar retirada no local"
          hint="Cliente retira no endereço do restaurante."
          checked={form.accepts_pickup === true}
          onChange={(v) => setForm({ ...form, accepts_pickup: v })}
        />
        <Field label="Taxa de entrega" hint="Em reais. Deixe 0 para grátis.">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
              R$
            </span>
            <input
              inputMode="decimal"
              value={form.delivery_fee ?? 0}
              onChange={(e) =>
                setForm({ ...form, delivery_fee: Number(e.target.value) })
              }
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </Field>
        <Field label="Pedido mínimo para frete grátis (opcional)">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
              R$
            </span>
            <input
              inputMode="decimal"
              value={form.min_order_for_free_delivery ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  min_order_for_free_delivery:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              placeholder="Ex.: 50"
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </Field>
        <Field label="Tempo médio de entrega" hint="Ex.: 30-45 min">
          <input
            value={form.average_delivery_time || ""}
            onChange={(e) =>
              setForm({ ...form, average_delivery_time: e.target.value })
            }
            placeholder="30-45 min"
            className="w-full h-14 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </Field>
      </SectionCard>

      <SectionCard title="Formas de pagamento" icon={<CreditCard className="w-4 h-4" />}>
        <p className="text-xs text-zinc-500 -mt-1 mb-1">
          Ative as opções que você aceita. Só elas aparecem no checkout do cliente.
        </p>
        <Toggle label="PIX" checked={pm.pix !== false} onChange={(v) => setPm("pix", v)} />
        <Toggle label="Cartão de Crédito" checked={pm.credit_card !== false} onChange={(v) => setPm("credit_card", v)} />
        <Toggle label="Cartão de Débito" checked={pm.debit_card !== false} onChange={(v) => setPm("debit_card", v)} />
        <Toggle label="Dinheiro" checked={pm.cash !== false} onChange={(v) => setPm("cash", v)} />
        <Toggle label="Vale-refeição" checked={pm.meal_voucher === true} onChange={(v) => setPm("meal_voucher", v)} />
      </SectionCard>

      <StickySaveBar saving={saving} saved={saved} onSave={save} />
    </SectionShell>
  );
}