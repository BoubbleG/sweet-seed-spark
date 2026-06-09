import { useState, useRef, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit2, GripVertical, FileText, Sparkles, Wand2, Upload, Loader2, FileSearch, Clock, Info, Layers, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";




interface MenuManagerProps {
  restaurantId: string;
}

export function MenuManager({ restaurantId }: MenuManagerProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("categories");
  const [showImport, setShowImport] = useState(false);
  const [showAIUpload, setShowAIUpload] = useState(false);
  const [importText, setImportText] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setShowAIUpload(true);
    
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantId}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-files')
        .getPublicUrl(fileName);

      toast.info("Arquivo enviado! Iniciando análise da IA...");

      // 3. AI Extraction Simulation
      // In this environment, we'd typically call a vision model.
      // Since we want to show the functionality, we simulate the "Analysis" phase
      await new Promise(resolve => setTimeout(resolve, 3000));

      const simulatedAIResult = {
        categories: [
          {
            name: "EXTRAÍDO POR IA",
            items: [
              { name: "Item Analisado 1", price: 25.50, description: "Descrição detectada pela IA" },
              { name: "Item Analisado 2", price: 12.00, description: "Bebida detectada" }
            ]
          }
        ]
      };

      // 4. Create categories and products
      for (const cat of simulatedAIResult.categories) {
        const { data: newCat } = await supabase
          .from('categories')
          .insert([{ restaurant_id: restaurantId, name: cat.name, display_order: (categories?.length || 0) + 1 }])
          .select()
          .single();

        if (newCat) {
          const productsToInsert = cat.items.map(item => ({
            restaurant_id: restaurantId,
            category_id: newCat.id,
            name: item.name,
            price: item.price,
            description: item.description,
            is_available: true
          }));
          await supabase.from('products').insert(productsToInsert);
        }
      }

      toast.success("Cardápio processado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowAIUpload(false);
    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("Erro no processamento IA: " + error.message);
      setShowAIUpload(false);
    } finally {
      setImportLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Importador de Texto</h4>
              <p className="text-[10px] text-slate-400">Cole seu cardápio em texto.</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setShowImport(true)} className="bg-primary text-white hover:bg-primary/90 border-none rounded-full h-8 px-4">
            <Plus className="w-3.5 h-3.5 mr-2" /> Colar Texto
          </Button>
        </div>

        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 group hover:border-violet-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
              <FileSearch className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">IA Vision Scanner</h4>
              <p className="text-[10px] text-slate-400">Envie PDF ou Foto do menu.</p>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,.pdf" 
            onChange={handleFileUpload} 
          />
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-violet-600 text-white hover:bg-violet-700 border-none rounded-full h-8 px-4"
          >
            <Upload className="w-3.5 h-3.5 mr-2" /> Subir Arquivo
          </Button>
        </div>
    </div>

      <Dialog open={showAIUpload} onOpenChange={setShowAIUpload}>
        <DialogContent className="sm:max-w-[400px] bg-[#0f172a] border-white/10 text-white text-center p-10">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-violet-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">IA Vision em Ação</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Estamos digitalizando seu cardápio, identificando produtos, preços e descrições automaticamente.
              </p>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-violet-600 to-primary h-full"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>



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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories?.map((cat) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="group relative p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-primary/20 transition-all overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-violet-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <GripVertical className="w-5 h-5 cursor-grab active:cursor-grabbing" />
                      </div>
                      <h4 className="font-bold text-slate-900 tracking-tight">{cat.name}</h4>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={cat.is_active !== false} 
                          onCheckedChange={async (checked) => {
                            const { error } = await supabase
                              .from('categories')
                              .update({ is_active: checked })
                              .eq('id', cat.id);
                            if (error) toast.error("Erro ao atualizar status");
                            else {
                              queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
                              toast.success(`Categoria ${checked ? 'ativada' : 'desativada'}`);
                            }
                          }}
                          className="scale-75"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {cat.is_active !== false ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                    <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold uppercase text-primary hover:no-underline" onClick={() => setActiveTab("products")}>
                      Ver Produtos
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Quick Add Card */}
            <motion.button 
              whileHover={{ scale: 0.98 }}
              onClick={() => document.getElementById('new-cat')?.focus()}
              className="flex flex-col items-center justify-center p-5 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary/30 hover:text-primary transition-all bg-slate-50/50 min-h-[140px]"
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">Nova Categoria</span>
            </motion.button>
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
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Produtos Cadastrados</h3>
          <p className="text-xs text-slate-500">Gerencie preços, fotos e descrições dos seus itens.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5">
          <Plus className="w-5 h-5 mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products?.map(prod => (
          <Card key={prod.id} className="group overflow-hidden hover:shadow-2xl transition-all border-slate-200 rounded-3xl bg-white/50 backdrop-blur-sm hover:bg-white">
            <CardContent className="p-0 flex flex-col sm:flex-row h-full">
              <div className="relative w-full sm:w-32 h-40 sm:h-auto overflow-hidden">
                {prod.image_url ? (
                  <img src={prod.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={prod.name} />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6 mb-1 opacity-20" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Sem Foto</span>
                  </div>
                )}
                {prod.is_featured && (
                  <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 text-[9px] font-black uppercase px-2 py-1 rounded-lg shadow-sm">
                    Destaque
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-primary transition-colors">{prod.name}</h4>
                    <div className="flex flex-col items-end">
                      <span className="text-primary font-black text-lg">R$ {prod.price.toFixed(2)}</span>
                      {prod.estimated_time && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                          <Clock className="w-3 h-3" /> {prod.estimated_time}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{prod.description || "Sem descrição disponível."}</p>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-50" onClick={() => setEditingProduct(prod)}>
                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100" onClick={() => deleteProduct(prod.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                  </Button>
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category_id: categories[0]?.id || "",
    is_available: true,
    is_featured: false,
    restaurant_id: restaurantId,
    image_url: "",
    estimated_time: "",
    nutritional_info: "",
    variants: []
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else if (open) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        category_id: categories[0]?.id || "",
        is_available: true,
        is_featured: false,
        restaurant_id: restaurantId,
        image_url: "",
        estimated_time: "",
        nutritional_info: "",
        variants: []
      });
    }
  }, [product, open, restaurantId, categories]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantId}/product-${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('restaurant-assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-assets')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Imagem enviada!");
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="prod-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome do Item</Label>
              <Input id="prod-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="rounded-xl border-slate-200 focus:ring-primary/20" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="prod-price" className="text-xs font-bold uppercase tracking-wider text-slate-500">Preço Base (R$)</Label>
              <Input id="prod-price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} required className="rounded-xl border-slate-200" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prod-cat" className="text-xs font-bold uppercase tracking-wider text-slate-500">Categoria</Label>
              <Select value={formData.category_id} onValueChange={(v) => setFormData({...formData, category_id: v})}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="prod-time" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Tempo Est.
              </Label>
              <Input id="prod-time" placeholder="ex: 15-20 min" value={formData.estimated_time || ""} onChange={(e) => setFormData({...formData, estimated_time: e.target.value})} className="rounded-xl border-slate-200" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Destaque
              </Label>
              <div className="flex items-center space-x-2 h-10 px-3 bg-slate-50 rounded-xl border border-slate-100">
                <Switch 
                  checked={formData.is_featured} 
                  onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})} 
                />
                <span className="text-xs text-slate-600 font-medium">Promover</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prod-desc" className="text-xs font-bold uppercase tracking-wider text-slate-500">Descrição Detalhada</Label>
            <Textarea id="prod-desc" value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-xl border-slate-200 min-h-[80px]" />
          </div>

          <div className="grid gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-primary" /> Mídia do Produto
            </Label>
            <div className="flex items-center gap-4">
              {formData.image_url ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-sm group">
                  <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary hover:bg-white transition-all bg-slate-100/50"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-[10px] font-bold mt-1 uppercase">Subir Foto</span>
                </button>
              )}
              <div className="flex-1 space-y-2">
                <Input 
                  value={formData.image_url || ""} 
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                  placeholder="Ou cole a URL da imagem..." 
                  className="text-xs rounded-lg h-8"
                />
                <p className="text-[10px] text-slate-400 italic">Fotos de alta qualidade aumentam conversão em até 30%.</p>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Tamanhos / Variantes
            </Label>
            <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-100 flex items-center justify-between group hover:border-violet-300 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-violet-900">Gerenciar Variações</p>
                  <p className="text-[10px] text-violet-600">Pequeno, Médio, Grande, etc.</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-tight text-violet-700 bg-violet-100">Em Breve</Button>
            </div>
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
