import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UtensilsCrossed, Plus, Eye, ArrowRight, Star, ShieldCheck, Zap, Smartphone, Globe, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Restaurant } from "@/types";
import { motion } from "framer-motion";

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

  useEffect(() => {
    async function load() {
      const sb = createClient("https://mrjkizqyrmljtlvusgta.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamtpenF5cm1sanRsdnVzZ3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTY3NDAsImV4cCI6MjA5NjUzMjc0MH0.JTDSgPn20PipEOx6GIFtnXc-M2T2o3S4oM7t0saIwVY");
      const { data } = await sb.from('restaurants').select('*');
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
              <Button variant="outline" className="h-16 px-12 rounded-full border-2 border-zinc-200 font-black uppercase tracking-widest text-[11px] hover:bg-zinc-50 transition-all">
                Ver Demonstração
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
