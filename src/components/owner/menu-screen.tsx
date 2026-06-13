import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category, Product } from "@/types";
import { SectionShell } from "./shared";
import { OwnerProductSheet } from "./product-sheet";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  ChevronDown,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Tag,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function OwnerMenuScreen({
  restaurantId,
  onBack,
}: {
  restaurantId: string;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [productSheet, setProductSheet] = useState<{
    open: boolean;
    product: Product | null;
    categoryId?: string;
  }>({ open: false, product: null });

  const { data: categories } = useQuery({
    queryKey: ["owner-cats", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

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

  const addCategory = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("categories").insert([
        {
          restaurant_id: restaurantId,
          name: name.trim(),
          display_order: (categories?.length || 0) + 1,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-cats", restaurantId] });
      toast.success("Categoria criada!");
      setNewCatName("");
      setShowNewCat(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Apagar a categoria "${name}"? Os pratos dela também serão apagados.`))
      return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["owner-cats", restaurantId] });
      qc.invalidateQueries({ queryKey: ["owner-products", restaurantId] });
      toast.success("Categoria apagada");
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Apagar o prato "${name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["owner-products", restaurantId] });
      toast.success("Prato apagado");
    }
  };

  const toggleAvailable = async (p: Product) => {
    const next = !(p.is_available !== false);
    const { error } = await supabase
      .from("products")
      .update({ is_available: next })
      .eq("id", p.id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["owner-products", restaurantId] });
  };

  const moveCategory = async (cat: Category, dir: -1 | 1) => {
    if (!categories) return;
    const idx = categories.findIndex((c) => c.id === cat.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= categories.length) return;
    const other = categories[swapIdx];
    await supabase
      .from("categories")
      .update({ display_order: other.display_order })
      .eq("id", cat.id);
    await supabase
      .from("categories")
      .update({ display_order: cat.display_order })
      .eq("id", other.id);
    qc.invalidateQueries({ queryKey: ["owner-cats", restaurantId] });
  };

  return (
    <SectionShell
      title="Meu cardápio"
      subtitle="Categorias e pratos"
      onBack={onBack}
    >
      {/* New category */}
      {!showNewCat ? (
        <button
          onClick={() => setShowNewCat(true)}
          className="w-full flex items-center gap-3 h-14 px-4 rounded-2xl bg-white border-2 border-dashed border-zinc-300 text-zinc-700 font-bold mb-4 active:scale-[0.99] transition"
        >
          <FolderPlus className="w-5 h-5" />
          Nova categoria
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 p-3 mb-4 flex flex-col gap-2">
          <input
            autoFocus
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Ex.: Hambúrgueres"
            className="h-14 px-4 rounded-xl border border-zinc-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowNewCat(false);
                setNewCatName("");
              }}
              className="flex-1 h-12 rounded-xl bg-zinc-100 font-bold text-zinc-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => newCatName.trim() && addCategory.mutate(newCatName)}
              disabled={!newCatName.trim() || addCategory.isPending}
              className="flex-1 h-12 rounded-xl bg-zinc-900 text-white font-black disabled:opacity-50"
            >
              Criar
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {categories?.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            Você ainda não tem categorias.
            <br />
            Crie uma para começar.
          </div>
        )}
        {categories?.map((cat, idx) => {
          const items = (products || []).filter((p) => p.category_id === cat.id);
          const offCount = items.filter((p) => p.is_available === false).length;
          const isOpen = openCat === cat.id;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenCat(isOpen ? null : cat.id)}
                className="w-full flex items-center gap-3 p-4 active:bg-zinc-50 transition"
              >
                <div className="min-w-0 flex-1 text-left">
                  <h3 className="text-base font-black text-zinc-900 truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    {items.length} {items.length === 1 ? "prato" : "pratos"}
                    {offCount > 0 && ` · ${offCount} esgotado${offCount === 1 ? "" : "s"}`}
                  </p>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-zinc-100"
                  >
                    {/* Category actions */}
                    <div className="flex items-center gap-2 p-3 bg-zinc-50">
                      <button
                        onClick={() => moveCategory(cat, -1)}
                        disabled={idx === 0}
                        className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center disabled:opacity-30"
                        aria-label="Mover para cima"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveCategory(cat, 1)}
                        disabled={idx === (categories?.length || 0) - 1}
                        className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center disabled:opacity-30"
                        aria-label="Mover para baixo"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id, cat.name)}
                        className="ml-auto h-10 px-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        Apagar categoria
                      </button>
                    </div>

                    {/* Products */}
                    <div className="p-3 space-y-2">
                      {items.length === 0 && (
                        <p className="text-center text-xs text-zinc-400 py-4">
                          Sem pratos nesta categoria
                        </p>
                      )}
                      {items.map((p) => (
                        (() => {
                          const available = p.is_available !== false;
                          return (
                        <div
                          key={p.id}
                          className={`bg-zinc-50 border border-zinc-200 rounded-2xl p-3 transition ${available ? "" : "opacity-60"}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2">
                                <h4 className="font-black text-zinc-900 text-base leading-tight truncate flex-1">
                                  {p.name}
                                </h4>
                                <Switch
                                  checked={available}
                                  onCheckedChange={() => toggleAvailable(p)}
                                  aria-label={available ? "Desativar prato" : "Ativar prato"}
                                />
                              </div>
                              {!available && (
                                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider text-zinc-600 bg-zinc-200 px-2 py-0.5 rounded-full">
                                  Esgotado
                                </span>
                              )}
                              {p.description && (
                                <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">
                                  {p.description}
                                </p>
                              )}
                              <div className="flex items-baseline gap-2 mt-2">
                                {p.is_on_promo && p.promo_price != null ? (
                                  <>
                                    <span className="text-lg font-black text-amber-600">
                                      R${" "}
                                      {Number(p.promo_price)
                                        .toFixed(2)
                                        .replace(".", ",")}
                                    </span>
                                    <span className="text-xs text-zinc-400 line-through">
                                      R${" "}
                                      {Number(p.price)
                                        .toFixed(2)
                                        .replace(".", ",")}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                      <Tag className="w-3 h-3" />
                                      {p.promo_label || "Promo"}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-lg font-black text-zinc-900">
                                    R${" "}
                                    {Number(p.price).toFixed(2).replace(".", ",")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-200">
                            <button
                              onClick={() =>
                                setProductSheet({
                                  open: true,
                                  product: p,
                                  categoryId: cat.id,
                                })
                              }
                              className="h-10 flex-1 rounded-xl bg-zinc-900 text-white flex items-center justify-center gap-2 text-xs font-bold"
                              aria-label="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id, p.name)}
                              className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"
                              aria-label="Apagar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                          );
                        })()
                      ))}

                      <button
                        onClick={() =>
                          setProductSheet({
                            open: true,
                            product: null,
                            categoryId: cat.id,
                          })
                        }
                        className="w-full h-12 rounded-xl bg-zinc-900 text-white font-black text-sm flex items-center justify-center gap-2 mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar prato
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <OwnerProductSheet
        open={productSheet.open}
        onOpenChange={(v) => setProductSheet((s) => ({ ...s, open: v }))}
        product={productSheet.product}
        defaultCategoryId={productSheet.categoryId}
        categories={categories || []}
        restaurantId={restaurantId}
      />
    </SectionShell>
  );
}