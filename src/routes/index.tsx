import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UtensilsCrossed, Plus, Eye } from "lucide-react";
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
    async function load() {
      const sb = createClient("https://mrjkizqyrmljtlvusgta.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamtpenF5cm1sanRsdnVzZ3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDAsImV4cCI6MjA5NjUzMjc0MH0.JTDSgPn20PipEOx6GIFtnXc-M2T2o3S4oM7t0saIwVY");
      const { data, error } = await sb.from('restaurants').select('*');
      console.log("FINAL LANDING LOAD:", { data, error });
      if (data) setRestaurants(data as Restaurant[]);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-['Outfit']">
      <header className="bg-white/70 backdrop-blur-md border-b border-zinc-200 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-zinc-900 uppercase italic">MenuMaster</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-zinc-600 rounded-full px-6" onClick={() => navigate({ to: '/admin' })}>Admin</Button>
          <Button className="bg-primary text-white rounded-full px-6 shadow-lg shadow-primary/20" onClick={() => navigate({ to: '/admin' })}>Começar</Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 md:p-16 lg:p-24 relative z-10">
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-900 mb-8 tracking-tighter">Seu cardápio <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">no WhatsApp</span></h1>
          <p className="text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed">Crie cardápios profissionais e receba pedidos organizados direto no seu celular.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((rest) => (
            <Card key={rest.id} className="group relative bg-white border-zinc-200 hover:border-primary/20 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="h-48 bg-zinc-100 relative">
                {rest.banner_url ? (
                  <img src={rest.banner_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-3xl border-4 border-white overflow-hidden bg-white shadow-xl flex items-center justify-center bg-gradient-to-br from-primary to-violet-600 text-white font-black text-2xl">
                  {rest.logo_url ? (
                    <img src={rest.logo_url} className="w-full h-full object-cover" />
                  ) : (
                    rest.name.charAt(0)
                  )}
                </div>
              </div>
              <CardHeader className="pt-12 px-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{rest.business_type}</span>
                </div>
                <CardTitle className="text-2xl text-zinc-900 font-bold">{rest.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-4">
                <p className="text-sm text-zinc-500 line-clamp-2 min-h-[2.5rem]">{rest.description}</p>
              </CardContent>
              <CardFooter className="px-8 pb-8 flex flex-col gap-4">
                <div className="flex gap-2 w-full">
                  <Button 
                    className="flex-1 bg-zinc-900 text-white hover:bg-primary rounded-2xl h-12 font-bold transition-all shadow-lg shadow-zinc-900/10" 
                    onClick={() => navigate({ to: `/${rest.slug}` })}
                  >
                    Ver Cardápio
                  </Button>
                  <Button 
                    variant="outline"
                    className="aspect-square p-0 bg-zinc-100 border-zinc-200 text-zinc-900 rounded-2xl h-12 w-12 hover:bg-zinc-200 hover:text-primary transition-colors"
                    onClick={() => navigate({ to: `/admin`, search: { restaurantId: rest.id, view: 'preview' } })}
                    title="Preview Rápido"
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          <Card className="h-full border-2 border-dashed border-zinc-200 bg-white/50 flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-white hover:border-primary transition-all duration-500 rounded-[2.5rem]" onClick={() => navigate({ to: '/admin' })}>
            <div className="w-16 h-16 rounded-[2rem] bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-500"><Plus className="w-8 h-8 text-zinc-400 group-hover:text-white" /></div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Novo Cliente</h3>
          </Card>
        </div>
      </main>
    </div>
  );
}
