import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

  useEffect(() => {
    console.log("LandingPage useEffect running...");
    supabase.from('restaurants').select('*').eq('status', 'active').then((res) => {
      console.log("Supabase response:", res);
      if (res.data) setRestaurants(res.data as Restaurant[]);
    });
  }, []);


  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-['Outfit'] selection:bg-primary/30">
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
          <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full px-6" onClick={() => navigate({ to: '/admin' })}>Acesso Admin</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg shadow-primary/20" onClick={() => navigate({ to: '/admin' })}>Começar Grátis</Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-16 lg:p-24 relative z-10">
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">Seu cardápio <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-emerald-400">no WhatsApp</span></h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">Crie cardápios profissionais e receba pedidos organizados direto no seu celular.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((rest, index) => (
            <motion.div key={rest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <Card className="group relative bg-[#1e293b]/40 backdrop-blur-xl border-white/5 hover:border-white/20 rounded-[2.5rem] overflow-hidden">
                <div className="h-48 bg-slate-800 relative">
                  {rest.banner_url && <img src={rest.banner_url} alt={rest.name} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-3xl border-4 border-[#1e293b] overflow-hidden bg-white shadow-xl">
                    {rest.logo_url ? <img src={rest.logo_url} alt={rest.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-violet-600 text-white font-black text-2xl">{rest.name.charAt(0)}</div>}
                  </div>
                </div>
                <CardHeader className="pt-12 px-8">
                  <div className="flex justify-between items-center mb-2"><span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{rest.business_type}</span></div>
                  <CardTitle className="text-2xl text-white font-bold group-hover:text-primary transition-colors">{rest.name}</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-4"><p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">{rest.description}</p></CardContent>
                <CardFooter className="px-8 pb-8 flex flex-col gap-4">
                  <Button className="w-full bg-white text-slate-950 hover:bg-primary hover:text-white rounded-2xl h-12 font-bold transition-all duration-300" onClick={() => navigate({ to: `/${rest.slug}` })}>Acessar Cardápio</Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}

          <Card className="h-full border-2 border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-white/5 group rounded-[2.5rem]" onClick={() => navigate({ to: '/admin' })}>
            <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-500"><Plus className="w-8 h-8 text-slate-400 group-hover:text-white" /></div>
            <h3 className="text-xl font-bold text-white mb-2">Novo Cliente</h3>
          </Card>
        </div>
      </main>
    </div>
  );
}
