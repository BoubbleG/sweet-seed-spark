import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Store, Utensils, List, Palette, ChevronRight, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Restaurant } from "@/types";
import { RestaurantDialog } from "@/components/admin/restaurant-dialog";
import { MenuManager } from "@/components/admin/menu-manager";
import { VisualManager } from "@/components/admin/visual-manager";

const SUPABASE_URL = "https://mrjkizqyrmljtlvusgta.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamtpenF5cm1sanRsdnVzZ3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDAsImV4cCI6MjA5NjUzMjc0MH0.JTDSgPn20PipEOx6GIFtnXc-M2T2o3S4oM7t0saIwVY";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel Administrativo - MenuMaster" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestDialogOpen, setIsRestDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [activeView, setActiveTab] = useState<'list' | 'menu' | 'visual'>('list');

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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col md:flex-row font-['Outfit']">
      <aside className="w-full md:w-72 bg-[#1e293b]/50 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 sticky top-0 md:h-screen z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">MenuMaster</h2>
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
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Dashboard</h1>
                <p className="text-slate-400 mt-1">Gerencie seus clientes e cardápios online.</p>
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
                {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map(rest => (
                  <Card key={rest.id} className="group bg-[#1e293b]/40 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all rounded-2xl overflow-hidden shadow-xl">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${rest.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {rest.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" onClick={() => { setEditingRestaurant(rest); setIsRestDialogOpen(true); }}>
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-primary transition-colors">{rest.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400 mb-6 line-clamp-1">{rest.address || 'Sem endereço'}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/5"
                          onClick={() => { setSelectedRestaurantId(rest.id); setActiveTab('menu'); }}
                        >
                          <Utensils className="w-4 h-4 mr-2" /> Cardápio
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-10 p-0 text-slate-400 hover:text-white"
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
            <Button variant="ghost" onClick={() => setActiveTab('list')} className="mb-6 text-slate-400 hover:text-white">
              &larr; Voltar para lista
            </Button>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Cardápio</h1>
              <p className="text-slate-400">Editando menu de: <span className="text-primary font-medium">{selectedRestaurant?.name}</span></p>
            </div>
            
            <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
              <MenuManager restaurantId={selectedRestaurantId} />
            </div>
          </div>
        )}
        {activeView === 'visual' && selectedRestaurant && (
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveTab('list')} className="mb-6 text-slate-400 hover:text-white">
              &larr; Voltar para lista
            </Button>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Design do Cardápio</h1>
              <p className="text-slate-400">Personalizando identidade visual de: <span className="text-primary font-medium">{selectedRestaurant.name}</span></p>
            </div>
            
            <VisualManager restaurant={selectedRestaurant} />
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
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
