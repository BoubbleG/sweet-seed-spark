import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useRestaurant, useMenu } from "@/hooks/use-restaurant";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Clock, MapPin, Heart, Plus, Search, ChevronRight, Menu as MenuIcon, User, Package, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { motion, AnimatePresence } from "framer-motion";



export const Route = createFileRoute("/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Cardápio Online - ${params.slug}` },
      { name: "description", content: "Faça seu pedido agora pelo WhatsApp!" },
    ],
  }),
  component: RestaurantPublicMenu,
});

function RestaurantPublicMenu() {
  const params = useParams({ from: '/$slug' });
  const slug = params?.slug;
  const { data: restaurant, isLoading: restLoading, error: restError } = useRestaurant(slug);
  const { data: menu, isLoading: menuLoading, error: menuError } = useMenu(restaurant?.id || '');
  const { items, addItem, getTotal } = useCart();
  const [showOrder, setShowOrder] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'inicio' | 'cardapio' | 'pedido' | 'mais'>('inicio');

  const filteredProducts = useMemo(() => {
    if (!menu?.products) return [];
    if (!searchQuery) return menu.products;
    return menu.products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menu?.products, searchQuery]);

  if (restError || menuError) {
    console.error("Menu fetch error:", restError || menuError);
    throw restError || menuError;
  }

  if (restLoading || menuLoading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Preparando cardápio...</p>
      </div>
    </div>
  );

  if (!restaurant) return <div className="p-12 text-center text-white bg-[#020617] min-h-screen">Restaurante não encontrado.</div>;

  const primaryColor = restaurant.primary_color || "#ef4444";
  const fontFamily = restaurant.font_family || "Outfit";
  const borderRadius = restaurant.border_radius || "2.5rem";
  const cardStyle = restaurant.card_style || "glass";

  const getCardStyle = () => {
    switch(cardStyle) {
      case 'flat': return "bg-white/10";
      case 'bordered': return "bg-transparent border-2 border-white/20";
      case 'elevated': return "bg-slate-900 shadow-2xl";
      default: return "bg-white/5 backdrop-blur-2xl";
    }
  };

  return (
    <div className="min-h-screen pb-32 selection:bg-[#E29B5D]/20 overflow-x-hidden" style={{ fontFamily, backgroundColor: restaurant.background_color || '#FDF5E6', color: restaurant.text_color || '#3B2C24' }}>
      {restaurant.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: restaurant.custom_css }} />
      )}
      {/* Top Header Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center border-b border-[#E29B5D]/10 transition-all ${restaurant.header_style === 'floating' ? 'm-4 rounded-2xl bg-white/80 shadow-lg' : 'bg-[#FDF5E6]/80 backdrop-blur-md'}`}
        style={restaurant.header_style !== 'floating' ? { backgroundColor: `${restaurant.background_color || '#FDF5E6'}cc` } : {}}
      >
        <div className="text-xs font-black text-zinc-400">9:41</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-20 px-6 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center overflow-hidden border-2 border-white">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#3B2C24] text-white flex items-center justify-center text-2xl font-black">
                  {restaurant.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#3B2C24] tracking-tight break-words overflow-hidden leading-tight">{restaurant.name}</h1>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-[#A89284] flex-wrap">
                <Star className="w-3.5 h-3.5 fill-[#E29B5D] text-[#E29B5D] shrink-0" />
                <span className="text-[#3B2C24]">4,8</span>
                <span className="truncate max-w-[150px]">(312 avaliações)</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-[#A89284] flex-wrap">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Entrega • 30-45 min</span>
              </div>
              <p className="text-[11px] font-bold text-[#A89284] mt-1 break-words">
                R$ {restaurant.delivery_fee.toFixed(2).replace('.', ',')} • Grátis acima de R$ 60
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-md w-10 h-10">
            <Heart className="w-5 h-5 text-zinc-300" />
          </Button>
        </div>

        {/* Featured Slider Mock */}
        <div className="relative h-48 rounded-[2rem] overflow-hidden mb-8 shadow-2xl">
          <img 
            src={restaurant.banner_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {menu?.categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center gap-2 min-w-[90px] p-3 rounded-[1.5rem] transition-all border ${activeCategory === cat.id ? 'bg-[#3B2C24] border-[#3B2C24] text-white' : 'bg-white border-zinc-100 text-[#3B2C24]'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeCategory === cat.id ? 'bg-white/10' : 'bg-zinc-50'}`}>
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-10">
        {restaurant.show_search !== false && (
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89284]" />
            <input 
              type="text" 
              placeholder="O que você está procurando?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white rounded-2xl border border-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E29B5D]/20 shadow-sm"
            />
          </div>
        )}

        {menu?.categories.map(cat => (
          <section key={cat.id} className="space-y-6">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-[#E29B5D]" />
              <h2 className="text-lg font-black tracking-tight truncate flex-1" style={{ color: restaurant.text_color || '#3B2C24' }}>{cat.name} em destaque</h2>
            </div>
            
            <div className={restaurant.product_card_layout === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-4"}>
              {filteredProducts.filter(p => p.category_id === cat.id).map(prod => (
                <motion.div
                  key={prod.id}
                  layout
                  className={`bg-white rounded-[2rem] p-5 flex shadow-sm border border-zinc-50 relative group ${restaurant.product_card_layout === 'grid' ? 'flex-col' : 'flex-row gap-4'}`}
                >
                  <div className={`rounded-2xl bg-zinc-100 overflow-hidden flex-shrink-0 ${restaurant.product_card_layout === 'grid' ? 'w-full aspect-square mb-3' : 'w-24 h-24'}`}>
                    {prod.image_url ? (
                      <img src={prod.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {prod.is_best_seller && (
                        <div className="bg-[#E29B5D] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full w-fit mb-1.5">
                          MAIS PEDIDO
                        </div>
                      )}
                      <h3 className="text-sm font-black mb-1 break-words line-clamp-2" style={{ color: restaurant.text_color || '#3B2C24' }}>{prod.name}</h3>
                      <p className="text-[10px] opacity-60 line-clamp-2 leading-relaxed" style={{ color: restaurant.text_color || '#3B2C24' }}>
                        {prod.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-black" style={{ color: restaurant.text_color || '#3B2C24' }}>
                        R$ {prod.price.toFixed(2).replace('.', ',')}
                      </span>
                      <button 
                        onClick={() => addItem(prod)}
                        className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-90"
                        style={{ backgroundColor: restaurant.button_color || restaurant.primary_color || '#3B2C24' }}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
        <div className="h-20" /> {/* Spacing for footer */}
      </main>

      {/* Tab Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-8 py-4 flex justify-between items-center z-50">
        <TabButton icon={<Search className="w-6 h-6" />} label="Início" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
        <TabButton icon={<MenuIcon className="w-6 h-6" />} label="Cardápio" active={activeTab === 'cardapio'} onClick={() => setActiveTab('cardapio')} />
        <div className="relative">
          <TabButton icon={<ShoppingCart className="w-6 h-6" />} label="Meu pedido" active={activeTab === 'pedido'} onClick={() => { setActiveTab('pedido'); setShowOrder(true); }} />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E29B5D] text-white text-[8px] font-black rounded-full flex items-center justify-center">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </div>
        <TabButton icon={<User className="w-6 h-6" />} label="Mais" active={activeTab === 'mais'} onClick={() => setActiveTab('mais')} />
      </footer>

      <CartDrawer 
        isOpen={showOrder} 
        onClose={() => setShowOrder(false)} 
        restaurant={restaurant} 
      />
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[#3B2C24]' : 'text-zinc-300 hover:text-zinc-400'}`}
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
