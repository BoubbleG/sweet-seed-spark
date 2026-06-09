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
    <div className="min-h-screen bg-[#020617] pb-32" style={{ fontFamily }}>
      {/* Header Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] hover:scale-110" 
          style={{ backgroundImage: `url(${restaurant.banner_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
      </div>
      
      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-10">
        <header className={`${getCardStyle()} p-8 border border-white/10 shadow-2xl mb-12`} style={{ borderRadius }}>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-24 h-24 rounded-3xl border-4 border-[#020617] overflow-hidden bg-white shadow-xl -mt-20">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-violet-600 text-white font-black text-3xl">
                  {restaurant.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">{restaurant.name}</h1>
              <p className="text-primary font-bold uppercase tracking-widest text-xs">{restaurant.business_type}</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <Clock className="w-4 h-4 text-primary" /> 
                <span className="text-sm font-medium">{restaurant.average_delivery_time}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <MapPin className="w-4 h-4 text-primary" /> 
                <span className="text-sm font-medium">{restaurant.city}</span>
              </div>
            </div>

            {restaurant.description && (
              <p className="text-slate-400 text-sm leading-relaxed max-w-md mt-2">
                {restaurant.description}
              </p>
            )}
          </div>
        </header>

        {/* Categories Nav */}
        <div className="sticky top-24 z-20 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-3 whitespace-nowrap">
            {menu?.categories.map(cat => (
              <Button 
                key={cat.id}
                variant="ghost"
                className="bg-white/5 hover:bg-primary hover:text-white text-slate-300 border border-white/5 rounded-2xl px-6 h-11 font-bold transition-all"
                onClick={() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-16">
          {menu?.categories.map(cat => (
            <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-40">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">{cat.name}</h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              
              <div className="grid gap-6">
                {menu.products.filter(p => p.category_id === cat.id).map(prod => (
                  <motion.div
                    key={prod.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className={`${getCardStyle()} border-white/10 overflow-hidden hover:border-primary/30 transition-all group`} style={{ borderRadius: `calc(${borderRadius} * 0.8)` }}>
                      <CardContent className="p-0 flex flex-col sm:flex-row min-h-[140px]">
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{prod.name}</h3>
                            <p className="text-sm text-slate-400 line-clamp-2 mt-1 font-light leading-relaxed">
                              {prod.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-6">
                            <span className="text-xl font-black text-white">
                              {formatCurrency(prod.price)}
                            </span>
                            <Button 
                              size="sm" 
                              className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 h-10 font-bold shadow-lg shadow-primary/20 transition-all"
                              onClick={() => addItem(prod)}
                            >
                              Adicionar
                            </Button>
                          </div>
                        </div>
                        {prod.image_url && (
                          <div className="w-full sm:w-48 h-48 sm:h-auto overflow-hidden">
                            <img src={prod.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={prod.name} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-lg z-50"
        >
          <Button 
            className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-[2rem] shadow-[0_20px_40px_rgba(239,68,68,0.3)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between px-8"
            onClick={() => setShowOrder(true)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary text-[10px] font-black rounded-full flex items-center justify-center border-2 border-primary">
                  {items.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <span>Ver Carrinho</span>
            </div>
            <span>{formatCurrency(getTotal())}</span>
          </Button>
        </motion.div>
      )}

      <CartDrawer 
        isOpen={showOrder} 
        onClose={() => setShowOrder(false)} 
        restaurant={restaurant} 
      />
    </div>
  );
}
