import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Plus, Minus } from "lucide-react";
import type { Product, ProductOptionGroup } from "@/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Diálogo genérico para "Monte seu pedido" / adicionais.
 *
 * Lê os `option_groups` do produto e renderiza cada grupo como:
 * - radio (quando max_select === 1)
 * - checkbox (quando max_select > 1)
 *
 * Calcula o preço final conforme o `pricing_mode` do grupo:
 * - 'free'           → não soma nada
 * - 'per_option'     → soma o extra_price de cada opção selecionada
 * - 'most_expensive' → soma só o extra_price mais alto entre as selecionadas
 *
 * Bloqueia o botão de adicionar enquanto algum grupo não atingir o `min_select`.
 */
export function ProductBuilderDialog({
  open,
  onOpenChange,
  product,
  basePrice,
  accent = "#27272a",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: Product | null;
  /** Preço unitário base do produto (já considerando promoção, se houver). */
  basePrice: number;
  /** Cor de destaque (botões, seleções). Usa primary do tema. */
  accent?: string;
  onConfirm: (result: {
    selections: Array<{ group: ProductOptionGroup; optionIds: string[] }>;
    notes: string;
    finalPrice: number;
    quantity: number;
  }) => void;
}) {
  const groups = useMemo(
    () => (product?.option_groups || []).slice().sort((a, b) => a.display_order - b.display_order),
    [product]
  );
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!open) return;
    setSelected({});
    setQty(1);
  }, [open, product?.id]);

  const toggle = (group: ProductOptionGroup, optionId: string) => {
    setSelected((prev) => {
      const cur = prev[group.id] || [];
      const isOn = cur.includes(optionId);
      let next: string[];
      if (group.max_select === 1) {
        // radio behavior
        next = isOn ? [] : [optionId];
      } else if (isOn) {
        next = cur.filter((x) => x !== optionId);
      } else {
        if (cur.length >= group.max_select) return prev; // bloqueia além do máximo
        next = [...cur, optionId];
      }
      return { ...prev, [group.id]: next };
    });
  };

  const groupExtra = (group: ProductOptionGroup) => {
    const ids = selected[group.id] || [];
    const opts = group.options.filter((o) => ids.includes(o.id));
    if (opts.length === 0) return 0;
    if (group.pricing_mode === "free") return 0;
    if (group.pricing_mode === "most_expensive") {
      return Math.max(0, ...opts.map((o) => Number(o.extra_price || 0)));
    }
    // per_option
    return opts.reduce((s, o) => s + Number(o.extra_price || 0), 0);
  };

  const extrasTotal = groups.reduce((s, g) => s + groupExtra(g), 0);
  const unitPrice = basePrice + extrasTotal;
  const finalPrice = unitPrice; // qty é tratado pelo carrinho (addItem com quantity)

  const missingGroup = groups.find((g) => (selected[g.id]?.length || 0) < g.min_select);
  const canConfirm = !missingGroup;

  const handleConfirm = () => {
    if (!product || !canConfirm) return;
    const selections = groups.map((g) => ({
      group: g,
      optionIds: selected[g.id] || [],
    }));
    const parts: string[] = [];
    for (const { group, optionIds } of selections) {
      if (optionIds.length === 0) continue;
      const names = group.options
        .filter((o) => optionIds.includes(o.id))
        .map((o) =>
          group.pricing_mode === "free" || !o.extra_price
            ? o.name
            : `${o.name} (+${formatCurrency(Number(o.extra_price))})`
        );
      parts.push(`${group.name}: ${names.join(", ")}`);
    }
    const notes = parts.join("\n");
    onConfirm({ selections, notes, finalPrice, quantity: qty });
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto p-0">
        {/* hero */}
        <div className="relative">
          {product.image_url ? (
            <div className="h-44 bg-zinc-100 overflow-hidden">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-6" />
          )}
        </div>

        <div className="px-5 pt-2 pb-1">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-black leading-tight">{product.name}</DialogTitle>
            {product.description && (
              <DialogDescription className="text-sm">{product.description}</DialogDescription>
            )}
          </DialogHeader>
        </div>

        <div className="px-5 pb-4 space-y-5">
          {groups.map((group) => {
            const cur = selected[group.id] || [];
            const isRadio = group.max_select === 1;
            const required = group.min_select > 0;
            const minMet = cur.length >= group.min_select;
            return (
              <section key={group.id}>
                <header className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-zinc-900 leading-tight">{group.name}</h4>
                    <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                      {isRadio
                        ? required ? "Escolha 1 — obrigatório" : "Escolha 1"
                        : group.min_select > 0
                          ? `Escolha de ${group.min_select} a ${group.max_select}`
                          : `Escolha até ${group.max_select}`}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: minMet ? "#dcfce7" : required ? "#fee2e2" : "#f4f4f5",
                      color: minMet ? "#166534" : required ? "#991b1b" : "#52525b",
                    }}
                  >
                    {minMet ? "ok" : required ? "obrigatório" : "opcional"}
                  </span>
                </header>

                <div className="space-y-2">
                  {group.options.map((opt) => {
                    const isOn = cur.includes(opt.id);
                    const showPrice = group.pricing_mode !== "free" && Number(opt.extra_price) > 0;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggle(group, opt.id)}
                        className="w-full flex items-center justify-between gap-3 h-12 px-4 rounded-2xl border-2 text-sm font-bold transition-all active:scale-[0.99] text-left"
                        style={{
                          borderColor: isOn ? accent : "#e4e4e7",
                          backgroundColor: isOn ? `${accent}14` : "#fff",
                          color: isOn ? accent : "#27272a",
                        }}
                      >
                        <span className="flex-1 truncate">{opt.name}</span>
                        {showPrice && (
                          <span className="text-xs font-bold opacity-80">
                            +{formatCurrency(Number(opt.extra_price))}
                          </span>
                        )}
                        <span
                          className={isRadio ? "w-5 h-5 rounded-full" : "w-5 h-5 rounded-md"}
                          style={{
                            border: `2px solid ${isOn ? accent : "#d4d4d8"}`,
                            backgroundColor: isOn ? accent : "transparent",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isOn && <Check className="w-3 h-3" />}
                        </span>
                      </button>
                    );
                  })}
                  {group.options.length === 0 && (
                    <p className="text-xs text-zinc-400 italic">Nenhuma opção disponível.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* footer */}
        <div className="sticky bottom-0 bg-white border-t border-zinc-200 p-4 flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-1">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center"
              aria-label="Diminuir"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center text-sm font-black">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center"
              aria-label="Aumentar"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="flex-1 h-12 rounded-2xl font-black text-white shadow-md disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {canConfirm
              ? `Adicionar — ${formatCurrency(finalPrice * qty)}`
              : `Falta escolher: ${missingGroup?.name}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}