import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Palette, Layout, Type, Smartphone, Check, Upload, Trash2, Sliders, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface VisualManagerProps {
  restaurant: Restaurant;
}

export function VisualManager({ restaurant }: VisualManagerProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Restaurant>>(restaurant);

  useEffect(() => {
    setFormData(restaurant);
  }, [restaurant]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update(formData as any)
        .eq('id', restaurant.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      toast.success("Design atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'banner_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/${field}-${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('restaurant-assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-assets')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, [field]: publicUrl }));
      toast.success("Imagem enviada!");
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      {/* Settings Section */}
      <div className="space-y-8">
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">Personalização Master</h3>
              <p className="text-sm text-zinc-500">Defina a identidade do seu cardápio</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Branding Section */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Logotipo</Label>
                <div className="relative aspect-square rounded-3xl border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-zinc-100 transition-all">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} className="w-full h-full object-cover p-2" />
                  ) : (
                    <Upload className="w-6 h-6 text-zinc-400" />
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'logo_url')} />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Banner de Capa</Label>
                <div className="relative aspect-square rounded-3xl border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-zinc-100 transition-all">
                  {formData.banner_url ? (
                    <img src={formData.banner_url} className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-zinc-400" />
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'banner_url')} />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Fonte</Label>
                <Select value={formData.font_family || 'Outfit'} onValueChange={v => setFormData({...formData, font_family: v})}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outfit">Outfit</SelectItem>
                    <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estilo Cards</Label>
                <Select value={formData.card_style || 'glass'} onValueChange={v => setFormData({...formData, card_style: v})}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glass">Glassmorphism</SelectItem>
                    <SelectItem value="flat">Minimal</SelectItem>
                    <SelectItem value="elevated">Shadow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleUpdate} disabled={loading} className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black hover:bg-zinc-800 transition-all shadow-xl">
              {loading ? 'Sincronizando...' : 'Publicar Alterações'}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="relative flex justify-center lg:justify-start">
        <div className="sticky top-20">
          <div className="w-[300px] h-[600px] rounded-[3rem] bg-white border-8 border-zinc-900 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-zinc-50" />
            
            {/* Preview Banner */}
            <div className="h-32 w-full relative">
              {formData.banner_url && <img src={formData.banner_url} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-6 relative z-10" style={{ fontFamily: formData.font_family || 'Outfit' }}>
              <div className="w-20 h-20 rounded-2xl bg-white -mt-10 mb-4 shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
                 {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" /> : <span className="text-2xl font-black">{restaurant.name.charAt(0)}</span>}
              </div>
              
              <h2 className="text-lg font-black text-zinc-900 mb-6">{restaurant.name}</h2>
              
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4 p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm" style={{ borderRadius: formData.border_radius }}>
                    <div className="w-16 h-16 rounded-xl bg-zinc-100" />
                    <div className="flex-1 py-1">
                      <div className="w-24 h-3 bg-zinc-900 rounded-full mb-2" />
                      <div className="w-16 h-2 bg-zinc-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
