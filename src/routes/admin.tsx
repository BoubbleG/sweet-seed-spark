import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Store, Utensils, List, Palette } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel Administrativo - MenuMaster" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 hidden md:flex">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <Store className="w-6 h-6" />
          MenuMaster
        </h2>
        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start hover:bg-slate-800">
            <List className="w-4 h-4 mr-2" /> Restaurantes
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-slate-800">
            <Utensils className="w-4 h-4 mr-2" /> Cardápios
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-slate-800">
            <Palette className="w-4 h-4 mr-2" /> Personalização
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gerenciar Restaurantes</h1>
            <p className="text-slate-500">Adicione e edite os clientes do sistema.</p>
          </div>
          <Button onClick={() => alert('Feature em desenvolvimento: Cadastro de Restaurante')}>
            <Plus className="w-4 h-4 mr-2" /> Novo Restaurante
          </Button>
        </header>

        {isLoading ? (
          <div>Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants?.map(rest => (
              <Card key={rest.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    {rest.name}
                    <span className={`text-xs px-2 py-1 rounded-full ${rest.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {rest.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 mb-4">{rest.address}, {rest.city}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate({ to: `/${rest.slug}` })}>Ver Menu</Button>
                    <Button variant="outline" size="sm" className="flex-1">Editar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
