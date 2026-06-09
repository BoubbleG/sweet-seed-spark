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
import { Palette, Layout, Type, Smartphone, Check, Upload, Trash2, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
      {/* Settings Column */}
      <div className="lg:col-span-7 space-y-8">
        <section className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <header className="px-8 py-6 border-b border-zinc-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">Identidade Master</h3>
              <p className="text-xs text-zinc-500">Controle o DNA visual do seu cardápio</p>
            </div>
          </header>

          <div className="p-8 space-y-10">
            {/* Visual Assets */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Logotipo Principal</Label>
                <div className="relative aspect-square rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center hover:bg-white hover:border-primary/50 transition-all overflow-hidden group">
                  {formData.logo_url ? (
                    <>
                      <img src={formData.logo_url} className="w-full h-full object-cover p-4" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setFormData(p => ({...p, logo_url: ''}))} className="text-white">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                      <span className="text-[10px] font-bold text-zinc-400">Subir Logo</span>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'logo_url')} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Banner de Capa (Hero)</Label>
                <div className="relative aspect-square rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center hover:bg-white hover:border-primary/50 transition-all overflow-hidden group">
                  {formData.banner_url ? (
                    <>
                      <img src={formData.banner_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setFormData(p => ({...p, banner_url: ''}))} className="text-white">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                      <span className="text-[10px] font-bold text-zinc-400">Subir Hero</span>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'banner_url')} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Typography & Style */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Type className="w-4 h-4" /> Tipografia
                </Label>
                <Select value={formData.font_family || 'Outfit'} onValueChange={v => setFormData({...formData, font_family: v})}>
                  <SelectTrigger className="rounded-2xl border-zinc-200 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outfit">Outfit (Moderna)</SelectItem>
                    <SelectItem value="Space Grotesk">Space Grotesk (Tech)</SelectItem>
                    <SelectItem value="Inter">Inter (Sleek)</SelectItem>
                    <SelectItem value="Montserrat">Montserrat (Classic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Estilo de Design
                </Label>
                <Select value={formData.card_style || 'glass'} onValueChange={v => setFormData({...formData, card_style: v})}>
                  <SelectTrigger className="rounded-2xl border-zinc-200 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glass">Glassmorphism</SelectItem>
                    <SelectItem value="flat">Minimal Flat</SelectItem>
                    <SelectItem value="elevated">Deep Shadow</SelectItem>
                    <SelectItem value="bordered">Outlined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Cores de Marca</Label>
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-10 rounded-xl border border-zinc-200 flex items-center px-3 gap-2 bg-white">
                      <input type="color" value={formData.primary_color} onChange={e => setFormData({...formData, primary_color: e.target.value})} className="w-6 h-6 rounded-full border-none p-0 cursor-pointer" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{formData.primary_color}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block text-center">Primária</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-10 rounded-xl border border-zinc-200 flex items-center px-3 gap-2 bg-white">
                      <input type="color" value={formData.button_color || formData.primary_color} onChange={e => setFormData({...formData, button_color: e.target.value})} className="w-6 h-6 rounded-full border-none p-0 cursor-pointer" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{formData.button_color || formData.primary_color}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block text-center">Botões</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Arredondamento</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['0', '1rem', '2rem', '999px'].map(r => (
                    <button 
                      key={r} 
                      onClick={() => setFormData({...formData, border_radius: r})}
                      className={`h-10 rounded-xl border transition-all ${formData.border_radius === r ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300'}`}
                    >
                      <span className="text-[10px] font-bold">{r === '999px' ? 'Full' : r === '0' ? 'None' : r.replace('rem', '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleUpdate} disabled={loading} className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-zinc-900/10">
              {loading ? 'Sincronizando...' : 'Publicar Alterações Visuais'}
            </Button>
          </div>
        </section>
      </div>

      {/* Mobile Preview Column */}
      <div className="lg:col-span-5 relative">
        <div className="sticky top-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full">
            <Smartphone className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Preview</span>
          </div>
          
          <div className="relative w-[320px] h-[650px] rounded-[3.5rem] border-[12px] border-zinc-900 bg-white shadow-2xl shadow-zinc-900/20 overflow-hidden overflow-y-auto scrollbar-hide">
             {/* Mock Content */}
             <div className="relative h-40 bg-zinc-100">
               {formData.banner_url && <img src={formData.banner_url} className="w-full h-full object-cover" />}
               <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
             </div>
             
             <div className="px-6 -mt-12 relative z-10 pb-10" style={{ fontFamily: formData.font_family || 'Outfit' }}>
                <div className="flex flex-col items-center gap-4 p-6 bg-white border border-zinc-100 shadow-xl" style={{ borderRadius: formData.border_radius || '2rem' }}>
                  <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-lg -mt-16 overflow-hidden flex items-center justify-center border-4 border-white">
                    {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary flex items-center justify-center text-white text-2xl font-black">{restaurant.name.charAt(0)}</div>}
                  </div>
                  <h4 className="text-xl font-black text-zinc-900">{restaurant.name}</h4>
                  <div className="w-12 h-1 rounded-full" style={{ backgroundColor: formData.primary_color }} />
                </div>

                <div className="mt-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-sm uppercase tracking-widest text-zinc-900">Best Sellers</h5>
                    <Sliders className="w-4 h-4 text-zinc-400" />
                  </div>

                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className={`p-4 flex gap-4 border border-zinc-100 transition-all ${formData.card_style === 'glass' ? 'bg-zinc-50/50 backdrop-blur-md' : 'bg-white shadow-sm'}`} style={{ borderRadius: `calc(${formData.border_radius || '1.5rem'} * 0.7)` }}>
                        <div className="flex-1">
                          <h6 className="font-bold text-zinc-900 text-sm">Gourmet Burger Deluxe</h6>
                          <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">Brioche, 200g angus, queijo cheddar...</p>
                          <div className="mt-3 flex justify-between items-center">
                            <span className="font-black text-zinc-900">R$ 45,00</span>
                            <div className="h-8 px-4 rounded-full flex items-center justify-center text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: formData.button_color || formData.primary_color }}>Add</div>
                          </div>
                        </div>
                        <div className="w-20 h-20 rounded-2xl bg-zinc-100" />
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
