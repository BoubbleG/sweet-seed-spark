import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Restaurant } from "@/types";
import { MenuManager } from "@/components/admin/menu-manager";
import { VisualManager } from "@/components/admin/visual-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  Utensils,
  Palette,
  Settings,
  Check,
  Link2,
  Store,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/editar/$token")({
  head: () => ({ meta: [{ title: "Editor do Restaurante" }] }),
  component: OwnerEditor,
});

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
        <div className="animate-pulse text-sm font-medium text-zinc-500">Carregando seu cardápio…</div>
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
            Este link de edição não é mais válido ou foi regenerado. Peça um novo link ao administrador.
          </p>
        </div>
      </div>
    );
  }

  return <OwnerEditorInner restaurant={restaurant} />;
}

function OwnerEditorInner({ restaurant }: { restaurant: Restaurant }) {
  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/${restaurant.slug}` : `/${restaurant.slug}`;
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"menu" | "visual" | "info">("menu");

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link público copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.");
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50 font-['Outfit'] text-zinc-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shrink-0 overflow-hidden">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-black tracking-tight truncate">{restaurant.name}</h1>
            <p className="text-[10px] sm:text-xs font-medium text-zinc-500 truncate">
              Editor do dono · /{restaurant.slug}
            </p>
          </div>
          <Button
            onClick={copyPublicLink}
            size="sm"
            className={`rounded-xl h-10 px-3 sm:px-4 text-[11px] font-black uppercase tracking-widest shrink-0 ${
              copied ? "bg-emerald-500 hover:bg-emerald-500" : "bg-zinc-900 hover:bg-primary"
            } text-white`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Copiado</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Copiar link</span>
              </>
            )}
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-xl h-10 px-3 text-[11px] font-black uppercase tracking-widest shrink-0"
          >
            <a href={`/${restaurant.slug}`} target="_blank" rel="noreferrer">
              <Eye className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Ver</span>
            </a>
          </Button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-3">
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-2xl w-full sm:w-auto sm:inline-flex">
            <TabBtn active={tab === "menu"} onClick={() => setTab("menu")} icon={<Utensils className="w-4 h-4" />} label="Cardápio" />
            <TabBtn active={tab === "visual"} onClick={() => setTab("visual")} icon={<Palette className="w-4 h-4" />} label="Visual" />
            <TabBtn active={tab === "info"} onClick={() => setTab("info")} icon={<Settings className="w-4 h-4" />} label="Informações" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {tab === "menu" && (
          <motion.div key="menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
              icon={<Utensils className="w-5 h-5" />}
              title="Cardápio & Promoções"
              subtitle="Organize categorias, edite preços e marque itens em oferta."
            />
            <MenuManager restaurantId={restaurant.id} />
          </motion.div>
        )}

        {tab === "visual" && (
          <motion.div key="visual" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
              icon={<Palette className="w-5 h-5" />}
              title="Visual"
              subtitle="Logo, capa, cores e fonte do seu cardápio."
            />
            <VisualManager restaurant={restaurant} />
          </motion.div>
        )}

        {tab === "info" && (
          <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
              icon={<Settings className="w-5 h-5" />}
              title="Informações do restaurante"
              subtitle="WhatsApp, endereço, horário e taxa de entrega."
            />
            <InfoForm restaurant={restaurant} />
          </motion.div>
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
        active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">{title}</h2>
        <p className="text-sm text-zinc-500 font-medium mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoForm({ restaurant }: { restaurant: Restaurant }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Restaurant>>(restaurant);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(restaurant), [restaurant.id]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description ?? null,
        whatsapp: form.whatsapp,
        address: form.address ?? null,
        city: form.city ?? null,
        opening_hours: form.opening_hours ?? null,
        delivery_fee: Number(form.delivery_fee) || 0,
        min_order_for_free_delivery: form.min_order_for_free_delivery
          ? Number(form.min_order_for_free_delivery)
          : null,
        average_delivery_time: form.average_delivery_time ?? null,
        instagram: form.instagram ?? null,
        status: form.status,
      };
      const { error } = await supabase.from("restaurants").update(payload).eq("id", restaurant.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["restaurant-by-token"] });
      qc.invalidateQueries({ queryKey: ["restaurant", restaurant.slug] });
      toast.success("Informações atualizadas!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome do restaurante">
          <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-xl" />
        </Field>
        <Field label="WhatsApp (com DDI)">
          <Input
            value={form.whatsapp || ""}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, "") })}
            placeholder="5511999999999"
            className="h-11 rounded-xl"
          />
        </Field>
      </div>

      <Field label="Descrição curta">
        <Textarea
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-xl min-h-[72px]"
          maxLength={240}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Endereço">
          <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-11 rounded-xl" />
        </Field>
        <Field label="Cidade">
          <Input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-11 rounded-xl" />
        </Field>
        <Field label="Horário de funcionamento">
          <Input
            value={form.opening_hours || ""}
            onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
            placeholder="Seg-Sex 18h-23h"
            className="h-11 rounded-xl"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Taxa de entrega (R$)">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.delivery_fee ?? 0}
            onChange={(e) => setForm({ ...form, delivery_fee: Number(e.target.value) })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Pedido mín. p/ entrega grátis">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.min_order_for_free_delivery ?? ""}
            onChange={(e) => setForm({ ...form, min_order_for_free_delivery: Number(e.target.value) })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Tempo médio de entrega">
          <Input
            value={form.average_delivery_time || ""}
            onChange={(e) => setForm({ ...form, average_delivery_time: e.target.value })}
            placeholder="30-45 min"
            className="h-11 rounded-xl"
          />
        </Field>
      </div>

      <Field label="Instagram (@usuario)">
        <Input value={form.instagram || ""} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="h-11 rounded-xl" />
      </Field>

      <label className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-zinc-900">Cardápio aberto agora</p>
          <p className="text-xs text-zinc-500">Quando desligado, o cardápio mostra como fechado para clientes.</p>
        </div>
        <Switch
          checked={form.status === "active"}
          onCheckedChange={(v) => setForm({ ...form, status: v ? "active" : "inactive" })}
        />
      </label>

      <div className="pt-2 flex justify-end">
        <Button onClick={save} disabled={saving} className="rounded-xl h-12 px-8 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs hover:bg-primary">
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</Label>
      {children}
    </div>
  );
}