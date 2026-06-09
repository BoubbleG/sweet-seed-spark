import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Palette, Layout, Type, Smartphone, Check, Upload, Trash2 } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Controls */}
        <div className="space-y-6">
          <Card className="bg-[#1e293b]/40 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden rounded-[2rem] transition-all duration-500 hover:shadow-primary/5">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="w-5 h-5 text-primary" />
                Identidade Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Logo & Banner Upload */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-slate-400">Logotipo</Label>
                  <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-white/10 overflow-hidden bg-white/5 flex flex-col items-center justify-center transition-all hover:border-primary/50">
                    {formData.logo_url ? (
                      <>
                        <img src={formData.logo_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, logo_url: "" }))}>
                            <Trash2 className="w-5 h-5 text-rose-500" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-500 mb-2" />
                        <span className="text-[10px] text-slate-500">Subir Logo</span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo_url')} />
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-400">Banner Superior (Hero)</Label>
                  <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-white/10 overflow-hidden bg-white/5 flex flex-col items-center justify-center transition-all hover:border-primary/50">
                    {formData.banner_url ? (
                      <>
                        <img src={formData.banner_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, banner_url: "" }))}>
                            <Trash2 className="w-5 h-5 text-rose-500" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-500 mb-2" />
                        <span className="text-[10px] text-slate-500">Subir Banner</span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_url')} />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-400">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="w-12 h-10 p-1 bg-white/5 border-white/10" />
                    <Input value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} className="flex-1 bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Cor do Botão</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={formData.button_color || formData.primary_color} onChange={(e) => setFormData({ ...formData, button_color: e.target.value })} className="w-12 h-10 p-1 bg-white/5 border-white/10" />
                    <Input value={formData.button_color || formData.primary_color} onChange={(e) => setFormData({ ...formData, button_color: e.target.value })} className="flex-1 bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
              </div>

              {/* Layout & Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-slate-400 flex items-center gap-2">
                    <Type className="w-4 h-4" /> Tipografia do Título
                  </Label>
                  <Select value={formData.font_family || 'Outfit'} onValueChange={(v) => setFormData({ ...formData, font_family: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Outfit">Outfit (Moderna)</SelectItem>
                      <SelectItem value="Space Grotesk">Space Grotesk (Quadrada)</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-400 flex items-center gap-2">
                    <Layout className="w-4 h-4" /> Estilo dos Cards
                  </Label>
                  <Select value={formData.card_style || 'glass'} onValueChange={(v) => setFormData({ ...formData, card_style: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glass">Glassmorphism (Transparente)</SelectItem>
                      <SelectItem value="flat">Flat (Sólido)</SelectItem>
                      <SelectItem value="bordered">Bordered (Com Borda)</SelectItem>
                      <SelectItem value="elevated">Elevated (Sombra Profunda)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-slate-400">Arredondamento de Cantos</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['0', '0.5rem', '1rem', '1.5rem', '2.5rem'].map((radius) => (
                      <button
                        key={radius}
                        onClick={() => setFormData({ ...formData, border_radius: radius })}
                        className={`h-10 rounded-lg border transition-all ${
                          formData.border_radius === radius 
                            ? 'bg-primary border-primary text-white shadow-lg' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {radius === '0' ? 'None' : radius.replace('rem', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-400">Modo de Exibição</Label>
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                    <Button 
                      variant="ghost" 
                      className={`flex-1 rounded-lg h-9 text-xs ${formData.visual_style !== 'premium' ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                      onClick={() => setFormData({ ...formData, visual_style: 'modern' })}
                    >
                      Claro/Auto
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`flex-1 rounded-lg h-9 text-xs ${formData.visual_style === 'premium' ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                      onClick={() => setFormData({ ...formData, visual_style: 'premium' })}
                    >
                      Dark Force
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleUpdate} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-violet-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all h-12 rounded-xl font-bold text-white"
                >
                  {loading ? "Salvando Configurações..." : "Salvar Design Master"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Preview */}
        <div className="space-y-4 sticky top-12">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
              <Smartphone className="w-4 h-4" /> Visualização Mobile
            </h3>
            <span className="text-[10px] text-slate-500">Visualização em tempo real</span>
          </div>
          
          <div className="relative w-full max-w-[320px] mx-auto aspect-[9/19] rounded-[3rem] border-8 border-slate-800 bg-[#020617] shadow-2xl overflow-hidden overflow-y-auto scrollbar-hide">
            {/* Header Banner Preview */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-900">
              {formData.banner_url && (
                <img src={formData.banner_url} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
            </div>

            {/* Content Preview */}
            <div className="px-4 -mt-12 relative z-10 pb-8" style={{ fontFamily: (formData.font_family || 'Outfit').replace(' (Quadrada)', '') }}>
              <div className={`p-4 border border-white/10 shadow-xl mb-6 text-center flex flex-col items-center gap-2 ${
                formData.card_style === 'glass' ? 'bg-white/5 backdrop-blur-xl' :
                formData.card_style === 'bordered' ? 'bg-transparent border-2 border-white/20' :
                formData.card_style === 'elevated' ? 'bg-slate-900 shadow-2xl' : 'bg-white/10'
              }`} style={{ borderRadius: formData.border_radius || '1rem' }}>
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg -mt-12 overflow-hidden flex items-center justify-center">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-2xl">
                      {restaurant.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h4 className="text-white font-bold text-lg mt-2 tracking-tight transition-all hover:scale-105 cursor-default">{restaurant.name}</h4>
                <div className="w-20 h-1 bg-primary/30 rounded-full" style={{ backgroundColor: `${formData.primary_color}33`, borderRadius: '999px' }} />
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Premium Delivery</p>
              </div>

              {/* Sample Product */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Populares</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className={`p-3 flex gap-3 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group cursor-pointer ${
                  formData.card_style === 'glass' ? 'bg-white/5 backdrop-blur-xl' :
                  formData.card_style === 'bordered' ? 'bg-transparent border-2 border-white/20' :
                  formData.card_style === 'elevated' ? 'bg-slate-900 shadow-2xl' : 'bg-white/10'
                }`} style={{ borderRadius: `calc(${formData.border_radius || '1rem'} * 0.8)` }}>
                  <div className="flex-1 space-y-2">
                    <h5 className="text-xs font-bold text-white">Classic Burger</h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1">Pão brioche, carne, queijo...</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-bold text-white">R$ 35,00</span>
                      <Button size="sm" className="h-7 px-3 text-[10px] rounded-full shadow-lg" style={{ backgroundColor: formData.button_color || formData.primary_color }}>
                        Adicionar
                      </Button>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-xl bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
