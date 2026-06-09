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
import { Sparkles, Wand2, Upload, ChevronRight, Store, Palette, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    }
    if (!restaurant) setCreationMode('ai');
  }, [restaurant, open]);

  const handleAiCreation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    const toastId = toast.loading("IA analisando marca e criando identidade...");

    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const base64Image = await base64Promise;

      const { data, error } = await supabase.functions.invoke('ai-designer', {
        body: { image: base64Image }
      });

      if (error) throw error;

      if (data.design) {
        setFormData(prev => ({
          ...prev,
          ...data.design,
          name: "Restaurante Inteligente", // Placeholder detectado
          slug: "restaurante-ia-" + Math.random().toString(36).substring(7),
          business_type: "restaurante",
          status: "active"
        }));
        setCreationMode('manual');
        toast.success("Identidade visual gerada com sucesso pela IA!", { id: toastId });
      }
    } catch (error: any) {
      toast.error("Erro na criação assistida.", { id: toastId });
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            {restaurant ? "Editar Restaurante" : "Novo Restaurante"}
          </DialogTitle>
          <DialogDescription>
            Configure as informações básicas e o estilo visual do seu cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Restaurante</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Link Personalizado (Slug)</Label>
              <Input 
                id="slug" 
                value={formData.slug} 
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, "-") })} 
                placeholder="ex: burger-do-bairro"
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_type">Tipo de Negócio</Label>
              <Select 
                value={formData.business_type} 
                onValueChange={(v) => setFormData({ ...formData, business_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hamburgueria">Hamburgueria</SelectItem>
                  <SelectItem value="pizzaria">Pizzaria</SelectItem>
                  <SelectItem value="marmitaria">Marmitaria</SelectItem>
                  <SelectItem value="cafeteria">Cafeteria</SelectItem>
                  <SelectItem value="açaiteria">Açaíteria</SelectItem>
                  <SelectItem value="restaurante">Restaurante Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
              <Input 
                id="whatsapp" 
                value={formData.whatsapp} 
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, "") })} 
                placeholder="ex: 5511999999999"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Curta</Label>
            <Textarea 
              id="description" 
              value={formData.description || ""} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={formData.city || ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
              <Input 
                id="delivery_fee" 
                type="number" 
                step="0.01" 
                value={formData.delivery_fee} 
                onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_order">Valor Mín. Entrega Grátis</Label>
              <Input 
                id="min_order" 
                type="number" 
                step="0.01" 
                value={formData.min_order_for_free_delivery || 0} 
                onChange={(e) => setFormData({ ...formData, min_order_for_free_delivery: parseFloat(e.target.value) })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_time">Tempo Médio</Label>
              <Input id="delivery_time" value={formData.average_delivery_time || ""} onChange={(e) => setFormData({ ...formData, average_delivery_time: e.target.value })} />
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-4 text-slate-800">Preview & Identidade Visual</h3>
            <p className="text-xs text-slate-500 mb-6">
              As opções detalhadas de cores, tipografia e estilos agora estão no menu <b>Personalização</b> na barra lateral após criar o restaurante.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Cor Principal</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    id="primary_color" 
                    value={formData.primary_color} 
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} 
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    value={formData.primary_color} 
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} 
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visual_style">Tema Base</Label>
                <Select 
                  value={formData.visual_style} 
                  onValueChange={(v) => setFormData({ ...formData, visual_style: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Moderno (Glassmorphism)</SelectItem>
                    <SelectItem value="minimalista">Minimalista</SelectItem>
                    <SelectItem value="premium">Premium (Dark Mode)</SelectItem>
                    <SelectItem value="artesanal">Artesanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white/80 backdrop-blur-sm pt-4 border-t">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all">
              {loading ? "Salvando..." : (restaurant ? "Salvar Alterações" : "Criar Restaurante")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
