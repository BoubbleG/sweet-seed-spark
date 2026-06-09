import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Restaurant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Wand2, Upload, ChevronRight, Store, Palette, Globe, Pipette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { extractColorsFromImage } from "@/lib/color-extractor";

interface RestaurantDialogProps {
  restaurant?: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestaurantDialog({ restaurant, open, onOpenChange }: RestaurantDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>(restaurant ? 'manual' : 'ai');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: "",
    slug: "",
    business_type: "hamburgueria",
    whatsapp: "",
    description: "",
    address: "",
    city: "",
    opening_hours: "",
    delivery_fee: 0,
    min_order_for_free_delivery: 0,
    average_delivery_time: "30-45 min",
    status: "active",
    primary_color: "#ef4444",
    visual_style: "modern"
  });

  useEffect(() => {
    if (restaurant) {
      setFormData(restaurant);
      setCreationMode('manual');
    } else {
      setFormData({
        name: "",
        slug: "",
        business_type: "hamburgueria",
        whatsapp: "",
        description: "",
        address: "",
        city: "",
        opening_hours: "",
        delivery_fee: 0,
        min_order_for_free_delivery: 0,
        average_delivery_time: "30-45 min",
        status: "active",
        primary_color: "#ef4444",
        visual_style: "modern"
      });
      setCreationMode('ai');
      setExtractedColors([]);
    }
  }, [restaurant, open]);

  const handleAiCreation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    const toastId = toast.loading("Extraindo cores reais e gerando estilo...");

    try {
      // 1. Extract REAL colors first (deterministic and accurate)
      const imageUrl = URL.createObjectURL(file);
      const colors = await extractColorsFromImage(imageUrl);
      setExtractedColors(colors);

      // 2. Call AI for style suggestion
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const base64Image = await base64Promise;

      const { data, error } = await supabase.functions.invoke('ai-designer', {
        body: { 
          image: base64Image,
          extractedColors: colors
        }
      });

      if (error) throw error;

      if (data.design) {
        setFormData(prev => ({
          ...prev,
          ...data.design,
          name: "Novo Restaurante", 
          slug: "restaurante-ia-" + Math.random().toString(36).substring(7),
          primary_color: colors[0] || data.design.primary_color,
          status: "active"
        }));
        setCreationMode('manual');
        toast.success("Identidade visual aplicada com cores reais da imagem!", { id: toastId });
      }
    } catch (error: any) {
      console.error("Creation error:", error);
      toast.error("Erro ao processar imagem.", { id: toastId });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (restaurant?.id) {
        const { error } = await supabase
          .from("restaurants")
          .update(formData as any)
          .eq("id", restaurant.id);
        if (error) throw error;
        toast.success("Restaurante atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("restaurants")
          .insert([formData as any]);
        if (error) throw error;
        toast.success("Restaurante cadastrado com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao salvar restaurante: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-white/20 shadow-2xl rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent tracking-tighter">
            {restaurant ? "Editar Configurações" : "Novo Projeto Master"}
          </DialogTitle>
          <DialogDescription className="font-medium text-zinc-500">
            {restaurant ? "Ajuste os parâmetros básicos do restaurante." : "Inicie um novo cardápio digital de alta performance."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {!restaurant && (
            <div className="flex p-1 bg-zinc-100 rounded-2xl mb-8">
              <button 
                type="button"
                onClick={() => setCreationMode('ai')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creationMode === 'ai' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                <Sparkles className="w-3.5 h-3.5" /> IA Designer
              </button>
              <button 
                type="button"
                onClick={() => setCreationMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creationMode === 'manual' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                <Wand2 className="w-3.5 h-3.5" /> Manual
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {creationMode === 'ai' && !restaurant ? (
              <motion.div 
                key="ai-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-10 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white shadow-2xl">
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mb-4 tracking-tight">Criação Instantânea por IA</h3>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-10 leading-relaxed font-medium">
                  Envie o logotipo ou uma foto do local. Extrairemos as cores reais e a IA criará todo o Design System em segundos.
                </p>
                
                <Button 
                  disabled={isAiProcessing}
                  onClick={() => aiFileInputRef.current?.click()}
                  className="w-full h-16 bg-zinc-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-zinc-900/10 group"
                >
                  {isAiProcessing ? "Analisando..." : "Selecionar Referência"}
                  {!isAiProcessing && <Upload className="ml-3 w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />}
                </Button>
                <input type="file" ref={aiFileInputRef} className="hidden" accept="image/*" onChange={handleAiCreation} />
              </motion.div>
            ) : (
              <motion.div
                key="manual-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nome do Restaurante</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                        required 
                        className="h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Slug (URL)</Label>
                      <Input 
                        id="slug" 
                        value={formData.slug} 
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, "-") })} 
                        placeholder="ex: burger-prime"
                        required 
                        className="h-12 rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_type" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Segmento</Label>
                      <Select 
                        value={formData.business_type} 
                        onValueChange={(v) => setFormData({ ...formData, business_type: v })}
                      >
                        <SelectTrigger className="h-12 rounded-xl font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hamburgueria">Hamburgueria</SelectItem>
                          <SelectItem value="pizzaria">Pizzaria</SelectItem>
                          <SelectItem value="cafeteria">Cafeteria</SelectItem>
                          <SelectItem value="restaurante">Restaurante Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">WhatsApp Comercial</Label>
                      <Input 
                        id="whatsapp" 
                        value={formData.whatsapp} 
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, "") })} 
                        placeholder="5511..."
                        required 
                        className="h-12 rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  {formData.primary_color && creationMode === 'manual' && !restaurant && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-6 bg-zinc-50 border border-zinc-200 rounded-[2rem]"
                    >
                      <div className="flex items-center gap-6 mb-6">
                        <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg shrink-0" style={{ backgroundColor: formData.primary_color }} />
                        <div>
                          <h4 className="font-black text-zinc-900 text-sm">Design System Ativo</h4>
                          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">IA definiu: {formData.visual_style} • {formData.font_family}</p>
                        </div>
                      </div>
                      
                      {extractedColors.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Cores Extraídas da Imagem</p>
                          <div className="flex flex-wrap gap-2">
                             {extractedColors.map(color => (
                               <button
                                 key={color}
                                 type="button"
                                 onClick={() => setFormData({...formData, primary_color: color})}
                                 className={`w-8 h-8 rounded-full border-2 transition-all ${formData.primary_color === color ? 'border-zinc-900 scale-110 shadow-lg' : 'border-white hover:scale-110'}`}
                                 style={{ backgroundColor: color }}
                               />
                             ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <DialogFooter className="pt-8 mt-6 border-t gap-3">
                    <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">Cancelar</Button>
                    <Button type="submit" disabled={loading} className="bg-zinc-900 text-white hover:bg-primary transition-all rounded-xl h-12 px-8 font-black uppercase tracking-widest shadow-xl shadow-zinc-900/10">
                      {loading ? "Salvando..." : (restaurant ? "Salvar Alterações" : "Finalizar Projeto")}
                    </Button>
                  </DialogFooter>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
