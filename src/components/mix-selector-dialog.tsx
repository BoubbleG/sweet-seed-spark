import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ProductSize } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface MixProduct {
  id: string;
  name: string;
}

interface MixSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseProduct: any | null;
  size: ProductSize | null;
  price: number;
  options: MixProduct[];
  maxMisturas: number;
  onConfirm: (misturaNames: string[]) => void;
}

export function MixSelectorDialog({
  open,
  onOpenChange,
  baseProduct,
  size,
  price,
  options,
  maxMisturas,
  onConfirm,
}: MixSelectorDialogProps) {
  // counts[productId] = quantos slots desse prato
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open && baseProduct) {
      setCounts({ [baseProduct.id]: 1 });
    }
  }, [open, baseProduct]);

  const total = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts]
  );

  const inc = (id: string) => {
    if (total >= maxMisturas) return;
    setCounts((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };
  const dec = (id: string) => {
    setCounts((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) - 1) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  };

  const handleConfirm = () => {
    const names: string[] = [];
    options.forEach((o) => {
      const n = counts[o.id] || 0;
      for (let i = 0; i < n; i++) names.push(o.name);
    });
    if (names.length === 0) return;
    onConfirm(names);
    onOpenChange(false);
  };

  if (!baseProduct || !size) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="text-xl font-black leading-tight">
            {baseProduct.name}
            <span className="ml-2 text-sm font-bold text-zinc-500">
              ({size}) · {formatCurrency(price)}
            </span>
          </DialogTitle>
          <p className="text-sm text-zinc-600 mt-1">
            Escolha até <b>{maxMisturas}</b> {maxMisturas === 1 ? "mistura" : "misturas"}. Pode repetir ou combinar pratos.
          </p>
          <div className="mt-2 inline-flex items-center self-start text-xs font-black px-3 py-1 rounded-full bg-zinc-100 text-zinc-700">
            {total} / {maxMisturas}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {options.map((opt) => {
            const qty = counts[opt.id] || 0;
            const disableInc = total >= maxMisturas;
            return (
              <div
                key={opt.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-200 bg-white"
              >
                <span className="text-sm font-bold text-zinc-900 leading-snug">
                  {opt.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => dec(opt.id)}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 disabled:opacity-30 flex items-center justify-center active:scale-95"
                    aria-label={`Remover ${opt.name}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-5 text-center text-sm font-black">{qty}</span>
                  <button
                    type="button"
                    onClick={() => inc(opt.id)}
                    disabled={disableInc}
                    className="w-8 h-8 rounded-full bg-zinc-900 text-white disabled:opacity-30 flex items-center justify-center active:scale-95"
                    aria-label={`Adicionar ${opt.name}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-row gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-2xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={total === 0}
            className="flex-1 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800"
          >
            Adicionar · {formatCurrency(price)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}