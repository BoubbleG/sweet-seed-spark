import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Restaurant } from "@/types";
import { OwnerMenuScreen } from "@/components/owner/menu-screen";
import { OwnerPromoScreen } from "@/components/owner/promo-screen";
import { OwnerVisualScreen } from "@/components/owner/visual-screen";
import { OwnerInfoScreen } from "@/components/owner/info-screen";
import { OwnerOrdersScreen } from "@/components/owner/orders-screen";
import {
  Utensils,
  Palette,
  Tag,
  Phone,
  Link2,
  Eye,
  Share2,
  ChevronRight,
  Store,
  Pencil,
  Check,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/editar/$token")({
  head: () => ({ meta: [{ title: "Editor do Restaurante" }] }),
  component: OwnerEditor,
});

type Screen = "home" | "orders" | "menu" | "promo" | "visual" | "info";

function OwnerEditor() {
  const { token } = useParams({ from: "/editar/$token" });

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ["restaurant-by-token", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("edit_token", token)
        .maybeSingle();
      if (error) throw error;
      return data as Restaurant | null;
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-zinc-50 flex items-center justify-center px-6">
        <div className="animate-pulse text-sm font-medium text-zinc-500">
          Carregando seu cardápio…
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-dvh bg-zinc-50 flex items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <Link2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 mb-2">Link inválido</h1>
          <p className="text-sm text-zinc-500">
            Este link de edição não é mais válido. Peça um novo link ao administrador.
          </p>
        </div>
      </div>
    );
  }

  return <OwnerShell restaurant={restaurant} />;
}

function OwnerShell({ restaurant }: { restaurant: Restaurant }) {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "orders")
    return (
      <OwnerOrdersScreen
        restaurant={restaurant}
        onBack={() => setScreen("home")}
      />
    );
  if (screen === "menu")
    return (
      <OwnerMenuScreen
        restaurantId={restaurant.id}
        onBack={() => setScreen("home")}
      />
    );
  if (screen === "promo")
    return (
      <OwnerPromoScreen
        restaurantId={restaurant.id}
        onBack={() => setScreen("home")}
      />
    );
  if (screen === "visual")
    return (
      <OwnerVisualScreen
        restaurant={restaurant}
        onBack={() => setScreen("home")}
      />
    );
  if (screen === "info")
    return (
      <OwnerInfoScreen
        restaurant={restaurant}
        onBack={() => setScreen("home")}
      />
    );

  return <OwnerHome restaurant={restaurant} onOpen={setScreen} />;
}

function OwnerHome({
  restaurant,
  onOpen,
}: {
  restaurant: Restaurant;
  onOpen: (s: Screen) => void;
}) {
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${restaurant.slug}`
      : `/${restaurant.slug}`;
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      const nav: any = typeof navigator !== "undefined" ? navigator : null;
      if (nav && typeof nav.share === "function") {
        await nav.share({
          title: restaurant.name,
          text: `Veja o cardápio de ${restaurant.name}`,
          url: publicUrl,
        });
        return;
      }
      await nav.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const cards: {
    key: Screen;
    title: string;
    desc: string;
    icon: React.ReactNode;
    bg: string;
    fg: string;
  }[] = [
    {
      key: "orders",
      title: "Pedidos chegando",
      desc: "Receber, imprimir e acompanhar pedidos em tempo real",
      icon: <ReceiptText className="w-6 h-6" />,
      bg: "bg-rose-100",
      fg: "text-rose-600",
    },
    {
      key: "menu",
      title: "Meu cardápio",
      desc: "Adicionar, editar e remover pratos",
      icon: <Utensils className="w-6 h-6" />,
      bg: "bg-orange-100",
      fg: "text-orange-600",
    },
    {
      key: "promo",
      title: "Promoções",
      desc: "Marcar oferta do dia e preço promocional",
      icon: <Tag className="w-6 h-6" />,
      bg: "bg-amber-100",
      fg: "text-amber-700",
    },
    {
      key: "visual",
      title: "Aparência",
      desc: "Logo, capa e cor principal",
      icon: <Palette className="w-6 h-6" />,
      bg: "bg-violet-100",
      fg: "text-violet-600",
    },
    {
      key: "info",
      title: "Meu restaurante",
      desc: "WhatsApp, endereço, horário e entrega",
      icon: <Phone className="w-6 h-6" />,
      bg: "bg-emerald-100",
      fg: "text-emerald-700",
    },
  ];

  return (
    <div className="min-h-dvh bg-zinc-50 pb-28">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center overflow-hidden shrink-0">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-6 h-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Editor do dono
            </p>
            <h1 className="text-xl font-black text-zinc-900 truncate leading-tight">
              {restaurant.name}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-500 mb-3 px-1">
          O que você quer editar?
        </h2>

        <div className="space-y-3">
          {cards.map((c) => (
            <button
              key={c.key}
              onClick={() => onOpen(c.key)}
              className="w-full flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm active:scale-[0.99] transition text-left"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${c.bg} ${c.fg} flex items-center justify-center shrink-0`}
              >
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-zinc-900 leading-tight">
                  {c.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-tight">{c.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 shrink-0" />
            </button>
          ))}
        </div>

        <div className="mt-8 bg-white border border-zinc-200 rounded-2xl p-4">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">
            Link do seu cardápio
          </p>
          <p className="text-sm font-medium text-zinc-900 truncate mb-3">
            {publicUrl}
          </p>
          <div className="flex gap-2">
            <a
              href={`/${restaurant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 h-12 rounded-xl bg-zinc-100 text-zinc-900 font-bold text-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Ver
            </a>
            <button
              onClick={share}
              className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-900 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copiado!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> Compartilhar
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-zinc-200 px-3 py-2 sm:hidden">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-1">
          <button
            onClick={() => onOpen("menu")}
            className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl active:bg-zinc-100"
          >
            <Pencil className="w-5 h-5 text-zinc-900" />
            <span className="text-[10px] font-bold text-zinc-900">Editar</span>
          </button>
          <a
            href={`/${restaurant.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl active:bg-zinc-100"
          >
            <Eye className="w-5 h-5 text-zinc-900" />
            <span className="text-[10px] font-bold text-zinc-900">Ver</span>
          </a>
          <button
            onClick={share}
            className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl active:bg-zinc-100"
          >
            <Share2 className="w-5 h-5 text-zinc-900" />
            <span className="text-[10px] font-bold text-zinc-900">Compartilhar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}