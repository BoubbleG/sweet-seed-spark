import { useEffect, useState } from "react";
import { Restaurant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SectionShell, SectionCard, StickySaveBar } from "./shared";
import { Phone, MapPin, Clock, Truck, AtSign, Store } from "lucide-react";

export function OwnerInfoScreen({
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

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("restaurants")
      .update({
        name: form.name,
        description: form.description ?? null,
        whatsapp: form.whatsapp,
        address: form.address ?? null,
        city: form.city ?? null,
        opening_hours: form.opening_hours ?? null,
        delivery_fee: Number(form.delivery_fee) || 0,
        min_order_for_free_delivery: form.min_order_for_free_delivery
          ? Number(form.min_order_for_free_delivery)
          : null,
        average_delivery_time: form.average_delivery_time ?? null,
        instagram: form.instagram ?? null,
        status: form.status,
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
    toast.success("Informações atualizadas!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SectionShell
      title="Meu restaurante"
      subtitle="Contato, endereço e entrega"
      onBack={onBack}
    >
      <SectionCard title="Identificação" icon={<Store className="w-4 h-4" />}>
        <Field label="Nome do restaurante">
          <input
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full h-14 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </Field>
        <Field label="Descrição curta" hint="Aparece no topo do cardápio.">
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
          />
        </Field>
      </SectionCard>

      <SectionCard title="Contato" icon={<Phone className="w-4 h-4" />}>
        <Field label="WhatsApp" hint="Ex.: 11 99999-9999. Sem espaços extras.">
          <input
            inputMode="tel"
            autoComplete="tel"
            value={form.whatsapp || ""}
            onChange={(e) =>
              setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, "") })
            }
            placeholder="5511999999999"
            className="w-full h-14 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </Field>
        <Field label="Instagram (opcional)">
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={form.instagram || ""}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="@seurestaurante"
              className="w-full h-14 pl-9 pr-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </Field>
      </SectionCard>

      <SectionCard title="Endereço" icon={<MapPin className="w-4 h-4" />}>
        <Field label="Rua e número">
          <input
            value={form.address || ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Av. Paulista, 1000"
            className="w-full h-14 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </Field>
        <Field label="Cidade">
          <input
            value={form.city || ""}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="São Paulo - SP"
            className="w-full h-14 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </Field>
      </SectionCard>

      <SectionCard title="Horário" icon={<Clock className="w-4 h-4" />}>
        <Field label="Funcionamento" hint="Ex.: Seg-Sex 18h às 23h">
          <input
            value={form.opening_hours || ""}
            onChange={(e) =>
              setForm({ ...form, opening_hours: e.target.value })
            }
            placeholder="Ter-Dom 18h às 23h"
            className="w-full h-14 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </Field>
        <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
          <div className="min-w-0">
            <p className="font-bold text-zinc-900">Cardápio aberto agora</p>
            <p className="text-xs text-zinc-500">
              Desligue se estiver fechado.
            </p>
          </div>
          <input
            type="checkbox"
            checked={form.status === "active"}
            onChange={(e) =>
              setForm({ ...form, status: e.target.checked ? "active" : "inactive" })
            }
            className="w-12 h-7 appearance-none rounded-full bg-zinc-300 checked:bg-emerald-500 relative transition-colors cursor-pointer
            before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-6 before:h-6 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5"
          />
        </label>
      </SectionCard>

      <SectionCard title="Entrega" icon={<Truck className="w-4 h-4" />}>
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
                  min_order_for_free_delivery: e.target.value === "" ? undefined : Number(e.target.value),
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

      <StickySaveBar saving={saving} saved={saved} onSave={save} />
    </SectionShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-zinc-900 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-500 mt-1.5 font-medium">{hint}</p>}
    </div>
  );
}