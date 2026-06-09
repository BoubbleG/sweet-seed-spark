import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, GripVertical, FileText, Sparkles, Wand2, Upload, Loader2, FileSearch } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";




interface MenuManagerProps {
  restaurantId: string;
}

export function MenuManager({ restaurantId }: MenuManagerProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("categories");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importLoading, setImportLoading] = useState(false);


  // Fetch Categories
  const { data: categories, isLoading: catsLoading } = useQuery({
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

  // Category Mutation
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

  const handleTextImport = async () => {
    if (!importText.trim()) return;
    setImportLoading(true);
    try {
      // Simple parser for "Product Name - Price - Description"
      const lines = importText.split('\n');
      const newProducts = [];
      let currentCategory = categories?.[0]?.id;

      for (const line of lines) {
        if (!line.trim()) continue;
        
        // If line is uppercase or short, assume it's a category name
        if (line === line.toUpperCase() && line.length < 30) {
          const { data: cat } = await supabase
            .from('categories')
            .insert([{ restaurant_id: restaurantId, name: line, display_order: (categories?.length || 0) + 1 }])
            .select()
            .single();
          if (cat) currentCategory = cat.id;
          continue;
        }

        const parts = line.split('-').map(p => p.trim());
        if (parts.length >= 2 && currentCategory) {
          newProducts.push({
            restaurant_id: restaurantId,
            category_id: currentCategory,
            name: parts[0],
            price: parseFloat(parts[1].replace('R$', '').replace(',', '.').trim()) || 0,
            description: parts[2] || "",
            is_available: true
          });
        }
      }

      if (newProducts.length > 0) {
        const { error } = await supabase.from('products').insert(newProducts);
        if (error) throw error;
        toast.success(`${newProducts.length} produtos importados!`);
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        setShowImport(false);
        setImportText("");
      }
    } catch (error: any) {
      toast.error("Erro na importação: " + error.message);
    } finally {
      setImportLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <Wand2 className="w-5 h-5 text-primary" />
          <div>
            <h4 className="font-bold text-white text-sm">Gerador de Cardápio IA</h4>
            <p className="text-[10px] text-slate-400">Importe textos, imagens ou use sugestões inteligentes.</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowImport(true)} className="bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-full h-8 px-4">
          <Sparkles className="w-3.5 h-3.5 mr-2" /> Importar Texto
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 p-1 rounded-xl">
          <TabsTrigger value="categories" className="rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">Categorias</TabsTrigger>
          <TabsTrigger value="products" className="rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4 pt-4">
          <div className="flex gap-2">
            <Input id="new-cat" placeholder="Nome da nova categoria" className="flex-1" onKeyDown={(e) => {
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
            }} className="bg-primary hover:shadow-md transition-all">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>

          <div className="grid gap-3">
            {categories?.map((cat) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                  <span className="font-medium text-slate-800">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)} className="h-8 w-8 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="pt-4">
          <ProductList restaurantId={restaurantId} categories={categories || []} />
        </TabsContent>
      </Tabs>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="sm:max-w-[600px] bg-[#1e293b] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Importador de Texto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-xs text-slate-300 leading-relaxed">
              <p className="font-bold text-primary mb-1">Como usar:</p>
              <p>1. Cole o texto do cardápio abaixo.</p>
              <p>2. Use o formato: <span className="text-white font-mono">Produto - Preço - Descrição</span></p>
              <p>3. Linhas em <span className="text-white font-bold">MAIÚSCULAS</span> criam novas categorias.</p>
            </div>
            <Textarea 
              placeholder="Ex:&#10;HAMBÚRGUERES&#10;Classic Burger - 25,00 - Pão, carne e queijo&#10;BEBIDAS&#10;Coca Lata - 6,00" 
              className="min-h-[250px] bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-primary/20"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowImport(false)} className="text-slate-400 hover:text-white">Cancelar</Button>
            <Button 
              onClick={handleTextImport} 
              disabled={importLoading || !importText.trim()}
              className="bg-primary hover:bg-primary/90 rounded-xl px-8"
            >
              {importLoading ? "Processando..." : "Importar Agora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}

function ProductList({ restaurantId, categories }: { restaurantId: string, categories: Category[] }) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId);
      if (error) throw error;
      return data as Product[];
    }
  });

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success("Produto excluído!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Produtos Cadastrados</h3>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="rounded-full px-6">
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products?.map(prod => (
          <Card key={prod.id} className="overflow-hidden hover:shadow-lg transition-all border-slate-200">
            <CardContent className="p-0 flex flex-col sm:flex-row h-full">
              {prod.image_url ? (
                <img src={prod.image_url} className="w-full sm:w-32 h-32 object-cover" alt={prod.name} />
              ) : (
                <div className="w-full sm:w-32 h-32 bg-slate-100 flex items-center justify-center text-slate-400">
                  Sem Foto
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900">{prod.name}</h4>
                    <span className="text-primary font-bold">R$ {prod.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{prod.description}</p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setEditingProduct(prod)}>Editar</Button>
                  <Button variant="outline" size="sm" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteProduct(prod.id)}>Excluir</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(showAddForm || editingProduct) && (
        <ProductDialog 
          restaurantId={restaurantId} 
          categories={categories} 
          product={editingProduct} 
          open={showAddForm || !!editingProduct} 
          onOpenChange={(open) => {
            if (!open) {
              setShowAddForm(false);
              setEditingProduct(null);
            }
          }} 
        />
      )}
    </div>
  );
}

function ProductDialog({ restaurantId, categories, product, open, onOpenChange }: { restaurantId: string, categories: Category[], product: Product | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: "",
    description: "",
    price: 0,
    category_id: categories[0]?.id || "",
    is_available: true,
    is_featured: false,
    restaurant_id: restaurantId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product?.id) {
        const { error } = await supabase.from('products').update(formData as any).eq('id', product.id);
        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase.from('products').insert([formData as any]);
        if (error) throw error;
        toast.success("Produto criado!");
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prod-name">Nome</Label>
            <Input id="prod-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prod-price">Preço (R$)</Label>
            <Input id="prod-price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prod-cat">Categoria</Label>
            <Select value={formData.category_id} onValueChange={(v) => setFormData({...formData, category_id: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prod-desc">Descrição</Label>
            <Textarea id="prod-desc" value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prod-image">URL da Imagem (opcional)</Label>
            <Input id="prod-image" value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar Produto"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
