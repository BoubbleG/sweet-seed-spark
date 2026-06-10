import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null;
  categories: { id: string; name: string }[];
  restaurantId: string;
}

const empty = {
  name: "",
  description: "",
  price: 0,
  category_id: "",
  is_available: true,
  is_best_seller: false,
  is_on_promo: false,
  promo_price: "",
  promo_label: "Oferta do dia",
};

export function ProductDialog({ open, onOpenChange, product, categories, restaurantId }: ProductDialogProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(empty);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price ?? 0,
        category_id: product.category_id || categories[0]?.id || "",
        is_available: product.is_available !== false,
        is_best_seller: !!product.is_best_seller,
        is_on_promo: !!product.is_on_promo,
        promo_price: product.promo_price ?? "",
        promo_label: product.promo_label || "Oferta do dia",
      });
    } else {
      setForm({ ...empty, category_id: categories[0]?.id || "" });
    }
  }, [product, open, categories]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        restaurant_id: restaurantId,
        category_id: form.category_id,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        price: Number(form.price) || 0,
        is_available: form.is_available,
        is_best_seller: form.is_best_seller,
        is_on_promo: form.is_on_promo,
        promo_price: form.is_on_promo && form.promo_price !== "" ? Number(form.promo_price) : null,
        promo_label: form.is_on_promo ? (form.promo_label?.trim() || "Oferta do dia") : null,
      };
      if (!payload.name) throw new Error("Nome é obrigatório");
      if (!payload.category_id) throw new Error("Selecione uma categoria");
      if (product?.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
      toast.success(product ? "Produto atualizado!" : "Produto criado!");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-zinc-900">
            {product ? "Editar produto" : "Novo produto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl min-h-[72px]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preço (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Categoria</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-black text-zinc-900">Em promoção</span>
              </div>
              <Switch checked={form.is_on_promo} onCheckedChange={(v) => setForm({ ...form, is_on_promo: v })} />
            </div>
            {form.is_on_promo && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preço promocional</Label>
                  <Input type="number" step="0.01" min="0" value={form.promo_price} onChange={(e) => setForm({ ...form, promo_price: e.target.value })} className="h-11 rounded-xl" placeholder="ex: 19,90" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rótulo</Label>
                  <Input value={form.promo_label} onChange={(e) => setForm({ ...form, promo_label: e.target.value })} className="h-11 rounded-xl" placeholder="Oferta do dia" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
              <span className="text-xs font-bold text-zinc-700">Disponível</span>
              <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
              <span className="text-xs font-bold text-zinc-700">Mais pedido</span>
              <Switch checked={form.is_best_seller} onCheckedChange={(v) => setForm({ ...form, is_best_seller: v })} />
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-xl bg-zinc-900 text-white px-6">
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}