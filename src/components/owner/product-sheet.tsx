import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Category, Product, OptionPricingMode } from "@/types";
import { toast } from "sonner";
import { Sparkles, X, ImagePlus, Loader2, Trash2, Plus, ListPlus } from "lucide-react";

type DraftOption = {
  id?: string;
  name: string;
  extra_price: string; // string para input controlado
};
type DraftGroup = {
  id?: string;
  name: string;
  min_select: number;
  max_select: number;
  pricing_mode: OptionPricingMode;
  options: DraftOption[];
};

export function OwnerProductSheet({
  open,
  onOpenChange,
  product,
  categories,
  defaultCategoryId,
  restaurantId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
  categories: Category[];
  defaultCategoryId?: string;
  restaurantId: string;
}) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [groups, setGroups] = useState<DraftGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: defaultCategoryId || categories[0]?.id || "",
    is_available: true,
    is_on_promo: false,
    promo_price: "",
    promo_label: "Oferta do dia",
    has_sizes: false,
    price_p: "",
    price_m: "",
    price_g: "",
    sides_note: "",
    image_url: "",
  });

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: String(product.price ?? ""),
        category_id: product.category_id || defaultCategoryId || categories[0]?.id || "",
        is_available: product.is_available !== false,
        is_on_promo: !!product.is_on_promo,
        promo_price: product.promo_price != null ? String(product.promo_price) : "",
        promo_label: product.promo_label || "Oferta do dia",
        has_sizes: !!product.has_sizes,
        price_p: product.price_p != null ? String(product.price_p) : "",
        price_m: product.price_m != null ? String(product.price_m) : "",
        price_g: product.price_g != null ? String(product.price_g) : "",
        sides_note: product.sides_note || "",
        image_url: product.image_url || "",
      });
    } else {
      setForm({
        name: "",
        description: "",
        price: "",
        category_id: defaultCategoryId || categories[0]?.id || "",
        is_available: true,
        is_on_promo: false,
        promo_price: "",
        promo_label: "Oferta do dia",
        has_sizes: false,
        price_p: "",
        price_m: "",
        price_g: "",
        sides_note: "",
        image_url: "",
      });
    }
  }, [open, product, defaultCategoryId, categories]);

  // Carrega grupos de opções existentes do produto
  useEffect(() => {
    if (!open) { setGroups([]); return; }
    if (!product?.id) { setGroups([]); return; }
    let cancel = false;
    (async () => {
      setLoadingGroups(true);
      const { data: gs, error } = await supabase
        .from("product_option_groups" as any)
        .select("*")
        .eq("product_id", product.id)
        .order("display_order", { ascending: true });
      if (error) { setLoadingGroups(false); return; }
      const groupIds = (gs || []).map((g: any) => g.id);
      let opts: any[] = [];
      if (groupIds.length) {
        const { data: os } = await supabase
          .from("product_options" as any)
          .select("*")
          .in("group_id", groupIds)
          .order("display_order", { ascending: true });
        opts = os || [];
      }
      if (cancel) return;
      setGroups((gs || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        min_select: g.min_select,
        max_select: g.max_select,
        pricing_mode: g.pricing_mode,
        options: opts.filter((o) => o.group_id === g.id).map((o) => ({
          id: o.id,
          name: o.name,
          extra_price: String(o.extra_price ?? "0"),
        })),
      })));
      setLoadingGroups(false);
    })();
    return () => { cancel = true; };
  }, [open, product?.id]);

  // Persiste grupos+opções para um produto (cria/atualiza/apaga conforme o estado)
  async function syncOptionGroups(productId: string) {
    // Carrega ids existentes pra calcular o que apagar
    const { data: existing } = await supabase
      .from("product_option_groups" as any)
      .select("id")
      .eq("product_id", productId);
    const existingIds = new Set((existing || []).map((g: any) => g.id));
    const keepIds = new Set(groups.map((g) => g.id).filter(Boolean) as string[]);
    const toDelete = [...existingIds].filter((id) => !keepIds.has(id as string));
    if (toDelete.length > 0) {
      const { error } = await supabase
        .from("product_option_groups" as any)
        .delete()
        .in("id", toDelete);
      if (error) throw error;
    }

    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const groupPayload = {
        product_id: productId,
        name: g.name.trim() || "Opções",
        min_select: Math.max(0, Number(g.min_select) || 0),
        max_select: Math.max(1, Number(g.max_select) || 1),
        pricing_mode: g.pricing_mode,
        display_order: i,
      };
      let groupId = g.id;
      if (groupId) {
        const { error } = await supabase
          .from("product_option_groups" as any)
          .update(groupPayload)
          .eq("id", groupId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("product_option_groups" as any)
          .insert([groupPayload])
          .select("id")
          .single();
        if (error) throw error;
        groupId = (data as any)?.id;
      }
      if (!groupId) continue;

      // Sincroniza opções: apaga as removidas, atualiza as mantidas, insere as novas
      const { data: existingOpts } = await supabase
        .from("product_options" as any)
        .select("id")
        .eq("group_id", groupId);
      const existingOptIds = new Set((existingOpts || []).map((o: any) => o.id));
      const keepOptIds = new Set(g.options.map((o) => o.id).filter(Boolean) as string[]);
      const optsToDelete = [...existingOptIds].filter((id) => !keepOptIds.has(id as string));
      if (optsToDelete.length > 0) {
        const { error } = await supabase
          .from("product_options" as any)
          .delete()
          .in("id", optsToDelete);
        if (error) throw error;
      }
      for (let j = 0; j < g.options.length; j++) {
        const o = g.options[j];
        const optPayload = {
          group_id: groupId,
          name: o.name.trim(),
          extra_price: Number(String(o.extra_price).replace(",", ".")) || 0,
          is_available: true,
          display_order: j,
        };
        if (!optPayload.name) continue;
        if (o.id) {
          const { error } = await supabase
            .from("product_options" as any)
            .update(optPayload)
            .eq("id", o.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("product_options" as any)
            .insert([optPayload]);
          if (error) throw error;
        }
      }
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Dê um nome ao prato");
      if (!form.category_id) throw new Error("Escolha uma categoria");
      const payload = {
        restaurant_id: restaurantId,
        category_id: form.category_id,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        price: Number(String(form.price).replace(",", ".")) || 0,
        is_available: form.is_available,
        is_on_promo: form.has_sizes ? false : form.is_on_promo,
        promo_price:
          !form.has_sizes && form.is_on_promo && form.promo_price !== ""
            ? Number(String(form.promo_price).replace(",", "."))
            : null,
        promo_label: !form.has_sizes && form.is_on_promo
          ? form.promo_label?.trim() || "Oferta do dia"
          : null,
        has_sizes: form.has_sizes,
        price_p: form.has_sizes && form.price_p !== "" ? Number(String(form.price_p).replace(",", ".")) : null,
        price_m: form.has_sizes && form.price_m !== "" ? Number(String(form.price_m).replace(",", ".")) : null,
        price_g: form.has_sizes && form.price_g !== "" ? Number(String(form.price_g).replace(",", ".")) : null,
        sides_note: form.sides_note?.trim() || null,
        image_url: form.image_url?.trim() || null,
      };
      if (product?.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (error) throw error;
        await syncOptionGroups(product.id);
      } else {
        const { data: created, error } = await supabase
          .from("products")
          .insert([payload])
          .select("id")
          .single();
        if (error) throw error;
        if (created?.id) await syncOptionGroups(created.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-products", restaurantId] });
      toast.success(product ? "Prato atualizado!" : "Prato adicionado!");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92dvh] sm:max-w-lg sm:mx-auto rounded-t-3xl p-0 border-0 flex flex-col"
      >
        <SheetHeader className="px-5 py-4 border-b border-zinc-200 flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-lg font-black text-zinc-900">
            {product ? "Editar prato" : "Novo prato"}
          </SheetTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">
              Foto do prato
            </label>
            {form.image_url ? (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-[4/3]">
                <img
                  src={form.image_url}
                  alt="Prévia do prato"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <label className="h-10 px-3 rounded-xl bg-white/95 text-zinc-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow">
                    <ImagePlus className="w-4 h-4" />
                    Trocar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const ext = file.name.split(".").pop() || "jpg";
                          const path = `products/${restaurantId}/${crypto.randomUUID()}.${ext}`;
                          const { error: upErr } = await supabase.storage
                            .from("restaurant-assets")
                            .upload(path, file, { upsert: true, contentType: file.type });
                          if (upErr) throw upErr;
                          const { data, error: signErr } = await supabase.storage
                            .from("restaurant-assets")
                            .createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
                          if (signErr) throw signErr;
                          setForm((f) => ({ ...f, image_url: data.signedUrl }));
                          toast.success("Foto carregada!");
                        } catch (err: any) {
                          toast.error(err.message || "Falha no upload");
                        } finally {
                          setUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                    className="h-10 w-10 rounded-xl bg-white/95 text-rose-600 flex items-center justify-center shadow"
                    aria-label="Remover foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-600 font-bold cursor-pointer active:scale-[0.99] transition">
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-7 h-7" />
                    <span className="text-sm">Toque para enviar uma foto</span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      JPG, PNG ou WEBP — até 5MB
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Imagem muito grande (máx. 5MB)");
                      return;
                    }
                    setUploading(true);
                    try {
                      const ext = file.name.split(".").pop() || "jpg";
                      const path = `products/${restaurantId}/${crypto.randomUUID()}.${ext}`;
                      const { error: upErr } = await supabase.storage
                        .from("restaurant-assets")
                        .upload(path, file, { upsert: true, contentType: file.type });
                      if (upErr) throw upErr;
                      const { data, error: signErr } = await supabase.storage
                        .from("restaurant-assets")
                        .createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
                      if (signErr) throw signErr;
                      setForm((f) => ({ ...f, image_url: data.signedUrl }));
                      toast.success("Foto carregada!");
                    } catch (err: any) {
                      toast.error(err.message || "Falha no upload");
                    } finally {
                      setUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">
              Nome do prato
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: X-Burger Clássico"
              className="w-full h-14 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">
              Descrição (opcional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="O que tem nesse prato?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">
              Preço
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                R$
              </span>
              <input
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0,00"
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
                disabled={form.has_sizes}
                style={form.has_sizes ? { opacity: 0.5 } : undefined}
              />
            </div>
            {form.has_sizes && (
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Este prato usa os preços por tamanho abaixo.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 space-y-3">
            <label className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-zinc-900">Tamanhos P / M / G</p>
                <p className="text-xs text-zinc-500">
                  Cliente escolhe o tamanho ao adicionar
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.has_sizes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    has_sizes: e.target.checked,
                    is_on_promo: e.target.checked ? false : form.is_on_promo,
                  })
                }
                className="w-12 h-7 appearance-none rounded-full bg-zinc-300 checked:bg-zinc-900 relative transition-colors cursor-pointer
                before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-6 before:h-6 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5"
              />
            </label>
            {form.has_sizes && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(["p", "m", "g"] as const).map((k) => (
                  <div key={k}>
                    <label className="block text-xs font-black text-zinc-900 mb-1.5 uppercase">
                      {k}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">
                        R$
                      </span>
                      <input
                        inputMode="decimal"
                        value={(form as any)[`price_${k}`]}
                        onChange={(e) =>
                          setForm({ ...form, [`price_${k}`]: e.target.value } as any)
                        }
                        placeholder="0,00"
                        className="w-full h-12 pl-9 pr-2 rounded-xl border border-zinc-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                Acompanhamentos (opcional)
              </label>
              <input
                value={form.sides_note}
                onChange={(e) => setForm({ ...form, sides_note: e.target.value })}
                placeholder="Ex: arroz, salada, farofa, batata palha"
                className="w-full h-12 px-4 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-1.5">
              Categoria
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full h-14 px-4 rounded-xl border border-zinc-200 text-base font-medium bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="min-w-0">
              <p className="font-bold text-zinc-900">Disponível hoje</p>
              <p className="text-xs text-zinc-500">
                Desligue para esconder do cliente
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) =>
                setForm({ ...form, is_available: e.target.checked })
              }
              className="w-12 h-7 appearance-none rounded-full bg-zinc-300 checked:bg-emerald-500 relative transition-colors cursor-pointer
              before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-6 before:h-6 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5"
            />
          </label>

          <div
            className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3"
            style={form.has_sizes ? { opacity: 0.45, pointerEvents: "none" } : undefined}
          >
            {form.has_sizes && (
              <p className="text-[11px] text-amber-700 font-bold">
                Promoção indisponível em pratos com tamanhos.
              </p>
            )}
            <label className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Em promoção
                </p>
                <p className="text-xs text-zinc-500">
                  Mostra preço riscado e selo
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.is_on_promo}
                onChange={(e) =>
                  setForm({ ...form, is_on_promo: e.target.checked })
                }
                className="w-12 h-7 appearance-none rounded-full bg-zinc-300 checked:bg-amber-500 relative transition-colors cursor-pointer
                before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-6 before:h-6 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5"
              />
            </label>
            {form.is_on_promo && (
              <div className="space-y-3 pt-2">
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
                      value={form.promo_price}
                      onChange={(e) =>
                        setForm({ ...form, promo_price: e.target.value })
                      }
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
                    value={form.promo_label}
                    onChange={(e) =>
                      setForm({ ...form, promo_label: e.target.value })
                    }
                    placeholder="Oferta do dia"
                    className="w-full h-12 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-200 p-4 bg-white">
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black text-base disabled:opacity-60 active:scale-[0.99] transition"
          >
            {save.isPending ? "Salvando…" : product ? "Salvar alterações" : "Adicionar prato"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}