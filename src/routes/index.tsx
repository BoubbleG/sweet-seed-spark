import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UtensilsCrossed, Plus, Minus, ArrowRight, Star, ShieldCheck, Zap, Smartphone, Clock as ClockIcon, MessageCircle, ShoppingBag, Flame, Leaf, Search, MapPin, ChevronRight, BadgeCheck, Sparkles, Trash2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Restaurant } from "@/types";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DemoCheckoutFlow } from "@/components/demo-checkout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MenuMaster | Plataforma de Cardápios Inteligentes" },
      { name: "description", content: "A ferramenta definitiva para criar cardápios digitais que vendem sozinhos no WhatsApp." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeCategory, setActiveCategory] = useState("burgers");
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const sb = createClient("https://mrjkizqyrmljtlvusgta.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamtpenF5cm1sanRsdnVzZ3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDAsImV4cCI6MjA5NjUzMjc0MH0.JTDSgPn20PipEOx6GIFtnXc-M2T2o3S4oM7t0saIwVY");
      const { data } = await sb.from('restaurants').select('*').eq('is_demo', false);
      if (data) setRestaurants(data as Restaurant[]);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-['Outfit'] selection:bg-primary/10 selection:text-primary">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-8 md:px-16 py-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate({ to: '/' })}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-2xl shadow-zinc-900/10 group-hover:rotate-12 transition-transform">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-zinc-900 uppercase italic">MenuMaster</span>
        </div>
        <div className="flex gap-6 items-center">
          <Button variant="ghost" className="text-zinc-500 font-bold hover:text-zinc-900 transition-colors" onClick={() => navigate({ to: '/modelos' })}>Modelos</Button>
          <Button variant="ghost" className="text-zinc-500 font-bold hover:text-zinc-900 transition-colors" onClick={() => navigate({ to: '/admin' })}>Painel Admin</Button>
          <Button className="bg-zinc-900 text-white rounded-full px-10 h-12 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-zinc-900/20 hover:bg-primary transition-all" onClick={() => navigate({ to: '/admin' })}>Começar Grátis</Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 py-24 md:py-32 lg:py-48 text-center relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-zinc-100 rounded-full mb-10 border border-zinc-200">
               <Star className="w-4 h-4 text-primary fill-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">A Plataforma #1 de Digital Menus</span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-zinc-900 mb-10 tracking-tighter leading-[0.9]">
              Cardápios que <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-600 to-emerald-500 animate-gradient-x">Vendem Sozinhos</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
              Transforme seu atendimento com cardápios inteligentes, fotos hipnotizantes e integração total com WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate({ to: '/admin' })} className="h-16 px-12 rounded-full bg-zinc-900 text-white font-black uppercase tracking-widest shadow-2xl shadow-zinc-900/20 hover:scale-105 transition-all">
                Criar Meu Cardápio Agora <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                id="ver-demo-btn"
                onClick={() => navigate({ to: '/modelos' })}
                className="h-16 px-12 rounded-full border-2 border-zinc-200 font-black uppercase tracking-widest text-[11px] hover:bg-zinc-50 transition-all"
              >
                Ver Modelos
              </Button>
            </div>
          </motion.div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[150px] animate-pulse" />
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-zinc-50 py-32 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FeatureCard icon={<Zap className="w-8 h-8" />} title="Velocidade Extrema" desc="Seu cardápio carrega instantaneamente em qualquer dispositivo, sem atritos." />
              <FeatureCard icon={<Smartphone className="w-8 h-8" />} title="Mobile First" desc="Interface desenhada especificamente para a melhor experiência no celular." />
              <FeatureCard icon={<ShieldCheck className="w-8 h-8" />} title="Gestão Master" desc="Painel intuitivo para gerenciar preços, fotos e categorias em tempo real." />
            </div>
          </div>
        </section>

        {/* Live Demo */}
        <LiveDemoSection activeCategory={activeCategory} setActiveCategory={setActiveCategory} onCta={() => navigate({ to: '/admin' })} />

        {/* Portfolio / Active Projects */}
        <section className="py-32 px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 block">Portfólio em Destaque</span>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter">Cardápios que Inspiram</h2>
            </div>
            <div className="hidden md:flex gap-4">
               <div className="flex flex-col items-end">
                 <div className="flex -space-x-3 mb-2">
                   {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-zinc-200 overflow-hidden shadow-sm" />)}
                 </div>
                 <span className="text-xs font-bold text-zinc-400">+500 Restaurantes Ativos</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {restaurants.slice(0, 5).map((rest) => (
              <ProjectCard key={rest.id} rest={rest} onNavigate={() => navigate({ to: `/${rest.slug}` })} />
            ))}

            <Card 
              className="h-full border-2 border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-white hover:border-primary transition-all duration-700 rounded-[3rem] min-h-[400px] group" 
              onClick={() => navigate({ to: '/admin' })}
            >
              <div className="w-20 h-20 rounded-[2rem] bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-8 group-hover:bg-zinc-900 transition-all duration-500 shadow-xl shadow-zinc-900/5">
                <Plus className="w-10 h-10 text-zinc-400 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-2">Inicie Seu Projeto</h3>
              <p className="text-sm text-zinc-500 font-medium">Digitalize seu negócio hoje mesmo.</p>
            </Card>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-zinc-900 py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
            <div>
               <h2 className="text-5xl font-black text-white tracking-tighter mb-8">Por que os melhores <br/>escolhem o MenuMaster?</h2>
               <div className="space-y-8">
                 <CheckItem title="99% Mais Engajamento" desc="Cardápios visuais aumentam o ticket médio dos seus clientes em até 35%." />
                 <CheckItem title="Pedidos Sem Erros" desc="Integração inteligente com WhatsApp elimina erros de comunicação no pedido." />
                 <CheckItem title="Update em Tempo Real" desc="Acabou um produto? Desative em 2 segundos pelo seu celular de onde estiver." />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <StatItem value="150k+" label="Pedidos Mensais" icon={<Zap />} />
              <StatItem value="4.9/5" label="Avaliação Média" icon={<Star />} />
              <StatItem value="12min" label="Setup Médio" icon={<Clock />} />
              <StatItem value="Zero" label="Taxa de Comissão" icon={<ShieldCheck />} />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
        </section>
      </main>

      <footer className="bg-white border-t border-zinc-100 py-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
               <UtensilsCrossed className="w-5 h-5 text-white" />
             </div>
             <span className="font-black text-xl tracking-tighter text-zinc-900 uppercase italic">MenuMaster</span>
          </div>
          <p className="text-zinc-400 text-sm font-medium">© 2026 MenuMaster Intelligence. Todos os direitos reservados.</p>
          <div className="flex gap-8">
             <FooterLink label="Privacidade" />
             <FooterLink label="Termos" />
             <FooterLink label="Suporte" />
          </div>
        </div>
      </footer>
      <DemoCheckoutFlow open={demoOpen} onOpenChange={setDemoOpen} onCreateCta={() => navigate({ to: '/admin' })} />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center text-zinc-900 border border-zinc-100">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{title}</h3>
      <p className="text-zinc-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function ProjectCard({ rest, onNavigate }: { rest: Restaurant, onNavigate: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      <div className="h-56 bg-zinc-100 relative overflow-hidden">
        {rest.banner_url ? (
          <img src={rest.banner_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-zinc-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 to-transparent" />
        <div className="absolute -bottom-8 left-10 w-24 h-24 rounded-[2rem] border-8 border-white overflow-hidden bg-white shadow-2xl flex items-center justify-center bg-gradient-to-br from-primary to-violet-600 text-white font-black text-3xl transition-transform group-hover:rotate-6">
          {rest.logo_url ? (
            <img src={rest.logo_url} className="w-full h-full object-cover" />
          ) : (
            rest.name.charAt(0)
          )}
        </div>
      </div>
      <CardHeader className="pt-16 px-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">{rest.business_type}</span>
          <div className="flex gap-1">
             <Star className="w-3 h-3 text-primary fill-primary" />
             <Star className="w-3 h-3 text-primary fill-primary" />
             <Star className="w-3 h-3 text-primary fill-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl text-zinc-900 font-black tracking-tighter mb-2">{rest.name}</CardTitle>
        <p className="text-sm text-zinc-400 font-medium line-clamp-2 min-h-[2.5rem] leading-relaxed mb-6">{rest.description}</p>
      </CardHeader>
      <CardFooter className="px-10 pb-10">
        <Button 
          className="w-full bg-zinc-900 text-white hover:bg-primary rounded-[1.5rem] h-14 font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-zinc-900/10" 
          onClick={onNavigate}
        >
          Visitar Cardápio Master
        </Button>
      </CardFooter>
    </motion.div>
  );
}

function CheckItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-5">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Star className="w-4 h-4 text-primary fill-primary" />
      </div>
      <div>
        <h4 className="text-white font-black tracking-tight mb-1">{title}</h4>
        <p className="text-zinc-400 text-sm font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StatItem({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl">
       <div className="text-primary mb-4">{icon}</div>
       <div className="text-4xl font-black text-white tracking-tighter mb-1">{value}</div>
       <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}

function FooterLink({ label }: { label: string }) {
  return <span className="text-zinc-400 font-bold hover:text-zinc-900 transition-colors cursor-pointer text-sm">{label}</span>;
}

function Clock() {
  return <Zap className="w-6 h-6" />;
}

/* ============ LIVE DEMO ============ */

const DEMO_CATEGORIES = [
  { id: "burgers", label: "Hambúrgueres", icon: Flame },
  { id: "pizzas", label: "Pizzas", icon: UtensilsCrossed },
  { id: "salads", label: "Saladas", icon: Leaf },
  { id: "drinks", label: "Bebidas", icon: ShoppingBag },
];

const DEMO_ITEMS: Record<string, Array<{ name: string; desc: string; price: string; img: string; tag?: string }>> = {
  burgers: [
    { name: "Smash Truffle", desc: "Dois smash burgers, cheddar inglês, maionese de trufa e cebola caramelizada.", price: "R$ 39,90", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", tag: "Mais Pedido" },
    { name: "Bacon Royale", desc: "Blend bovino 180g, bacon crocante artesanal, cheddar e geléia de bacon.", price: "R$ 42,00", img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=80" },
    { name: "Veggie Beet", desc: "Hambúrguer de beterraba e grão-de-bico, brie e rúcula no pão australiano.", price: "R$ 36,50", img: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&q=80", tag: "Veggie" },
    { name: "Classic Master", desc: "Carne 160g, queijo prato, alface americana, tomate e molho da casa.", price: "R$ 32,00", img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80" },
  ],
  pizzas: [
    { name: "Margherita D.O.P.", desc: "Molho San Marzano, muçarela de búfala, manjericão fresco e azeite EVO.", price: "R$ 58,00", img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80", tag: "Clássica" },
    { name: "Pepperoni Fire", desc: "Pepperoni italiano, mel apimentado e mozzarella fior di latte.", price: "R$ 64,00", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80", tag: "Picante" },
    { name: "Quattro Formaggi", desc: "Gorgonzola, parmesão, provolone e mozzarella sobre massa de fermentação natural.", price: "R$ 69,00", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
    { name: "Prosciutto Rúcula", desc: "Presunto de Parma, rúcula selvagem, parmesão laminado e tomate cereja.", price: "R$ 72,00", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
  ],
  salads: [
    { name: "Caesar Premium", desc: "Mix de folhas, frango grelhado, croutons, parmesão e molho caesar tradicional.", price: "R$ 34,00", img: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80" },
    { name: "Buddha Bowl", desc: "Quinoa, grão-de-bico assado, abacate, beterraba e molho tahine cítrico.", price: "R$ 38,90", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", tag: "Fit" },
    { name: "Salmão & Manga", desc: "Salmão grelhado, manga, rúcula, gergelim e vinagrete de maracujá.", price: "R$ 49,00", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80" },
    { name: "Caprese Burrata", desc: "Burrata cremosa, tomates heirloom, pesto fresco e pão tostado.", price: "R$ 41,00", img: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80" },
  ],
  drinks: [
    { name: "Limonada Suíça", desc: "Limão siciliano, leite condensado e gelo cristal.", price: "R$ 12,00", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80" },
    { name: "Chá Gelado da Casa", desc: "Chá preto infusionado com pêssego e hortelã.", price: "R$ 10,00", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80" },
    { name: "Coca-Cola 350ml", desc: "Lata gelada servida com limão e gelo.", price: "R$ 7,00", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80" },
    { name: "Suco Verde Detox", desc: "Couve, maçã verde, gengibre, limão e hortelã.", price: "R$ 14,00", img: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&q=80", tag: "Detox" },
  ],
};

type DemoItem = { name: string; desc: string; price: string; img: string; tag?: string };
type CartEntry = { item: DemoItem; qty: number };

const parseBRL = (s: string) => Number(s.replace(/[^\d,]/g, "").replace(",", "."));
const formatBRL = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

function LiveDemoSection({ activeCategory, setActiveCategory, onCta }: { activeCategory: string; setActiveCategory: (id: string) => void; onCta: () => void }) {
  const items = DEMO_ITEMS[activeCategory] ?? [];
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const addItem = (item: DemoItem) => {
    setCart((prev) => {
      const entry = prev[item.name];
      return { ...prev, [item.name]: { item, qty: (entry?.qty ?? 0) + 1 } };
    });
  };
  const removeItem = (name: string) => {
    setCart((prev) => {
      const entry = prev[name];
      if (!entry) return prev;
      if (entry.qty <= 1) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: { ...entry, qty: entry.qty - 1 } };
    });
  };
  const deleteItem = (name: string) =>
    setCart((prev) => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });

  const entries = Object.values(cart);
  const totalQty = entries.reduce((s, e) => s + e.qty, 0);
  const subtotal = entries.reduce((s, e) => s + parseBRL(e.item.price) * e.qty, 0);
  const deliveryFee = subtotal > 0 ? 7.9 : 0;
  const total = subtotal + deliveryFee;

  const whatsappMsg = entries.length
    ? `Olá! Gostaria de fazer um pedido no *Bistro Master*:%0A%0A${entries
        .map((e) => `• ${e.qty}x ${e.item.name} — ${formatBRL(parseBRL(e.item.price) * e.qty)}`)
        .join("%0A")}%0A%0ASubtotal: ${formatBRL(subtotal)}%0AEntrega: ${formatBRL(deliveryFee)}%0A*Total: ${formatBRL(total)}*`
    : "";

  const sendOrder = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setCart({});
      setCartOpen(false);
    }, 2200);
  };

  return (
    <section id="demo" className="scroll-mt-24 py-32 px-8 bg-gradient-to-b from-white via-zinc-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Demonstração Interativa</span>
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-6">
            Experimente seu cardápio <br/>como um cliente real
          </h2>
          <p className="text-lg text-zinc-500 font-medium">
            Adicione itens ao carrinho, ajuste quantidades e simule o envio do pedido no WhatsApp. Tudo funcional, ao vivo.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] border border-zinc-200 shadow-2xl shadow-zinc-900/10 overflow-hidden">
          {/* Demo top bar */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-medium text-zinc-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                menumaster.app/<span className="text-zinc-900 font-bold">bistromaster</span>
              </div>
            </div>
          </div>

          {/* Restaurant Banner */}
          <div className="relative h-64 md:h-80 bg-zinc-900 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80" alt="Bistro Master ambiente" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex items-end gap-6">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl border-4 border-white shadow-2xl overflow-hidden shrink-0 bg-white">
                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80" alt="Logo Bistro Master" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Aberto Agora</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 truncate">Bistro Master</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-medium text-white/80">
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.9 (1.2k avaliações)</span>
                  <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> 30-45 min</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Vila Madalena, SP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-6 md:px-10 pt-8 pb-2">
            <div className="flex items-center gap-3 bg-zinc-100 rounded-2xl px-5 py-4 border border-zinc-200">
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <span className="text-sm font-medium text-zinc-400 flex-1 truncate">Buscar pratos, bebidas ou ingredientes...</span>
              <kbd className="hidden md:inline-flex items-center px-2 py-1 bg-white border border-zinc-200 rounded-md text-[10px] font-bold text-zinc-500">⌘ K</kbd>
            </div>
          </div>

          {/* Category tabs */}
          <div className="px-6 md:px-10 py-6 flex gap-3 overflow-x-auto scrollbar-none">
            {DEMO_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  id={`demo-cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                    active
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-105"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Menu grid */}
          <div className="px-6 md:px-10 pb-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map((item, idx) => (
              (() => {
              const inCart = cart[item.name];
              return (
              <motion.article
                key={`${activeCategory}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`group flex gap-4 p-4 rounded-3xl border transition-all bg-white ${
                  inCart ? "border-emerald-400 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-100" : "border-zinc-100 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5"
                }`}
              >
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {item.tag && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-white/95 backdrop-blur text-[9px] font-black uppercase tracking-wider text-zinc-900 rounded-md shadow">
                      {item.tag}
                    </span>
                  )}
                  {inCart && (
                    <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg">
                      {inCart.qty}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <h4 className="text-lg font-black text-zinc-900 tracking-tight mb-1 truncate">{item.name}</h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-2 mb-3">{item.desc}</p>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="text-base font-black text-zinc-900">{item.price}</span>
                    {inCart ? (
                      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full p-1">
                        <button
                          aria-label={`Remover ${item.name}`}
                          onClick={() => removeItem(item.name)}
                          className="w-7 h-7 rounded-full bg-white text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-black text-emerald-700 min-w-[1ch] text-center">{inCart.qty}</span>
                        <button
                          aria-label={`Adicionar ${item.name}`}
                          onClick={() => addItem(item)}
                          className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        aria-label={`Adicionar ${item.name} ao carrinho`}
                        onClick={() => addItem(item)}
                        className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
              );
              })()
            ))}
          </div>

          {/* Sticky cart */}
          <div
            className={`border-t border-zinc-100 px-6 md:px-10 py-5 flex items-center justify-between gap-4 transition-colors ${
              totalQty > 0
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : "bg-zinc-100"
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${totalQty > 0 ? "bg-white/20 backdrop-blur" : "bg-white border border-zinc-200"}`}>
                <ShoppingBag className={`w-5 h-5 ${totalQty > 0 ? "text-white" : "text-zinc-400"}`} />
              </div>
              <div className={`min-w-0 ${totalQty > 0 ? "text-white" : "text-zinc-500"}`}>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">
                  {totalQty > 0 ? `${totalQty} ${totalQty === 1 ? "item" : "itens"} · ${formatBRL(subtotal)}` : "Carrinho vazio"}
                </div>
                <div className="font-black tracking-tight truncate">
                  {totalQty > 0 ? "Seu pedido está pronto" : "Adicione itens para começar"}
                </div>
              </div>
            </div>
            <button
              onClick={() => totalQty > 0 && setCartOpen(true)}
              disabled={totalQty === 0}
              className={`shrink-0 font-black uppercase tracking-widest text-[11px] px-6 py-3 rounded-2xl transition-all shadow-lg inline-flex items-center gap-2 ${
                totalQty > 0
                  ? "bg-white text-emerald-600 hover:scale-105 cursor-pointer"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Pedido</span>
              <span className="sm:hidden">Pedir</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Below-demo CTA */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-zinc-900 text-white">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h4 className="font-black text-xl tracking-tight mb-1">Gostou do que viu?</h4>
              <p className="text-sm text-zinc-400 font-medium">Crie um cardápio idêntico para o seu restaurante em menos de 10 minutos.</p>
            </div>
          </div>
          <Button onClick={onCta} className="bg-white text-zinc-900 hover:bg-primary hover:text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">
            Criar Meu Cardápio <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
          {sent ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-emerald-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">Pedido enviado!</h3>
              <p className="text-sm text-zinc-500 font-medium">O restaurante recebeu seu pedido via WhatsApp e já está preparando.</p>
            </div>
          ) : (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-100">
                <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-emerald-500" /> Seu Pedido
                </DialogTitle>
                <DialogDescription className="text-zinc-500 font-medium">
                  Revise os itens e envie direto para o WhatsApp do Bistro Master.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[45vh] overflow-y-auto px-6 py-4 space-y-3">
                {entries.length === 0 && (
                  <p className="text-center text-sm text-zinc-400 py-8">Carrinho vazio.</p>
                )}
                {entries.map((e) => {
                  const lineTotal = parseBRL(e.item.price) * e.qty;
                  return (
                    <div key={e.item.name} className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-zinc-50/50">
                      <img src={e.item.img} alt={e.item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-sm text-zinc-900 truncate">{e.item.name}</div>
                        <div className="text-xs text-zinc-500 font-medium">{e.item.price} cada</div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 rounded-full p-1">
                        <button onClick={() => removeItem(e.item.name)} className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-4 text-center">{e.qty}</span>
                        <button onClick={() => addItem(e.item)} className="w-6 h-6 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-sm font-black text-zinc-900 w-20 text-right tabular-nums">{formatBRL(lineTotal)}</div>
                      <button onClick={() => deleteItem(e.item.name)} aria-label="Remover item" className="w-7 h-7 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Subtotal</span><span className="tabular-nums">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Taxa de entrega</span><span className="tabular-nums">{formatBRL(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-zinc-900 font-black text-lg pt-2 border-t border-zinc-200">
                  <span>Total</span><span className="tabular-nums">{formatBRL(total)}</span>
                </div>
              </div>

              <div className="px-6 py-5 bg-white flex gap-3">
                <button
                  onClick={() => setCartOpen(false)}
                  className="flex-1 h-12 rounded-2xl border border-zinc-200 font-black uppercase tracking-widest text-[10px] text-zinc-600 hover:bg-zinc-50 inline-flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Continuar
                </button>
                <button
                  onClick={sendOrder}
                  disabled={entries.length === 0}
                  className="flex-[2] h-12 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar no WhatsApp
                </button>
              </div>
              <div className="px-6 pb-4 text-[10px] text-center text-zinc-400 font-medium">
                Simulação · Nenhuma mensagem real será enviada · Prévia: <span className="text-zinc-600">"Olá! Gostaria de fazer um pedido…"</span>
              </div>
              <input type="hidden" value={whatsappMsg} readOnly />
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
