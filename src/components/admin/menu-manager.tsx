import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, GripVertical, FileText, Sparkles, Wand2, Upload, FileSearch, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface MenuManagerProps {
  restaurantId: string;
}

export function MenuManager({ restaurantId }: MenuManagerProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("categories");
  const [showImport, setShowImport] = useState(false);
  const [showAIUpload, setShowAIUpload] = useState(false);
  const [importText, setImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery({
    queryKey: ['admin-categories', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    }
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    }
  });

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir: ' + error.message);
    else {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produto removido!');
    }
  };

  const addCategory = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('categories')
        .insert([{ restaurant_id: restaurantId, name, display_order: (categories?.length || 0) + 1 }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success("Categoria adicionada!");
    }
  });

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir: " + error.message);
    else {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success("Categoria removida!");
    }
  };

  const parsePrice = (raw: string): number => {
    if (!raw) return 0;
    const cleaned = raw
      .replace(/r\$/gi, "")
      .replace(/[^\d,.\-]/g, "")
      .trim();
    if (!cleaned) return 0;
    // handle "12,90" and "1.234,56" and "12.90"
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    let normalized = cleaned;
    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = cleaned.replace(/,/g, "");
    }
    const n = parseFloat(normalized);
    return isNaN(n) ? 0 : n;
  };

  const handleImportText = async () => {
    const text = importText.trim();
    if (!text) {
      toast.error("Cole o texto do cardápio antes de importar.");
      return;
    }
    setIsImporting(true);
    const toastId = toast.loading("Importando cardápio...");
    try {
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const existingCats = [...(categories || [])];
      const catCache: Record<string, string> = {};
      existingCats.forEach((c) => (catCache[c.name.toLowerCase()] = c.id));

      let currentCatId: string | null = existingCats[0]?.id || null;
      let currentOrder = existingCats.length;
      const productsToInsert: any[] = [];
      let createdCats = 0;

      const ensureCategory = async (name: string) => {
        const key = name.toLowerCase();
        if (catCache[key]) return catCache[key];
        const { data, error } = await supabase
          .from("categories")
          .insert([{ restaurant_id: restaurantId, name, display_order: ++currentOrder }])
          .select("id")
          .single();
        if (error) throw error;
        catCache[key] = data.id;
        createdCats++;
        return data.id;
      };

      for (const line of lines) {
        // Category header: "# Nome", "## Nome" or "[Nome]"
        const headerMatch =
          line.match(/^#+\s*(.+)$/) || line.match(/^\[(.+)\]$/);
        if (headerMatch) {
          currentCatId = await ensureCategory(headerMatch[1].trim());
          continue;
        }

        // Find a price anywhere in the line: R$ 15,90 / 15,90 / 15.90 / 15
        const priceRegex = /R?\$?\s*\d{1,4}(?:[.,]\d{2})?(?!\d)/i;
        const priceMatch = line.match(priceRegex);
        if (!priceMatch) continue;

        const price = parsePrice(priceMatch[0]);
        if (price <= 0) continue;

        // Everything before the price = name (+ optional description after a dash)
        const before = line.slice(0, priceMatch.index!).replace(/[\s\-—|.:·•]+$/g, "").trim();
        const after = line.slice(priceMatch.index! + priceMatch[0].length).replace(/^[\s\-—|.:·•]+/g, "").trim();
        if (!before) continue;

        // If "before" has " - " split, name=first, desc=rest
        let name = before;
        let description: string | null = after || null;
        const dashSplit = before.split(/\s+[-—]\s+/);
        if (dashSplit.length > 1) {
          name = dashSplit[0].trim();
          const fromName = dashSplit.slice(1).join(" - ").trim();
          description = [fromName, after].filter(Boolean).join(" - ") || null;
        }

        if (!currentCatId) {
          currentCatId = await ensureCategory("Geral");
        }

        productsToInsert.push({
          restaurant_id: restaurantId,
          category_id: currentCatId,
          name,
          price,
          description,
          is_available: true,
        });
      }

      if (productsToInsert.length === 0) {
        toast.error("Nenhum item válido encontrado no texto.", { id: toastId });
        setIsImporting(false);
        return;
      }

      const { error } = await supabase.from("products").insert(productsToInsert);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(
        `${productsToInsert.length} itens importados${createdCats ? ` em ${createdCats} nova(s) categoria(s)` : ""}!`,
        { id: toastId }
      );
      setImportText("");
      setShowImport(false);
    } catch (err: any) {
      toast.error("Erro ao importar: " + (err.message || "desconhecido"), { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Import Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setShowImport(true)}
          className="flex items-center gap-4 p-4 rounded-3xl border border-zinc-200 bg-zinc-50 hover:border-primary/50 hover:bg-white transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-zinc-900">Importador Rápido</h4>
            <p className="text-xs text-zinc-500">Cole seu cardápio em formato texto</p>
          </div>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-4 p-4 rounded-3xl border border-zinc-200 bg-zinc-50 hover:border-violet-500/50 hover:bg-white transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-violet-500/10 group-hover:text-violet-600 transition-colors">
            <FileSearch className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-zinc-900">IA Vision Scanner</h4>
            <p className="text-xs text-zinc-500">Digitalize PDF ou fotos do menu</p>
          </div>
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 rounded-2xl max-w-sm">
          <TabsTrigger value="categories" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-bold">Categorias</TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-bold">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6 pt-6">
          <div className="flex gap-2">
            <Input id="new-cat" placeholder="Nova categoria..." className="flex-1 rounded-2xl border-zinc-200 bg-white shadow-sm focus:ring-primary/20" onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addCategory.mutate(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }} />
            <Button onClick={() => {
              const input = document.getElementById('new-cat') as HTMLInputElement;
              if (input.value) {
                addCategory.mutate(input.value);
                input.value = '';
              }
            }} className="rounded-2xl px-8 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((cat) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-zinc-300 cursor-grab" />
                    <h4 className="font-bold text-zinc-900">{cat.name}</h4>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)} className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Switch checked={cat.is_active !== false} className="scale-75" />
                    <span className="text-[10px] uppercase font-black text-zinc-400">Ativa</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6 pt-6">
          {(!products || products.length === 0) ? (
            <div className="text-center py-16 text-zinc-500">
              Nenhum produto cadastrado. Use o importador acima para adicionar seu cardápio.
            </div>
          ) : (
            <div className="space-y-8">
              {categories?.map((cat) => {
                const items = products.filter((p) => p.category_id === cat.id);
                if (items.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 mb-3">{cat.name} <span className="text-zinc-300">· {items.length}</span></h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((p) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group relative p-5 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-bold text-zinc-900 leading-tight">{p.name}</h4>
                            <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {p.description && (
                            <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{p.description}</p>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                            <span className="text-lg font-black text-primary">R$ {Number(p.price).toFixed(2).replace('.', ',')}</span>
                            <div className="flex items-center gap-2">
                              <Switch checked={p.is_available !== false} className="scale-75" />
                              <span className="text-[10px] uppercase font-black text-zinc-400">Ativo</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="sm:max-w-xl bg-white border-zinc-200 rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-zinc-900">
              <FileText className="w-6 h-6 text-primary" /> Importar Cardápio
            </DialogTitle>
          </DialogHeader>
          <Textarea 
            placeholder={`Formato:\n# Hambúrgueres\nClássico - 29,90 - Pão, carne, queijo\nBacon - R$ 34,90 - Com bacon crocante\n\n# Bebidas\nCoca-Cola - 7,00`}
            className="min-h-[300px] rounded-2xl bg-zinc-50 border-zinc-200 p-4 focus:ring-primary/20"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <DialogFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setShowImport(false)} disabled={isImporting} className="rounded-2xl flex-1">Cancelar</Button>
            <Button onClick={handleImportText} disabled={isImporting} className="rounded-2xl flex-1 bg-primary text-white">
              {isImporting ? "Importando..." : "Importar Agora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
