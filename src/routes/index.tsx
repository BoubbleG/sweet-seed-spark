import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Restaurant } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gerador de Cardápios Online - MenuMaster" },
      { name: "description", content: "Crie cardápios personalizados e receba pedidos no WhatsApp." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log("LandingPage fetching...");
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('status', 'active');
        if (error) throw error;
        console.log("LandingPage data loaded:", data?.length);
        setRestaurants(data as Restaurant[]);
      } catch (error) {
        console.error("Error loading restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-['Outfit'] selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white uppercase italic">MenuMaster</span>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full px-6"
            onClick={() => navigate({ to: '/admin' })}
          >
            Acesso Admin
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            onClick={() => navigate({ to: '/admin' })}
          >
            Começar Grátis
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-16 lg:p-24 relative z-10">
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-widest uppercase mb-6">
              Menu Generator 2026
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
              Seu cardápio <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-emerald-400">
                no WhatsApp
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
              Crie cardápios profissionais e receba pedidos organizados direto no seu celular. 
              A solução definitiva para hamburguerias, pizzarias e delivery.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-white">Debug: {isLoading ? "Loading..." : "Done!"} (Count: {restaurants.length})</div>
          
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
            ))
          ) : (
            restaurants.map((rest, index) => (
              <motion.div
                key={rest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group relative bg-[#1e293b]/40 backdrop-blur-xl border-white/5 hover:border-white/20 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[2.5rem] overflow-hidden">
                  <div className="h-48 bg-slate-800 relative">
                    {rest.banner_url ? (
                      <img src={rest.banner_url} alt={rest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <UtensilsCrossed className="w-16 h-16 text-white/5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-3xl border-4 border-[#1e293b] overflow-hidden bg-white shadow-xl group-hover:-translate-y-2 transition-transform duration-500">
                      {rest.logo_url ? (
                        <img src={rest.logo_url} alt={rest.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-violet-600 text-white font-black text-2xl">
                          {rest.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader className="pt-12 px-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        {rest.business_type}
                      </span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500">Online</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-white font-bold group-hover:text-primary transition-colors">{rest.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="px-8 pb-4">
                    <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
                      {rest.description || 'Hambúrgueres artesanais, acompanhamentos crocantes e bebidas geladas.'}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="px-8 pb-8 flex flex-col gap-4">
                    <div className="flex justify-between w-full text-[11px] font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-4">
                      <span>Entrega: {(rest.delivery_fee ?? 0) > 0 ? `R$ ${(rest.delivery_fee ?? 0).toFixed(2)}` : 'Grátis'}</span>
                      <span>{rest.average_delivery_time}</span>
                    </div>
                    <Button 
                      className="w-full bg-white text-slate-950 hover:bg-primary hover:text-white rounded-2xl h-12 font-bold transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20"
                      onClick={() => navigate({ to: `/${rest.slug}` })}
                    >
                      Acessar Cardápio
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
          >
            <Card 
              className="h-full border-2 border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all group rounded-[2.5rem]" 
              onClick={() => navigate({ to: '/admin' })}
            >
              <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                <Plus className="w-8 h-8 text-slate-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Novo Cliente</h3>
              <p className="text-sm text-slate-500 font-light">Cadastre um novo restaurante <br/> no painel administrativo.</p>
            </Card>
          </motion.div>
        </div>
      </main>

      <footer className="bg-white/2 backdrop-blur-xl border-t border-white/5 py-12 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white/50" />
            </div>
            <span className="font-bold text-white/50 tracking-tighter uppercase italic">MenuMaster</span>
          </div>
          <p className="text-slate-600 text-sm font-light tracking-wide">&copy; 2026 MenuMaster Generator. Proudly built for local heroes.</p>
          <div className="flex gap-6">
            <span className="text-xs text-slate-600 hover:text-white cursor-pointer transition-colors">Termos</span>
            <span className="text-xs text-slate-600 hover:text-white cursor-pointer transition-colors">Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
