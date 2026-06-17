import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Restaurant } from "@/types";
import { OwnerShell } from "./editar.$token";
import { Lock, KeyRound, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/$slug/admin")({
  head: () => ({ meta: [{ title: "Painel do restaurante" }] }),
  component: SlugAdmin,
});

function storageKey(slug: string) {
  return `pin_session:${slug}`;
}

function SlugAdmin() {
  const { slug } = useParams({ from: "/$slug/admin" });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(storageKey(slug));
  });

  // Look up the restaurant publicly first. If it has no PIN configured,
  // the owner panel is open — no gate at all.
  const { data: publicRestaurant, isLoading: publicLoading } = useQuery({
    queryKey: ["restaurant-public", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select(
          "id, name, slug, logo_url, banner_url, business_type, description, whatsapp, address, city, opening_hours, delivery_fee, min_order_for_free_delivery, average_delivery_time, instagram, status, primary_color, secondary_color, button_color, visual_style, created_at, updated_at, font_family, border_radius, card_style, show_delivery_status, header_style, category_layout, product_card_layout, background_color, text_color, show_search, show_categories, custom_css, accepts_delivery, accepts_pickup, payment_methods, is_demo",
        )
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as Restaurant | null) ?? null;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const { data: pinRequired } = useQuery({
    queryKey: ["restaurant-pin-required", slug],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("restaurant_pin_required", { _slug: slug });
      if (error) throw error;
      return !!data;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const { data: restaurant, isLoading, isError, error } = useQuery({
    queryKey: ["restaurant-by-pin-session", slug, token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase
        .rpc("find_restaurant_by_pin_session", { _token: token });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row || (row as Restaurant).slug !== slug) {
        // Token explicitly does not match this restaurant / expired on server.
        throw new Error("PIN_SESSION_INVALID");
      }
      // Sliding session: extend by 30 days on each successful load.
      supabase.rpc("extend_pin_session", { _token: token }).then(() => {}, () => {});
      return row as Restaurant;
    },
    enabled: !!token && pinRequired,
    retry: false,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // Only drop the token when the server explicitly told us it is invalid.
  // Transient network errors keep the session so the admin stays logged in.
  useEffect(() => {
    if (token && isError && (error as Error | undefined)?.message === "PIN_SESSION_INVALID") {
      localStorage.removeItem(storageKey(slug));
      setToken(null);
    }
  }, [token, isError, error, slug]);

  if (publicLoading || (pinRequired && token && isLoading)) {
    return (
      <div className="min-h-dvh bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse text-sm text-zinc-500">Carregando…</div>
      </div>
    );
  }

  // No PIN configured → open access directly to the owner panel.
  if (!pinRequired && publicRestaurant) {
    return <OwnerShell restaurant={publicRestaurant} />;
  }

  if (!token || !restaurant) {
    return (
      <PinGate
        slug={slug}
        onSuccess={(t) => {
          localStorage.setItem(storageKey(slug), t);
          setToken(t);
        }}
      />
    );
  }

  return (
    <div>
      <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-center text-xs font-semibold text-emerald-800">
        Sessão segura ativa •{" "}
        <button
          onClick={() => {
            localStorage.removeItem(storageKey(slug));
            setToken(null);
            toast.success("Você saiu");
          }}
          className="underline hover:no-underline"
        >
          Sair
        </button>
      </div>
      <OwnerShell restaurant={restaurant} />
    </div>
  );
}

function PinGate({ slug, onSuccess }: { slug: string; onSuccess: (token: string) => void }) {
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length < 4) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("verify_restaurant_pin", {
        _slug: slug,
        _pin: pin,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.session_token) throw new Error("Resposta inválida do servidor");
      onSuccess(row.session_token as string);
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível entrar");
      setPin("");
      setTimeout(() => inputRef.current?.focus(), 50);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl border border-zinc-200 p-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-6">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 text-center mb-2">
            Painel do restaurante
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-6">
            Digite o PIN que o administrador te enviou para entrar.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • •"
                className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-zinc-200 focus:border-zinc-900 outline-none text-center text-2xl font-black tracking-[0.5em] bg-zinc-50"
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || pin.length < 4}
              className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black text-base active:scale-[0.99] disabled:opacity-40 transition"
            >
              {submitting ? "Verificando…" : "Entrar"}
            </button>
          </form>

          <p className="text-xs text-zinc-400 text-center mt-6">
            Esqueceu o PIN? Fale com o administrador.
          </p>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          /{slug}/admin
        </p>
      </div>
    </div>
  );
}