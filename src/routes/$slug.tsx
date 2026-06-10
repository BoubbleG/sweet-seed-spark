import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useRestaurant, useMenu } from "@/hooks/use-restaurant";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Plus, Search, Menu as MenuIcon, Package, Home as HomeIcon } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { motion } from "framer-motion";



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
  const { items, addItem } = useCart();
  const [showOrder, setShowOrder] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'inicio' | 'cardapio' | 'pedido'>('inicio');
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filteredProducts = useMemo(() => {
    if (!menu?.products) return [];
    if (!searchQuery) return menu.products;
    return menu.products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menu?.products, searchQuery]);

  // Track active category while scrolling
  useEffect(() => {
    if (!menu?.categories?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveCategory(visible[0].target.id.replace('cat-', ''));
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    menu.categories.forEach(c => {
      const el = sectionRefs.current[c.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [menu?.categories]);

  const scrollToCategory = (catId: string) => {
    const el = sectionRefs.current[catId];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (restError || menuError) {
    console.error("Menu fetch error:", restError || menuError);
    throw restError || menuError;
  }

  if (restLoading || menuLoading) {
    return (
      <div className="min-h-dvh bg-zinc-50 px-5 pt-6 pb-24 space-y-6 animate-pulse">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 bg-zinc-200 rounded" />
            <div className="h-3 w-1/2 bg-zinc-200 rounded" />
          </div>
        </div>
        <div className="h-40 rounded-3xl bg-zinc-200" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 w-20 rounded-2xl bg-zinc-200 shrink-0" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-3xl bg-zinc-200" />)}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-50 px-6 text-center">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 mb-2">Cardápio não encontrado</h1>
          <p className="text-sm text-zinc-500">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  const fontFamily = restaurant.font_family || "Outfit";
  const primaryColor = restaurant.primary_color || "#E29B5D";
  const textColor = restaurant.text_color || "#3B2C24";
  const backgroundColor = restaurant.background_color || "#FDF5E6";
  const buttonColor = restaurant.button_color || primaryColor;
  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const deliveryLabel = restaurant.delivery_fee > 0
    ? `Entrega ${formatCurrency(restaurant.delivery_fee)}`
    : 'Entrega grátis';
  const timeLabel = restaurant.average_delivery_time || '30-45 min';

  return (
    <div
      className="min-h-dvh pb-24 overflow-x-hidden"
      style={{ fontFamily, backgroundColor, color: textColor }}
    >
      {restaurant.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: restaurant.custom_css }} />
      )}

      {/* Header */}
      <header className="px-5 pt-6 pb-5 sm:px-6">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full text-white flex items-center justify-center text-2xl font-black" style={{ backgroundColor: primaryColor }}>
                {restaurant.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate" style={{ color: textColor }}>
              {restaurant.name}
            </h1>
            <p className="text-xs font-medium opacity-70 truncate mt-1" style={{ color: textColor }}>
              {deliveryLabel} · {timeLabel}
            </p>
            {restaurant.description && (
              <p className="text-xs opacity-60 truncate mt-0.5" style={{ color: textColor }}>
                {restaurant.description}
              </p>
            )}
          </div>
          <button
            aria-label="Favoritar"
            className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0"
          >
            <Heart className="w-5 h-5 text-zinc-300" />
          </button>
        </div>
      </header>

      {/* Banner */}
      {restaurant.banner_url && (
        <div className="px-5 sm:px-6">
          <div className="relative h-40 sm:h-48 rounded-3xl overflow-hidden shadow-lg">
            <img
              src={restaurant.banner_url}
              alt={`Banner ${restaurant.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Categories pills */}
      {restaurant.show_categories !== false && menu?.categories && menu.categories.length > 0 && (
        <nav aria-label="Categorias" className="mt-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-5 sm:px-6 pb-1">
            {menu.categories.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="snap-start shrink-0 px-4 h-11 rounded-full text-xs font-bold transition-all flex items-center gap-2"
                  style={
                    isActive
                      ? { backgroundColor: primaryColor, color: '#fff' }
                      : { backgroundColor: '#ffffff', color: textColor, border: '1px solid rgba(0,0,0,0.06)' }
                  }
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Search */}
      {restaurant.show_search !== false && (
        <div role="search" className="px-5 sm:px-6 mt-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" style={{ color: textColor }} />
            <input
              ref={searchRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Buscar no cardápio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar produtos"
              className="w-full h-12 pl-11 pr-4 bg-white rounded-2xl border border-zinc-100 text-sm shadow-sm focus:outline-none focus:ring-2"
              style={{ color: textColor, ['--tw-ring-color' as any]: `${primaryColor}33` }}
            />
          </div>
        </div>
      )}

      {/* Menu */}
      <main ref={menuRef} className="px-5 sm:px-6 mt-6 space-y-8">
        {menu?.categories.map(cat => {
          const prods = filteredProducts.filter(p => p.category_id === cat.id);
          if (prods.length === 0) return null;
          return (
            <section
              key={cat.id}
              id={`cat-${cat.id}`}
              ref={(el) => { sectionRefs.current[cat.id] = el; }}
              className="space-y-4 scroll-mt-20"
            >
              <div className="flex items-center gap-2">
                <span className="block w-1 h-5 rounded-full" style={{ backgroundColor: primaryColor }} />
                <h2 className="text-lg font-black tracking-tight truncate" style={{ color: textColor }}>
                  {cat.name}
                </h2>
                <span className="text-xs font-medium opacity-50" style={{ color: textColor }}>
                  {prods.length} {prods.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              <div className="space-y-3">
                {prods.map(prod => (
                  <motion.article
                    key={prod.id}
                    layout
                    className="bg-white rounded-3xl p-3 sm:p-4 flex gap-3 sm:gap-4 shadow-sm border border-zinc-100"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-100 overflow-hidden shrink-0">
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <Package className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="min-w-0">
                        {prod.is_best_seller && (
                          <span
                            className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Mais pedido
                          </span>
                        )}
                        <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2" style={{ color: textColor }}>
                          {prod.name}
                        </h3>
                        {prod.description && (
                          <p className="text-xs leading-relaxed line-clamp-2 mt-1 opacity-60" style={{ color: textColor }}>
                            {prod.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="text-base font-black truncate" style={{ color: textColor }}>
                          {formatCurrency(prod.price)}
                        </span>
                        <button
                          onClick={() => addItem(prod)}
                          aria-label={`Adicionar ${prod.name}`}
                          className="w-11 h-11 shrink-0 rounded-full text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                          style={{ backgroundColor: buttonColor }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          );
        })}

        {searchQuery && filteredProducts.length === 0 && (
          <div className="text-center py-12 opacity-60">
            <Search className="w-8 h-8 mx-auto mb-3" />
            <p className="text-sm font-medium">Nenhum item encontrado para "{searchQuery}"</p>
          </div>
        )}
      </main>

      {/* Bottom tab bar */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 backdrop-blur-xl"
        style={{ backgroundColor: `${backgroundColor}f2`, paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-3 px-2 py-2 max-w-md mx-auto">
          <TabButton
            icon={<HomeIcon className="w-5 h-5" />}
            label="Início"
            active={activeTab === 'inicio'}
            onClick={() => {
              setActiveTab('inicio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            textColor={textColor}
            activeColor={primaryColor}
          />
          <TabButton
            icon={<MenuIcon className="w-5 h-5" />}
            label="Cardápio"
            active={activeTab === 'cardapio'}
            onClick={() => {
              setActiveTab('cardapio');
              if (menu?.categories?.[0]) scrollToCategory(menu.categories[0].id);
            }}
            textColor={textColor}
            activeColor={primaryColor}
          />
          <TabButton
            icon={<ShoppingCart className="w-5 h-5" />}
            label="Pedido"
            active={activeTab === 'pedido'}
            onClick={() => { setActiveTab('pedido'); setShowOrder(true); }}
            textColor={textColor}
            activeColor={primaryColor}
            badge={cartCount}
          />
        </div>
      </footer>

      <CartDrawer 
        isOpen={showOrder} 
        onClose={() => setShowOrder(false)} 
        restaurant={restaurant} 
      />
    </div>
  );
}

function TabButton({ icon, label, active, onClick, textColor, activeColor, badge }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  textColor?: string;
  activeColor?: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative flex flex-col items-center justify-center gap-1 min-h-12 rounded-2xl transition-all ${active ? 'opacity-100' : 'opacity-50 active:opacity-80'}`}
      style={{ color: active ? activeColor || textColor : textColor }}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span
            className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: activeColor || '#E29B5D' }}
          >
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </button>
  );
}
