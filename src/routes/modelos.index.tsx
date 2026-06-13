import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Restaurant } from "@/types";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, UtensilsCrossed, Eye, Flame, Leaf, Pizza, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/modelos/")({
  head: () => ({
    meta: [
      { title: "Modelos de Cardápio Digital — Escolha o seu estilo" },
      { name: "description", content: "Veja modelos de cardápios prontos: hamburgueria, comida caseira, saudável e mais. Totalmente interativo para demonstração." },
      { property: "og:title", content: "Modelos de Cardápio Digital — Escolha o seu estilo" },
      { property: "og:description", content: "Explore modelos de cardápio interativos antes de criar o seu." },
    ],
  }),
  component: ModelosPage,
});

const STYLE_META: Record<string, { tagline: string; icon: typeof Flame; vibe: string; accent: string }> = {
  "point-do-gordinho": {
    tagline: "Hamburgueria descolada",
    icon: Flame,
    vibe: "Visual moderno com fotos grandes, ideal para fast-food e lanches.",
    accent: "from-orange-500 to-rose-500",
  },
  "delicias-da-taty": {
    tagline: "Comida caseira",
    icon: UtensilsCrossed,
    vibe: "Layout aconchegante perfeito para marmitas, PFs e pratos do dia.",
    accent: "from-amber-500 to-orange-600",
  },
  "cardapio-saudavel": {
    tagline: "Saudável & Fit",
    icon: Leaf,
    vibe: "Estilo clean, fotos leves, ideal para bowls, saladas e sucos.",
    accent: "from-emerald-500 to-teal-500",
  },
};

function ModelosPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    async function load() {
      const sb = createClient(
        "https://mrjkizqyrmljtlvusgta.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamtpenF5cm1sanRsdnVzZ3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDAsImV4cCI6MjA5NjUzMjc0MH0.JTDSgPn20PipEOx6GIFtnXc-M2T2o3S4oM7t0saIwVY"
      );
      const { data } = await sb.from("restaurants").select("*");
      if (data) setRestaurants(data as Restaurant[]);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-['Outfit']">
      <header className="bg-white border-b border-zinc-100 px-8 py-5 flex justify-between items-center sticky top-0 z-50 backdrop-blur-xl bg-white/80">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">MenuMaster</span>
        </Link>
        <Button onClick={() => navigate({ to: "/admin" })} className="bg-zinc-900 text-white rounded-full px-6 h-11 font-black uppercase tracking-widest text-[10px]">
          Quero o meu
        </Button>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-zinc-200 rounded-full mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Modelos de Demonstração</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-6">
            Escolha o estilo do <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-600 to-emerald-500">
              seu cardápio
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Navegue, adicione itens ao carrinho, simule pedidos — tudo igual ao seu cliente faria. <br />
            <span className="text-zinc-400 text-sm">Estes são exemplos de demonstração, nada é enviado de verdade.</span>
          </p>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((rest) => {
            const meta = STYLE_META[rest.slug] || {
              tagline: rest.business_type,
              icon: Pizza,
              vibe: rest.description || "Modelo de cardápio.",
              accent: "from-zinc-700 to-zinc-900",
            };
            const Icon = meta.icon;
            return (
              <motion.div
                key={rest.id}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl border border-zinc-100 transition-all duration-500 flex flex-col"
              >
                <div className="h-52 relative overflow-hidden">
                  {rest.banner_url ? (
                    <img src={rest.banner_url} alt={rest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${meta.accent}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur rounded-full">
                    <Icon className="w-3.5 h-3.5 text-zinc-900" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">{meta.tagline}</span>
                  </div>
                </div>
                <div className="p-7 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black tracking-tight mb-2">{rest.name}</h3>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-6 flex-1">{meta.vibe}</p>
                  <Link
                    to="/modelos/$slug"
                    params={{ slug: rest.slug }}
                    className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[11px] hover:bg-primary transition-colors group/btn"
                  >
                    <Eye className="w-4 h-4" />
                    Ver este modelo
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 text-center bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[3rem] p-12 md:p-20">
          <Coffee className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">Gostou de algum modelo?</h2>
          <p className="text-zinc-400 font-medium mb-10 max-w-xl mx-auto">
            Crie o seu cardápio agora — personalize cores, fotos e produtos do seu jeito.
          </p>
          <Button onClick={() => navigate({ to: "/admin" })} className="h-14 px-10 rounded-full bg-white text-zinc-900 font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-transform">
            Criar meu cardápio <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}