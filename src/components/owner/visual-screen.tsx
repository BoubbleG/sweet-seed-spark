import { useState, useRef } from "react";
import { Restaurant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SectionShell, SectionCard, StickySaveBar } from "./shared";
import { Image as ImageIcon, Upload, Trash2, Check } from "lucide-react";
import { recordSnapshot } from "@/lib/snapshots";

const COLORS = [
  { name: "Vermelho", value: "#ef4444" },
  { name: "Laranja", value: "#f97316" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Verde", value: "#22c55e" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Preto", value: "#18181b" },
];

export function OwnerVisualScreen({
  restaurant,
  onBack,
}: {
  restaurant: Restaurant;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Restaurant>>(restaurant);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);

  const upload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo_url" | "banner_url"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field === "logo_url" ? "logo" : "banner");
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${restaurant.id}/${field}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("restaurant-assets")
        .upload(fileName, file);
      if (error) throw error;
      const { data: signed, error: sErr } = await supabase.storage
        .from("restaurant-assets")
        .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10);
      if (sErr) throw sErr;
      setForm((p) => ({ ...p, [field]: signed.signedUrl }));
      toast.success("Imagem enviada!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await recordSnapshot(restaurant.id, "Alterou aparência (logo/capa/cor)", "visual");
    const { error } = await supabase
      .from("restaurants")
      .update({
        logo_url: form.logo_url ?? null,
        banner_url: form.banner_url ?? null,
        primary_color: form.primary_color || "#18181b",
      })
      .eq("id", restaurant.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["restaurant-by-token"] });
    qc.invalidateQueries({ queryKey: ["restaurant", restaurant.slug] });
    setSaved(true);
    toast.success("Aparência atualizada!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SectionShell
      title="Aparência"
      subtitle="Logo, capa e cor"
      onBack={onBack}
    >
      <SectionCard title="Logo" icon={<ImageIcon className="w-4 h-4" />}>
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200">
            {form.logo_url ? (
              <img src={form.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-7 h-7 text-zinc-400" />
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <button
              onClick={() => logoRef.current?.click()}
              disabled={uploading === "logo"}
              className="w-full h-12 rounded-xl bg-zinc-900 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Upload className="w-4 h-4" />
              {uploading === "logo"
                ? "Enviando…"
                : form.logo_url
                ? "Trocar logo"
                : "Enviar logo"}
            </button>
            {form.logo_url && (
              <button
                onClick={() => setForm({ ...form, logo_url: "" })}
                className="w-full h-10 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover
              </button>
            )}
          </div>
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => upload(e, "logo_url")}
          />
        </div>
      </SectionCard>

      <SectionCard title="Capa do cardápio" icon={<ImageIcon className="w-4 h-4" />}>
        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
          {form.banner_url ? (
            <img src={form.banner_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium">Sem capa</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => bannerRef.current?.click()}
            disabled={uploading === "banner"}
            className="flex-1 h-12 rounded-xl bg-zinc-900 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            {uploading === "banner"
              ? "Enviando…"
              : form.banner_url
              ? "Trocar capa"
              : "Enviar capa"}
          </button>
          {form.banner_url && (
            <button
              onClick={() => setForm({ ...form, banner_url: "" })}
              className="h-12 px-4 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <input
          ref={bannerRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => upload(e, "banner_url")}
        />
      </SectionCard>

      <SectionCard title="Cor principal">
        <p className="text-xs text-zinc-500 -mt-2">
          Aparece nos botões e destaques do seu cardápio.
        </p>
        <div className="grid grid-cols-4 gap-3">
          {COLORS.map((c) => {
            const active =
              (form.primary_color || "").toLowerCase() === c.value.toLowerCase();
            return (
              <button
                key={c.value}
                onClick={() => setForm({ ...form, primary_color: c.value })}
                className={`relative aspect-square rounded-2xl flex items-end justify-center p-2 transition active:scale-95 ${
                  active ? "ring-4 ring-offset-2 ring-zinc-900" : ""
                }`}
                style={{ backgroundColor: c.value }}
                aria-label={c.name}
              >
                {active && (
                  <Check
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 text-white drop-shadow"
                  />
                )}
                <span className="text-[10px] font-black text-white/90 drop-shadow uppercase">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Como vai aparecer">
        <div className="rounded-2xl border border-zinc-200 overflow-hidden">
          <div
            className="h-24 bg-zinc-200 relative"
            style={
              form.banner_url
                ? { backgroundImage: `url(${form.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-2xl bg-white border-2 border-white overflow-hidden flex items-center justify-center shadow">
              {form.logo_url ? (
                <img src={form.logo_url} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-zinc-300" />
              )}
            </div>
          </div>
          <div className="pt-8 px-4 pb-4 bg-white">
            <p className="font-black text-zinc-900">{restaurant.name}</p>
            <button
              className="mt-3 h-10 px-5 rounded-xl text-white font-black text-sm"
              style={{ backgroundColor: form.primary_color || "#18181b" }}
            >
              Pedir agora
            </button>
          </div>
        </div>
      </SectionCard>

      <StickySaveBar saving={saving} saved={saved} onSave={save} />
    </SectionShell>
  );
}