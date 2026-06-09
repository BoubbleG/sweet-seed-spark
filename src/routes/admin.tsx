import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Store, Utensils, List, Palette, ChevronRight, Settings, LogOut, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Restaurant } from "@/types";
import { RestaurantDialog } from "@/components/admin/restaurant-dialog";
import { MenuManager } from "@/components/admin/menu-manager";
import { VisualManager } from "@/components/admin/visual-manager";

const SUPABASE_URL = "https://mrjkizqyrmljtlvusgta.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamtpenF5cm1sanRsdnVzZ3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDAsImV4cCI6MjA5NjUzMjc0MH0.JTDSgPn20PipEOx6GIFtnXc-M2T2o3S4oM7t0saIwVY";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      restaurantId: (search.restaurantId as string) || undefined,
      view: (search.view as 'list' | 'menu' | 'visual' | 'preview') || undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Painel Administrativo - MenuMaster" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/admin' });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestDialogOpen, setIsRestDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(search.restaurantId || null);
  const [activeView, setActiveTab] = useState<'list' | 'menu' | 'visual' | 'preview'>(search.view || 'list');

  async function loadData() {
    setIsLoading(true);
    try {
      const { data, error } = await sb.from('restaurants').select('*');
      if (error) throw error;
      setRestaurants(data as Restaurant[]);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedRestaurant = restaurants?.find(r => r.id === selectedRestaurantId);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col md:flex-row font-['Outfit']">
      <aside className="w-full md:w-72 bg-white/70 backdrop-blur-xl border-r border-zinc-200 flex flex-col p-6 sticky top-0 md:h-screen z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">MenuMaster</h2>
        </div>
        
        <nav className="space-y-1 flex-1">
          <SidebarItem 
            active={activeView === 'list'} 
            onClick={() => { setActiveTab('list'); setSelectedRestaurantId(null); }}
            icon={<List className="w-5 h-5" />} 
            label="Restaurantes" 
          />
          <SidebarItem 
            active={activeView === 'menu'} 
            disabled={!selectedRestaurantId}
            onClick={() => setActiveTab('menu')}
            icon={<Utensils className="w-5 h-5" />} 
            label="Cardápios" 
          />
          <SidebarItem 
            active={activeView === 'visual'} 
            disabled={!selectedRestaurantId}
            onClick={() => setActiveTab('visual')}
            icon={<Palette className="w-5 h-5" />} 
            label="Personalização" 
          />
          <SidebarItem 
            active={activeView === 'preview'} 
            disabled={!selectedRestaurantId}
            onClick={() => setActiveTab('preview')}
            icon={<Eye className="w-5 h-5" />} 
            label="Visualizar Cardápio" 
          />
          <div className="pt-4 mt-4 border-t border-white/5">
            <SidebarItem icon={<Settings className="w-5 h-5" />} label="Configurações" />
            <SidebarItem icon={<LogOut className="w-5 h-5" />} label="Sair" onClick={() => navigate({ to: '/' })} />
          </div>
        </nav>

        {selectedRestaurant && (
          <div className="mt-auto p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Editando agora</p>
            <p className="font-bold text-white truncate">{selectedRestaurant.name}</p>
          </div>
        )}
      </aside>

      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        {activeView === 'list' && (
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Dashboard</h1>
                <p className="text-zinc-500 mt-1">Gerencie seus clientes e cardápios online.</p>
              </div>
              <Button 
                onClick={() => { setEditingRestaurant(null); setIsRestDialogOpen(true); }}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-12 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" /> Novo Restaurante
              </Button>
            </header>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-zinc-200 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map(rest => (
                  <Card key={rest.id} className="group bg-white border-zinc-200 hover:border-primary/30 transition-all rounded-2xl overflow-hidden shadow-sm hover:shadow-xl">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${rest.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {rest.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900" onClick={() => { setEditingRestaurant(rest); setIsRestDialogOpen(true); }}>
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-zinc-900 group-hover:text-primary transition-colors">{rest.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-500 mb-6 line-clamp-1">{rest.address || 'Sem endereço'}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200"
                          onClick={() => { setSelectedRestaurantId(rest.id); setActiveTab('menu'); }}
                        >
                          <Utensils className="w-4 h-4 mr-2" /> Cardápio
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/10"
                          onClick={() => { setSelectedRestaurantId(rest.id); setActiveTab('preview'); }}
                        >
                          <Eye className="w-4 h-4 mr-2" /> Ver
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-10 p-0 text-zinc-400 hover:text-zinc-900"
                          onClick={() => window.open(`/${rest.slug}`, '_blank')}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'menu' && selectedRestaurantId && (
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveTab('list')} className="mb-6 text-zinc-500 hover:text-zinc-900">
              &larr; Voltar para lista
            </Button>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">Gerenciar Cardápio</h1>
              <p className="text-zinc-500">Editando menu de: <span className="text-primary font-medium">{selectedRestaurant?.name}</span></p>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
              <MenuManager restaurantId={selectedRestaurantId} />
            </div>
          </div>
        )}
        {activeView === 'visual' && selectedRestaurant && (
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveTab('list')} className="mb-6 text-zinc-500 hover:text-zinc-900">
              &larr; Voltar para lista
            </Button>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">Design do Cardápio</h1>
              <p className="text-zinc-500">Personalizando identidade visual de: <span className="text-primary font-medium">{selectedRestaurant.name}</span></p>
            </div>
            
            <VisualManager restaurant={selectedRestaurant} />
          </div>
        )}
        {activeView === 'preview' && selectedRestaurant && (
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <Button variant="ghost" onClick={() => setActiveTab('list')} className="text-zinc-500 hover:text-zinc-900">
                &larr; Voltar para lista
              </Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="bg-zinc-100 border-zinc-200 text-zinc-900"
                  onClick={() => window.open(`/${selectedRestaurant.slug}`, '_blank')}
                >
                  Abrir em nova aba
                </Button>
              </div>
            </div>
            
            <div className="flex-1 min-h-[700px] w-full rounded-3xl overflow-hidden border border-zinc-200 shadow-xl bg-white relative">
              <iframe 
                src={`/${selectedRestaurant.slug}`} 
                className="w-full h-full border-none"
                title="Visualização do Cardápio"
              />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-full text-[10px] text-zinc-500 uppercase tracking-widest font-bold pointer-events-none">
                Modo Preview - Interação Limitada
              </div>
            </div>
          </div>
        )}
      </main>

      <RestaurantDialog 
        open={isRestDialogOpen} 
        onOpenChange={(open) => {
          setIsRestDialogOpen(open);
          if (!open) loadData();
        }} 
        restaurant={editingRestaurant} 
      />
    </div>
  );
}

function SidebarItem({ active, icon, label, onClick, disabled }: { active?: boolean, icon: React.ReactNode, label: string, onClick?: () => void, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        disabled ? 'opacity-30 cursor-not-allowed' : 
        active 
          ? 'bg-primary text-white shadow-lg' 
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
