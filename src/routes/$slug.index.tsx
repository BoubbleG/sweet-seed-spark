import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useRestaurant, useMenu } from "@/hooks/use-restaurant";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { buildMenuTheme } from "@/lib/theme";
import { ShoppingCart, Plus, Search, Menu as MenuIcon, Package, Home as HomeIcon } from "lucide-react";
import type { ProductSize } from "@/types";
import { Sparkles, Tag, Flame, Sandwich, IceCream } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { motion, AnimatePresence } from "framer-motion";
import { MixSelectorDialog } from "@/components/mix-selector-dialog";
import { AcaiBuilderDialog } from "@/components/acai-builder-dialog";
import { sanitizeCustomCss } from "@/lib/sanitize-css";



export const Route = createFileRoute("/$slug/")({
  head: ({ params }) => ({
    meta: [
      { title: `Cardápio Online - ${params.slug}` },
      { name: "description", content: "Faça seu pedido agora pelo WhatsApp!" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({ from: '/$slug/' });
  return <RestaurantPublicMenu slug={params?.slug} />;
}

export function RestaurantPublicMenu({ slug, isPreview = false }: { slug: string; isPreview?: boolean }) {
  const { data: restaurant, isLoading: restLoading, error: restError } = useRestaurant(slug);
  const { data: menu, isLoading: menuLoading, error: menuError } = useMenu(restaurant?.id || '');
  const { items, addItem } = useCart();
  const [showOrder, setShowOrder] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'inicio' | 'cardapio' | 'pedido'>('inicio');
  const [mixState, setMixState] = useState<{
    open: boolean;
    product: any | null;
    size: ProductSize | null;
    price: number;
  }>({ open: false, product: null, size: null, price: 0 });
  const [acaiBuilderProduct, setAcaiBuilderProduct] = useState<any | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Dual-mode (Lanches × Açaí) — só ativo no slug do Expresso
  const isDual = slug === 'expresso-do-lanche-acai';
  const [mode, setMode] = useState<'lanches' | 'acai'>('lanches');
  useEffect(() => {
    if (!isDual) return;
    try {
      const saved = sessionStorage.getItem('expresso-mode');
      if (saved === 'acai' || saved === 'lanches') setMode(saved);
    } catch {}
  }, [isDual]);
  useEffect(() => {
    if (!isDual) return;
    try { sessionStorage.setItem('expresso-mode', mode); } catch {}
  }, [mode, isDual]);

  const isAcaiCategory = (name: string) => /a[çc]a[ií]/i.test(name);
  const visibleCategoryIds = useMemo(() => {
    if (!isDual || !menu?.categories) return null;
    const filtered = menu.categories.filter((c) =>
      mode === 'acai' ? isAcaiCategory(c.name) : !isAcaiCategory(c.name)
    );
    return new Set(filtered.map((c) => c.id));
  }, [isDual, menu?.categories, mode]);
  const acaiCategoryIds = useMemo(() => {
    if (!isDual || !menu?.categories) return new Set<string>();
    return new Set(menu.categories.filter((c) => isAcaiCategory(c.name)).map((c) => c.id));
  }, [isDual, menu?.categories]);
  const isAcaiProduct = (p: any) => !!(p?.category_id && acaiCategoryIds.has(p.category_id));

  const filteredProducts = useMemo(() => {
    if (!menu?.products) return [];
    let base = menu.products;
    if (visibleCategoryIds) base = base.filter((p) => p.category_id && visibleCategoryIds.has(p.category_id));
    if (!searchQuery) return base;
    return base.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menu?.products, searchQuery, visibleCategoryIds]);

  const promoProducts = useMemo(
    () =>
      (filteredProducts || []).filter(
        (p) => !p.has_sizes && p.is_on_promo && p.promo_price != null
      ),
    [filteredProducts]
  );

  const priceForSize = (p: any, size: ProductSize): number => {
    const v = size === "P" ? p.price_p : size === "M" ? p.price_m : p.price_g;
    return Number(v ?? 0);
  };

  const mixOptions = useMemo(
    () =>
      (menu?.products || [])
        .filter((p: any) => p.has_sizes && p.is_available !== false)
        .map((p: any) => ({ id: p.id, name: p.name })),
    [menu?.products]
  );

  const handleSizeClick = (prod: any, size: ProductSize, val: number) => {
    if (size === "P") {
      addItem({ ...prod, price: val }, { size });
      return;
    }
    setMixState({ open: true, product: prod, size, price: val });
  };

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
      <div className="min-h-dvh bg-zinc-100 px-5 pt-6 pb-24 space-y-6 animate-pulse">
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
      <div className="min-h-dvh flex items-center justify-center bg-zinc-100 px-6 text-center">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 mb-2">Cardápio não encontrado</h1>
          <p className="text-sm text-zinc-500">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  const t = isDual
    ? (mode === 'acai'
        ? buildMenuTheme({
            background_color: '#1E0B2E',
            primary_color: '#A855F7',
            button_color: '#8B5CF6',
            text_color: '#F5F0FF',
            font_family: restaurant.font_family,
          })
        : buildMenuTheme({
            background_color: '#1A0F1F',
            primary_color: '#FF6B1A',
            button_color: '#FFC107',
            text_color: '#FFF6E5',
            font_family: restaurant.font_family,
          }))
    : buildMenuTheme(restaurant);
  const visibleCategories = visibleCategoryIds
    ? (menu?.categories || []).filter((c) => visibleCategoryIds.has(c.id))
    : (menu?.categories || []);
  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const deliveryLabel = restaurant.delivery_fee > 0
    ? `Entrega ${formatCurrency(restaurant.delivery_fee)}`
    : 'Entrega grátis';
  const timeLabel = restaurant.average_delivery_time || '30-45 min';

  return (
    <div
      className="min-h-dvh pb-24 overflow-x-hidden"
      style={{ fontFamily: t.font, backgroundColor: t.background, color: t.text }}
    >
      {restaurant.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeCustomCss(restaurant.custom_css) }} />
      )}

      {isPreview && (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-bold shadow-lg">
          ✨ MODELO DE DEMONSTRAÇÃO — Seu cardápio pode ficar assim! 
          <a href="https://wa.me/" className="underline ml-2">Fale conosco</a>
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-6 pb-4 sm:px-6">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-md flex items-center justify-center overflow-hidden shrink-0"
            style={{ backgroundColor: t.surface }}
          >
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-black"
                style={{ backgroundColor: t.primary, color: t.onPrimary }}
              >
                {restaurant.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate" style={{ color: t.text }}>
              {restaurant.name}
            </h1>
            <p className="text-xs font-medium truncate mt-1" style={{ color: t.textMuted }}>
              {deliveryLabel} · {timeLabel}
            </p>
            {restaurant.description && (
              <p className="text-xs line-clamp-2 leading-snug mt-1" style={{ color: t.textFaint }}>
                {restaurant.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Banner */}
      {restaurant.banner_url && (
        <div className="px-5 sm:px-6 mt-1">
          <div className="relative h-40 sm:h-48 rounded-3xl overflow-hidden shadow-lg">
            <img
              src={restaurant.banner_url}
              alt={`Banner ${restaurant.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Mode switcher: Lanches × Açaí */}
      {isDual && (
        <div className="px-5 sm:px-6 mt-5">
          <div
            role="tablist"
            aria-label="Tipo de cardápio"
            className="relative grid grid-cols-2 p-1.5 rounded-full shadow-lg backdrop-blur"
            style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
          >
            {(['lanches', 'acai'] as const).map((m) => {
              const active = mode === m;
              const label = m === 'lanches' ? 'Lanches' : 'Açaí';
              const Icon = m === 'lanches' ? Sandwich : IceCream;
              const activeBg = m === 'lanches' ? '#FF6B1A' : '#A855F7';
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(m)}
                  className="relative z-10 h-12 rounded-full flex items-center justify-center gap-2 text-sm font-black tracking-wide transition-colors"
                  style={{ color: active ? '#fff' : t.textMuted }}
                >
                  {active && (
                    <motion.span
                      layoutId="mode-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-full shadow-md -z-10"
                      style={{ backgroundColor: activeBg }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories pills */}
      {restaurant.show_categories !== false && visibleCategories.length > 0 && (
        <nav aria-label="Categorias" className="mt-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-5 sm:px-6 pb-1">
            {visibleCategories.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  type="button"
                  aria-current={isActive ? 'true' : undefined}
                  className="snap-start shrink-0 px-4 h-10 rounded-full text-xs font-bold transition-all flex items-center"
                  style={
                    isActive
                      ? { backgroundColor: t.primary, color: t.onPrimary, border: `1px solid ${t.primary}` }
                      : { backgroundColor: t.surface, color: t.text, border: `1px solid ${t.border}` }
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
        <div role="search" className="px-5 sm:px-6 mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: t.textFaint }} />
            <input
              ref={searchRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Buscar no cardápio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar produtos"
              className="w-full h-12 pl-11 pr-4 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 placeholder:opacity-50"
              style={{
                color: t.text,
                backgroundColor: t.surface,
                border: `1px solid ${t.border}`,
                ['--tw-ring-color' as any]: `${t.primary}33`,
              }}
            />
          </div>
        </div>
      )}

      {/* Menu */}
      <main ref={menuRef} className="px-5 sm:px-6 mt-8">
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={isDual ? mode : 'single'}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="space-y-10"
      >
        {!searchQuery && promoProducts.length > 0 && (
          <section aria-label="Promoções" className="-mx-5 sm:-mx-6">
            <div
              className="relative overflow-hidden mx-5 sm:mx-6 rounded-3xl p-5 sm:p-6 shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b 0%, #ef4444 55%, #db2777 100%)",
                color: "#fff",
              }}
            >
              {/* glow blobs */}
              <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-8 w-44 h-44 rounded-full bg-white/10 blur-3xl" />

              <div className="relative flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-white/20 backdrop-blur">
                  <Flame className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight leading-none flex items-center gap-1.5">
                    Ofertas de hoje
                    <Sparkles className="w-4 h-4" />
                  </h2>
                  <p className="text-[11px] sm:text-xs font-medium opacity-90 mt-1">
                    Só por tempo limitado · {promoProducts.length}{" "}
                    {promoProducts.length === 1 ? "item" : "itens"}
                  </p>
                </div>
              </div>

              <div className="relative flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-1 px-1 pb-1">
                {promoProducts.map((prod) => {
                  const off = Math.max(
                    0,
                    Math.round(
                      ((prod.price - Number(prod.promo_price)) / prod.price) * 100
                    )
                  );
                  return (
                    <motion.article
                      key={prod.id}
                      layout
                      className="snap-start shrink-0 w-[230px] sm:w-[250px] rounded-2xl bg-white text-zinc-900 shadow-lg overflow-hidden flex flex-col"
                    >
                      <div className="relative h-32 bg-zinc-100">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                        {off > 0 && (
                          <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-white px-2 py-1 rounded-full shadow">
                            -{off}%
                          </span>
                        )}
                        <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-zinc-900 px-2 py-1 rounded-full shadow">
                          <Tag className="w-3 h-3" />
                          {prod.promo_label || "Promo"}
                        </span>
                      </div>

                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="text-sm font-black leading-snug line-clamp-2">
                          {prod.name}
                        </h3>
                        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[11px] line-through text-zinc-400 leading-none">
                              {formatCurrency(prod.price)}
                            </div>
                            <div className="text-base font-black text-rose-600 leading-tight">
                              {formatCurrency(Number(prod.promo_price))}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              addItem({ ...prod, price: Number(prod.promo_price) })
                            }
                            type="button"
                            aria-label={`Adicionar ${prod.name}`}
                            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform bg-zinc-900 text-white"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {visibleCategories.map(cat => {
          const prods = filteredProducts.filter(p => p.category_id === cat.id);
          if (prods.length === 0) return null;
          return (
            <section
              key={cat.id}
              id={`cat-${cat.id}`}
              ref={(el) => { sectionRefs.current[cat.id] = el; }}
              className="space-y-4 scroll-mt-20"
            >
              <div className="flex items-center gap-2.5">
                <span className="block w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: t.primary }} />
                <h2 className="text-lg font-black tracking-tight truncate" style={{ color: t.text }}>
                  {cat.name}
                </h2>
                <span className="text-xs font-medium shrink-0" style={{ color: t.textFaint }}>
                  {prods.length} {prods.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              <div className="space-y-3">
                {prods.map(prod => (
                  <motion.article
                    key={prod.id}
                    layout
                    className="rounded-3xl p-3 sm:p-4 flex gap-3 sm:gap-4 shadow-sm"
                    style={{
                      backgroundColor: t.surface,
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0"
                      style={{ backgroundColor: t.surfaceMuted }}
                    >
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: t.textFaint }}>
                          <Package className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="min-w-0">
                        {prod.is_best_seller && (
                          <span
                            className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5"
                            style={{ backgroundColor: t.primary, color: t.onPrimary }}
                          >
                            Mais pedido
                          </span>
                        )}
                        <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2" style={{ color: t.text }}>
                          {prod.name}
                        </h3>
                        {prod.description && (
                          <p className="text-xs leading-relaxed line-clamp-2 mt-1" style={{ color: t.textMuted }}>
                            {prod.description}
                          </p>
                        )}
                        {prod.sides_note && (
                          <p className="text-[11px] leading-snug mt-1 italic" style={{ color: t.textFaint }}>
                            Acompanha: {prod.sides_note}
                          </p>
                        )}
                      </div>

                      {prod.has_sizes ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(["P", "M", "G"] as const).map((size) => {
                            const val = priceForSize(prod, size);
                            if (!val) return null;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleSizeClick(prod, size, val)}
                                aria-label={`Adicionar ${prod.name} tamanho ${size}`}
                                className="flex-1 min-w-[88px] h-11 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                                style={{
                                  backgroundColor: t.buttonColor,
                                  color: t.onButton,
                                }}
                              >
                                <span className="text-sm font-black opacity-90">{size}</span>
                                <span className="opacity-90">·</span>
                                <span>{formatCurrency(val)}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                      <div className="flex items-center justify-between gap-2 mt-3">
                        <div className="flex items-baseline gap-2 min-w-0">
                          {prod.is_on_promo && prod.promo_price != null ? (
                            <>
                              <span className="text-base font-black truncate" style={{ color: t.primary }}>
                                {formatCurrency(Number(prod.promo_price))}
                              </span>
                              <span className="text-xs line-through" style={{ color: t.textFaint }}>
                                {formatCurrency(prod.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-black truncate" style={{ color: t.text }}>
                              {formatCurrency(prod.price)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (isAcaiProduct(prod)) {
                              setAcaiBuilderProduct(prod);
                              return;
                            }
                            addItem({
                              ...prod,
                              price: prod.is_on_promo && prod.promo_price != null ? Number(prod.promo_price) : prod.price,
                            });
                          }}
                          type="button"
                          aria-label={`Adicionar ${prod.name}`}
                          className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
                          style={{ backgroundColor: t.buttonColor, color: t.onButton }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          );
        })}

        {searchQuery && filteredProducts.length === 0 && (
          <div className="text-center py-16" style={{ color: t.textMuted }}>
            <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum item encontrado para "{searchQuery}".</p>
          </div>
        )}
      </motion.div>
      </AnimatePresence>
      </main>

      {/* Bottom tab bar */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl"
        style={{
          backgroundColor: t.background,
          borderTop: `1px solid ${t.border}`,
          paddingBottom: 'env(safe-area-inset-bottom)',
          color: t.text,
        }}
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
            textColor={t.text}
            mutedColor={t.textMuted}
            activeColor={t.primary}
          />
          <TabButton
            icon={<MenuIcon className="w-5 h-5" />}
            label="Cardápio"
            active={activeTab === 'cardapio'}
            onClick={() => {
              setActiveTab('cardapio');
              if (menu?.categories?.[0]) scrollToCategory(menu.categories[0].id);
            }}
            textColor={t.text}
            mutedColor={t.textMuted}
            activeColor={t.primary}
          />
          <TabButton
            icon={<ShoppingCart className="w-5 h-5" />}
            label="Pedido"
            active={activeTab === 'pedido'}
            onClick={() => { setActiveTab('pedido'); setShowOrder(true); }}
            textColor={t.text}
            mutedColor={t.textMuted}
            activeColor={t.primary}
            onActive={t.onPrimary}
            badge={cartCount}
          />
        </div>
      </footer>

      <CartDrawer 
        isOpen={showOrder} 
        onClose={() => setShowOrder(false)} 
        restaurant={restaurant} 
        isPreview={isPreview}
      />

      <MixSelectorDialog
        open={mixState.open}
        onOpenChange={(o) => setMixState((s) => ({ ...s, open: o }))}
        baseProduct={mixState.product}
        size={mixState.size}
        price={mixState.price}
        options={mixOptions}
        maxMisturas={mixState.size === "G" ? 3 : mixState.size === "M" ? 2 : 1}
        onConfirm={(names) => {
          if (!mixState.product || !mixState.size) return;
          addItem(
            { ...mixState.product, price: mixState.price },
            { size: mixState.size, notes: `Misturas: ${names.join(", ")}` }
          );
        }}
      />

      <AcaiBuilderDialog
        open={!!acaiBuilderProduct}
        onOpenChange={(o) => { if (!o) setAcaiBuilderProduct(null); }}
        productName={acaiBuilderProduct?.name || 'Copo de Açaí'}
        price={Number(
          acaiBuilderProduct?.is_on_promo && acaiBuilderProduct?.promo_price != null
            ? acaiBuilderProduct.promo_price
            : acaiBuilderProduct?.price ?? 15
        )}
        onConfirm={({ mix1, mix2 }) => {
          if (!acaiBuilderProduct) return;
          const parts: string[] = [];
          if (mix1.length) parts.push(`Mix 1: ${mix1.join(', ')}`);
          if (mix2.length) parts.push(`Mix 2: ${mix2.join(', ')}`);
          const notes = parts.length ? parts.join(' · ') : 'Sem complementos';
          const finalPrice = Number(
            acaiBuilderProduct.is_on_promo && acaiBuilderProduct.promo_price != null
              ? acaiBuilderProduct.promo_price
              : acaiBuilderProduct.price
          );
          addItem(
            { ...acaiBuilderProduct, price: finalPrice },
            { notes }
          );
        }}
      />
    </div>
  );
}

function TabButton({ icon, label, active, onClick, textColor, mutedColor, activeColor, onActive, badge }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  textColor?: string;
  mutedColor?: string;
  activeColor?: string;
  onActive?: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-current={active ? 'page' : undefined}
      className="relative flex flex-col items-center justify-center gap-1 min-h-12 rounded-2xl transition-colors"
      style={{ color: active ? activeColor || textColor : mutedColor || textColor }}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span
            className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: activeColor || '#E29B5D', color: onActive || '#ffffff' }}
          >
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </button>
  );
}
