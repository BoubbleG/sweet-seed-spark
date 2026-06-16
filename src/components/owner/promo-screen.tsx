import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { SectionShell } from "./shared";
import { Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { recordSnapshot } from "@/lib/snapshots";

export function OwnerPromoScreen({
  restaurantId,
  onBack,
}: {
  restaurantId: string;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["owner-products", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <SectionShell
      title="Promoções"
      subtitle="Marque ofertas e crie destaques"
      onBack={onBack}
    >
      {(!products || products.length === 0) && (
        <div className="text-center py-12 text-zinc-500 text-sm">
          Adicione pratos no cardápio primeiro.
        </div>
      )}

      <div className="space-y-3">
        {products?.map((p) => (
          <PromoRow
            key={p.id}
            product={p}
            onSaved={() =>
              qc.invalidateQueries({ queryKey: ["owner-products", restaurantId] })
            }
          />
        ))}
      </div>
    </SectionShell>
  );
}

function PromoRow({ product, onSaved }: { product: Product; onSaved: () => void }) {
  const [on, setOn] = useState(!!product.is_on_promo);
  const [price, setPrice] = useState(
    product.promo_price != null ? String(product.promo_price) : ""
  );
  const [label, setLabel] = useState(product.promo_label || "Oferta do dia");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setOn(!!product.is_on_promo);
    setPrice(product.promo_price != null ? String(product.promo_price) : "");
    setLabel(product.promo_label || "Oferta do dia");
  }, [product.id]);

  const persist = async (next: { on?: boolean; price?: string; label?: string }) => {
    const isOn = next.on ?? on;
    const p = next.price ?? price;
    const l = next.label ?? label;
    setSaving(true);
    await recordSnapshot(product.restaurant_id, `Promoção de "${product.name}"`, "promo");
    const { error } = await supabase
      .from("products")
      .update({
        is_on_promo: isOn,
        promo_price:
          isOn && p !== "" ? Number(String(p).replace(",", ".")) : null,
        promo_label: isOn ? l?.trim() || "Oferta do dia" : null,
      })
      .eq("id", product.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSavedAt(Date.now());
    onSaved();
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        on ? "border-amber-300 bg-amber-50/40" : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-zinc-900 truncate">{product.name}</h3>
          <p className="text-sm text-zinc-500">
            Preço: R$ {Number(product.price).toFixed(2).replace(".", ",")}
          </p>
        </div>
        <label className="shrink-0">
          <input
            type="checkbox"
            checked={on}
            onChange={(e) => {
              setOn(e.target.checked);
              persist({ on: e.target.checked });
            }}
            className="w-12 h-7 appearance-none rounded-full bg-zinc-300 checked:bg-amber-500 relative transition-colors cursor-pointer
            before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-6 before:h-6 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5"
          />
        </label>
      </div>

      {on && (
        <div className="space-y-3 mt-3 pt-3 border-t border-amber-200/60">
          <div>
            <label className="block text-xs font-bold text-zinc-900 mb-1.5">
              Preço promocional
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                R$
              </span>
              <input
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => persist({ price })}
                placeholder="0,00"
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-900 mb-1.5">
              Etiqueta
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() => persist({ label })}
              placeholder="Oferta do dia"
              className="w-full h-12 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="inline-flex items-center gap-1 font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              <Tag className="w-3 h-3" />
              {label || "Promo"}
            </span>
            <span className="text-zinc-400">
              {saving
                ? "Salvando…"
                : savedAt
                ? "✓ Salvo"
                : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}