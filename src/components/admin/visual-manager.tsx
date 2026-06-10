import { useState, useEffect, useMemo, useRef } from "react";
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
import { Palette, Layout, Type, Upload, Trash2, Zap, Settings, Paintbrush, Monitor, Code, ChevronRight, Sparkles, Wand2, Pipette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { extractDetailedDesignFromImage } from "@/lib/color-extractor";

interface VisualManagerProps {
  restaurant: Restaurant;
}

export function VisualManager({ restaurant }: VisualManagerProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      const { data: signed, error: signErr } = await supabase.storage
        .from('restaurant-assets')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10);
      if (signErr) throw signErr;

      setFormData(prev => ({ ...prev, [field]: signed.signedUrl }));
      toast.success("Imagem enviada!");
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAiDesign = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    const toastId = toast.loading("Análise profunda da imagem em curso...");

    try {
      // 1. Convert to URL for extraction
      const imageUrl = URL.createObjectURL(file);
      
      // 2. Extract DETAILED REAL colors and styles
      const designDetails = await extractDetailedDesignFromImage(imageUrl);
      setExtractedColors(designDetails.allColors);

      // 3. Call AI for style suggestion (passing detailed data)
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const base64Image = await base64Promise;

      const { data, error } = await supabase.functions.invoke('ai-designer', {
        body: { 
          image: base64Image,
          extractedDesign: designDetails,
          currentStyle: formData.visual_style
        }
      });

      if (error) throw error;

      if (data.design) {
        setFormData(prev => ({
          ...prev,
          ...data.design,
          primary_color: designDetails.primary,
          background_color: designDetails.background,
          text_color: designDetails.text,
        }));
        toast.success("Design completo gerado com base nos detalhes reais!", { id: toastId });
      }
    } catch (error: any) {
      console.error("AI Designer Error:", error);
      toast.error("Erro na análise profunda.", { id: toastId });
    } finally {
      setIsAiProcessing(false);
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
                <TabsTrigger value="ai" className="rounded-xl data-[state=active]:bg-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> IA
                </TabsTrigger>
                <TabsTrigger value="avançado" className="rounded-xl data-[state=active]:bg-white">Expert</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent value="ai" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                  <div className="relative z-10 max-w-lg">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-xl border border-white/10">
                      <Wand2 className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-3xl font-black tracking-tight mb-4">Design Intelligence System</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                      Envie uma foto de referência, um logotipo ou até mesmo o interior do seu restaurante. 
                      Nossa IA analisará as formas, o sentimento e as cores para gerar uma paleta e tipografia 
                      exclusiva que combine perfeitamente com a sua marca.
                    </p>
                    
                    <div className="flex gap-4">
                      <Button 
                        disabled={isAiProcessing}
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-primary text-white hover:bg-primary/90 rounded-2xl h-14 px-8 font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 group-hover:scale-105 active:scale-95"
                      >
                        {isAiProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processando...
                          </div>
                        ) : (
                          <>Analisar Referência</>
                        )}
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAiDesign} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 right-0 p-8 hidden md:block">
                    <div className="flex -space-x-4">
                      {extractedColors.length > 0 ? (
                        extractedColors.map(color => (
                          <div 
                            key={color} 
                            onClick={() => setFormData({...formData, primary_color: color})}
                            className="w-12 h-12 rounded-full border-4 border-zinc-900 shadow-xl cursor-pointer hover:scale-110 transition-transform" 
                            style={{ backgroundColor: color }} 
                          />
                        ))
                      ) : (
                        [1,2,3].map(i => (
                          <div key={i} className={`w-12 h-12 rounded-full border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center`}>
                            <Palette className="w-5 h-5 text-zinc-600" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {extractedColors.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Pipette className="w-5 h-5 text-primary" />
                      <h5 className="font-black text-zinc-900 tracking-tight">Cores Extraídas da Imagem</h5>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {extractedColors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setFormData({...formData, primary_color: color});
                            toast.success(`Cor ${color} aplicada como primária!`);
                          }}
                          className="group relative flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200"
                        >
                          <div className="w-16 h-16 rounded-2xl shadow-inner border border-zinc-100 group-hover:rotate-6 transition-transform" style={{ backgroundColor: color }} />
                          <span className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-tighter">{color}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Palette className="w-5 h-5 text-primary" />
                      </div>
                      <h5 className="font-bold text-zinc-900 mb-1">Paleta Inteligente</h5>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Cores baseadas em contexto emocional</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                        <Type className="w-5 h-5 text-violet-500" />
                      </div>
                      <h5 className="font-bold text-zinc-900 mb-1">Matching de Fontes</h5>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Tipografia que conversa com seu estilo</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                        <Layout className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h5 className="font-bold text-zinc-900 mb-1">Auto-Layout</h5>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Arranjo de elementos otimizado</p>
                   </div>
                </div>
              </TabsContent>
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
               {/* Custom CSS Injection for Preview */}
               <style dangerouslySetInnerHTML={{ __html: formData.custom_css || '' }} />

               {/* Header Navigation Preview */}
               <div 
                 className={`sticky top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center border-b border-black/5 transition-all ${formData.header_style === 'floating' ? 'm-4 rounded-2xl bg-white/80 shadow-lg' : ''}`}
                 style={formData.header_style !== 'floating' ? { backgroundColor: `${formData.background_color || '#FDF5E6'}cc`, backdropFilter: 'blur(10px)' } : {}}
               >
                 <div className="w-4 h-4 rounded-full bg-zinc-900/10" />
                 <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-900/20" />
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-900/20" />
                 </div>
               </div>

               {/* Content Preview */}
               <div className={`px-6 pb-10 ${formData.header_style === 'floating' ? 'pt-4' : 'pt-6'}`}>
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-xl border-4 border-white overflow-hidden flex items-center justify-center shrink-0">
                        {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-zinc-300">{formData.name?.charAt(0)}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-black mb-1 truncate" style={{ color: formData.text_color || '#3B2C24' }}>{formData.name}</h2>
                        <p className="text-[10px] font-medium opacity-60 line-clamp-1" style={{ color: formData.text_color || '#3B2C24' }}>{formData.description || 'Sua bio de restaurante...'}</p>
                        <div className="flex gap-1.5 mt-1">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <div className="w-10 h-2 bg-zinc-900/10 rounded-full self-center" />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Categories Preview */}
                 {formData.show_categories !== false && (
                   <div className="flex gap-2 mb-8 overflow-x-hidden">
                     {[1, 2, 3].map(i => (
                       <div 
                         key={i} 
                         className={`rounded-[1.2rem] border transition-all ${i === 1 ? 'text-white' : 'bg-white border-zinc-100'} ${formData.category_layout === 'grid' ? 'w-12 h-12 flex items-center justify-center' : 'px-4 py-2 shrink-0'}`}
                         style={i === 1 ? { backgroundColor: formData.primary_color, borderColor: formData.primary_color } : {}}
                       >
                         {formData.category_layout === 'grid' ? <div className="w-4 h-4 bg-current opacity-20 rounded" /> : <div className="w-8 h-2 bg-current opacity-20 rounded-full" />}
                       </div>
                     ))}
                   </div>
                 )}

                 {/* Search Bar Preview */}
                 {formData.show_search !== false && (
                   <div className="h-10 bg-white border border-zinc-100 rounded-xl mb-8 flex items-center px-4 gap-3">
                     <div className="w-3 h-3 border-2 border-zinc-300 rounded-full" />
                     <div className="w-24 h-2 bg-zinc-200 rounded-full" />
                   </div>
                 )}

                 <div className="space-y-6">
                    <div className={formData.product_card_layout === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                      {[1, 2, 3, 4].map(i => (
                        <div 
                          key={i} 
                          className={`bg-white shadow-sm border border-zinc-50 p-4 transition-all flex ${formData.product_card_layout === 'grid' ? 'flex-col' : 'flex-row gap-4'}`} 
                          style={{ 
                            borderRadius: formData.border_radius || '2rem',
                            ...(formData.card_style === 'glass' ? { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' } : {}),
                            ...(formData.card_style === 'elevated' ? { boxShadow: '0 15px 35px -5px rgba(0,0,0,0.1)' } : {})
                          }}
                        >
                          <div className={`rounded-xl bg-zinc-100 shrink-0 ${formData.product_card_layout === 'grid' ? 'w-full aspect-square mb-3' : 'w-16 h-16'}`} />
                          <div className="flex-1">
                            <div className="w-16 h-2.5 bg-zinc-900/10 rounded-full mb-2" />
                            <div className="w-full h-1.5 bg-zinc-900/5 rounded-full mb-1" />
                            <div className="flex justify-between items-center mt-3">
                               <div className="w-10 h-3 bg-zinc-900/10 rounded-full" />
                               <div className="w-6 h-6 rounded-full" style={{ backgroundColor: formData.primary_color }} />
                            </div>
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
