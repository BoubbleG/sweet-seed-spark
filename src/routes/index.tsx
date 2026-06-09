import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Plus, LayoutDashboard } from "lucide-react";

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
  
  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <UtensilsCrossed className="w-6 h-6" />
          <span>MenuMaster</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate({ to: '/admin' })}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Painel Admin
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Crie Cardápios Online <span className="text-primary">Incríveis</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A ferramenta completa para gerenciar seus clientes e criar cardápios mobile-first que convertem pedidos direto no WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants?.map((rest) => (
            <Card key={rest.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-slate-200 relative">
                {rest.banner_url ? (
                  <img src={rest.banner_url} alt={rest.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <UtensilsCrossed className="w-12 h-12 text-primary/20" />
                  </div>
                )}
                <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-white">
                  {rest.logo_url ? (
                    <img src={rest.logo_url} alt={rest.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 font-bold text-primary">
                      {rest.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <CardHeader className="pt-8">
                <CardTitle>{rest.name}</CardTitle>
                <CardDescription className="capitalize">{rest.business_type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {rest.description || 'Sem descrição disponível.'}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => window.open(`/${rest.slug}`, '_blank')}>
                  Ver Cardápio Público
                </Button>
              </CardFooter>
            </Card>
          ))}

          <Card className="border-dashed border-2 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate({ to: '/admin' })}>
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Novo Restaurante</h3>
            <p className="text-sm text-slate-500">Cadastre um novo cliente no painel administrativo.</p>
          </Card>
        </div>
      </main>

      <footer className="bg-white border-t py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2026 MenuMaster Generator. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
