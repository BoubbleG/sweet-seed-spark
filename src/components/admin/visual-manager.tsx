import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Restaurant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Palette, Layout, Type, Upload, Trash2, Zap, Settings, Paintbrush, Monitor, Code } from "lucide-react";

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1600px] mx-auto">
      {/* Settings Column */}
      <div className="lg:col-span-7 space-y-8">
        <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <Tabs defaultValue="identidade" className="w-full">
            <div className="px-8 pt-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 tracking-tight">Designer Master</h3>
                  <p className="text-sm text-zinc-500">Controle total da experiência visual</p>
                </div>
              </div>
              
              <TabsList className="bg-zinc-100/50 p-1 rounded-2xl border border-zinc-200/50">
                <TabsTrigger value="identidade" className="rounded-xl data-[state=active]:bg-white">Identidade</TabsTrigger>
                <TabsTrigger value="estilo" className="rounded-xl data-[state=active]:bg-white">Estilo</TabsTrigger>
                <TabsTrigger value="layout" className="rounded-xl data-[state=active]:bg-white">Layout</TabsTrigger>
                <TabsTrigger value="avançado" className="rounded-xl data-[state=active]:bg-white">Expert</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent value="identidade" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Logotipo Master</Label>
                    <div className="relative aspect-square rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-zinc-100 hover:border-zinc-300 transition-all group">
                      {formData.logo_url ? (
                        <>
                          <img src={formData.logo_url} className="w-full h-full object-cover p-4" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Trash2 className="text-white w-6 h-6" onClick={(e) => { e.stopPropagation(); setFormData({...formData, logo_url: ''}); }} />
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                          <span className="text-[10px] font-bold text-zinc-400">Subir Logo</span>
                        </div>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'logo_url')} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Banner de Capa (Hero)</Label>
                    <div className="relative aspect-square rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-zinc-100 hover:border-zinc-300 transition-all group">
                      {formData.banner_url ? (
                        <>
                          <img src={formData.banner_url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Trash2 className="text-white w-6 h-6" onClick={(e) => { e.stopPropagation(); setFormData({...formData, banner_url: ''}); }} />
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                          <span className="text-[10px] font-bold text-zinc-400">Subir Banner</span>
                        </div>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'banner_url')} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nome do Negócio</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Bio / Descrição</Label>
                    <Textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl min-h-[48px]" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="estilo" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Paintbrush className="w-3.5 h-3.5" /> Cores do Universo
                    </Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <span className="text-xs font-bold text-zinc-600">Cor Primária</span>
                        <input type="color" value={formData.primary_color} onChange={e => setFormData({...formData, primary_color: e.target.value})} className="w-8 h-8 rounded-full border-none cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <span className="text-xs font-bold text-zinc-600">Cor de Fundo</span>
                        <input type="color" value={formData.background_color || '#FDF5E6'} onChange={e => setFormData({...formData, background_color: e.target.value})} className="w-8 h-8 rounded-full border-none cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <span className="text-xs font-bold text-zinc-600">Cor do Texto</span>
                        <input type="color" value={formData.text_color || '#3B2C24'} onChange={e => setFormData({...formData, text_color: e.target.value})} className="w-8 h-8 rounded-full border-none cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Type className="w-3.5 h-3.5" /> Tipografia & Formas
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase">Fonte Principal</span>
                        <Select value={formData.font_family || 'Outfit'} onValueChange={v => setFormData({...formData, font_family: v})}>
                          <SelectTrigger className="h-11 rounded-xl">
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
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase">Arredondamento</span>
                        <Select value={formData.border_radius || '2rem'} onValueChange={v => setFormData({...formData, border_radius: v})}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Quadrado (Retro)</SelectItem>
                            <SelectItem value="0.75rem">Suave (Modern)</SelectItem>
                            <SelectItem value="1.5rem">Arredondado (Friendly)</SelectItem>
                            <SelectItem value="2.5rem">Orgânico (Extra Round)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5" /> Estrutura do App
                    </Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase">Estilo do Cabeçalho</span>
                        <Select value={formData.header_style || 'standard'} onValueChange={v => setFormData({...formData, header_style: v})}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Padrão (Hero + Perfil)</SelectItem>
                            <SelectItem value="floating">Flutuante (Minimalista)</SelectItem>
                            <SelectItem value="full">Banner Full Screen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase">Layout de Categorias</span>
                        <Select value={formData.category_layout || 'pills'} onValueChange={v => setFormData({...formData, category_layout: v})}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pills">Pílulas Horizontais</SelectItem>
                            <SelectItem value="grid">Grid de Ícones</SelectItem>
                            <SelectItem value="list">Lista Vertical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase">Design dos Cards</span>
                        <Select value={formData.product_card_layout || 'list'} onValueChange={v => setFormData({...formData, product_card_layout: v})}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="list">Lista (Full Width)</SelectItem>
                            <SelectItem value="grid">Grid (Compacto)</SelectItem>
                            <SelectItem value="minimal">Ultra Minimalista</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5" /> Visibilidade de Módulos
                    </Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div>
                          <p className="text-xs font-black text-zinc-900">Barra de Busca</p>
                          <p className="text-[10px] text-zinc-500">Permitir pesquisa de itens</p>
                        </div>
                        <Switch checked={formData.show_search !== false} onCheckedChange={v => setFormData({...formData, show_search: v})} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div>
                          <p className="text-xs font-black text-zinc-900">Navegação de Categorias</p>
                          <p className="text-[10px] text-zinc-500">Exibir filtros de seção</p>
                        </div>
                        <Switch checked={formData.show_categories !== false} onCheckedChange={v => setFormData({...formData, show_categories: v})} />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="avançado" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-zinc-900" />
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Custom CSS Engine</Label>
                  </div>
                  <div className="p-6 bg-zinc-900 rounded-[2rem] border border-zinc-800">
                    <Textarea 
                      value={formData.custom_css || ''} 
                      onChange={e => setFormData({...formData, custom_css: e.target.value})} 
                      placeholder="/* Adicione seu CSS personalizado aqui */\n.product-card {\n  transform: skew(-2deg);\n}"
                      className="bg-transparent border-none text-emerald-400 font-mono text-xs min-h-[250px] focus-visible:ring-0 resize-none p-0" 
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 text-center italic">Use este campo para injetar estilos globais e overrides de design.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-8 pt-0">
            <Button onClick={handleUpdate} disabled={loading} className="w-full h-16 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-900/20 group">
              {loading ? 'Sincronizando Galáxia...' : 'Aplicar Design Master'}
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="lg:col-span-5 relative flex justify-center">
        <div className="sticky top-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 px-6 py-2 bg-zinc-100 rounded-full border border-zinc-200">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Engine Preview</span>
          </div>

          <div className="relative w-[375px] h-[760px] rounded-[3.5rem] border-[12px] border-zinc-900 bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.1),0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
             {/* Dynamic Island / Notch */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-zinc-900 rounded-b-3xl z-50 flex items-center justify-center">
               <div className="w-10 h-1 bg-zinc-800 rounded-full" />
             </div>
             
             <div className="absolute inset-0 overflow-y-auto scrollbar-hide" style={{ backgroundColor: formData.background_color || '#FDF5E6', fontFamily: formData.font_family || 'Outfit' }}>
               {/* Hero Section Preview */}
               <div className="relative h-48">
                 {formData.banner_url ? (
                   <img src={formData.banner_url} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-zinc-200" />
                 )}
                 <div className="absolute inset-0 bg-black/10" />
               </div>

               <div className="px-6 relative z-10 -mt-10 pb-10">
                 <div className="w-20 h-20 rounded-2xl bg-white shadow-xl border-4 border-white mb-4 overflow-hidden flex items-center justify-center">
                   {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-zinc-300">{formData.name?.charAt(0)}</span>}
                 </div>
                 
                 <h2 className="text-2xl font-black mb-1 truncate" style={{ color: formData.text_color || '#3B2C24' }}>{formData.name}</h2>
                 <p className="text-[11px] font-medium opacity-60 line-clamp-2" style={{ color: formData.text_color || '#3B2C24' }}>{formData.description || 'Sua bio de restaurante aparecerá aqui...'}</p>

                 <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="h-0.5 flex-1 bg-current opacity-10" style={{ color: formData.text_color || '#3B2C24' }} />
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: formData.text_color || '#3B2C24' }}>Preview de Seção</span>
                       <div className="h-0.5 flex-1 bg-current opacity-10" style={{ color: formData.text_color || '#3B2C24' }} />
                    </div>

                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <div 
                          key={i} 
                          className="p-4 bg-white shadow-sm border border-zinc-100 flex gap-4 transition-all" 
                          style={{ 
                            borderRadius: formData.border_radius || '2rem',
                            ...(formData.card_style === 'glass' ? { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' } : {}),
                            ...(formData.card_style === 'elevated' ? { boxShadow: '0 15px 35px -5px rgba(0,0,0,0.1)' } : {})
                          }}
                        >
                          <div className="w-16 h-16 rounded-xl bg-zinc-100 shrink-0" />
                          <div className="flex-1 py-1">
                            <div className="w-24 h-3 bg-zinc-900/10 rounded-full mb-2" />
                            <div className="w-full h-2 bg-zinc-900/5 rounded-full mb-1" />
                            <div className="w-2/3 h-2 bg-zinc-900/5 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
