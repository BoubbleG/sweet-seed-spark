import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UtensilsCrossed, Plus } from "lucide-react";
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
    const sb = createClient("https://mrjkizqyrmljtlvusgta.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamtpenF5cm1sanRsdnVzZ3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDAsImV4cCI6MjA5NjUzMjc0MH0.JTDSgPn20PipEOx6GIFtnXc-M2T2o3S4oM7t0saIwVY");
    sb.from('restaurants').select('*').then(({ data }) => {
      if (data) setRestaurants(data as Restaurant[]);
    });
  }, []);


  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-['Outfit']">
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white uppercase italic">MenuMaster</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-slate-300 rounded-full px-6" onClick={() => navigate({ to: '/admin' })}>Admin</Button>
          <Button className="bg-primary text-white rounded-full px-6" onClick={() => navigate({ to: '/admin' })}>Começar</Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-16 lg:p-24 relative z-10">
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter">Seu cardápio <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">no WhatsApp</span></h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">Crie cardápios profissionais e receba pedidos organizados direto no seu celular.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((rest) => (
            <Card key={rest.id} className="group relative bg-[#1e293b]/40 backdrop-blur-xl border-white/5 hover:border-white/20 rounded-[2.5rem] overflow-hidden">
              <div className="h-48 bg-slate-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-3xl border-4 border-[#1e293b] overflow-hidden bg-white shadow-xl flex items-center justify-center bg-gradient-to-br from-primary to-violet-600 text-white font-black text-2xl">
                  {rest.name.charAt(0)}
                </div>
              </div>
              <CardHeader className="pt-12 px-8">
                <div className="flex justify-between items-center mb-2"><span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{rest.business_type}</span></div>
                <CardTitle className="text-2xl text-white font-bold">{rest.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-4"><p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">{rest.description}</p></CardContent>
              <CardFooter className="px-8 pb-8 flex flex-col gap-4">
                <Button className="w-full bg-white text-slate-950 hover:bg-primary hover:text-white rounded-2xl h-12 font-bold transition-all" onClick={() => navigate({ to: `/${rest.slug}` })}>Ver Cardápio</Button>
              </CardFooter>
            </Card>
          ))}

          <Card className="h-full border-2 border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-white/5 rounded-[2.5rem]" onClick={() => navigate({ to: '/admin' })}>
            <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-500"><Plus className="w-8 h-8 text-slate-400 group-hover:text-white" /></div>
            <h3 className="text-xl font-bold text-white mb-2">Novo Cliente</h3>
          </Card>
        </div>
      </main>
    </div>
  );
}
