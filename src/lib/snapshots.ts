import { supabase } from "@/integrations/supabase/client";

export type SnapshotScope = "menu" | "visual" | "info" | "promo" | "delivery" | "full";

export interface SnapshotRow {
  id: string;
  restaurant_id: string;
  label: string;
  scope: SnapshotScope;
  created_at: string;
}

/**
 * Recupera um token de sessão válido para o dono do restaurante:
 * - PIN session armazenada em localStorage (`pin_session:{slug}`)
 * - Token de edição presente na URL `/editar/{token}`
 * Snapshots/permissões são validadas server-side via esse token.
 */
function getActiveOwnerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const path = window.location.pathname || "";
    const m = path.match(/^\/editar\/([^/?#]+)/);
    if (m && m[1]) return decodeURIComponent(m[1]);
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("pin_session:")) {
        const v = localStorage.getItem(k);
        if (v) return v;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function captureFullState(restaurantId: string) {
  const [rest, cats, prods] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", restaurantId).single(),
    supabase.from("categories").select("*").eq("restaurant_id", restaurantId),
    supabase.from("products").select("*").eq("restaurant_id", restaurantId),
  ]);
  return {
    restaurant: rest.data,
    categories: cats.data ?? [],
    products: prods.data ?? [],
  };
}

/**
 * Grava um snapshot do estado atual antes de uma alteração.
 * Não bloqueia a UI: erros são apenas logados.
 */
export async function recordSnapshot(
  restaurantId: string,
  label: string,
  scope: SnapshotScope = "full",
) {
  try {
    const token = getActiveOwnerToken();
    if (!token) return;
    const snapshot = await captureFullState(restaurantId);
    if (!snapshot.restaurant) return;
    await supabase.rpc("record_restaurant_snapshot", {
      _session_token: token,
      _restaurant_id: restaurantId,
      _label: label,
      _scope: scope,
      _snapshot: snapshot as any,
    });
  } catch (e) {
    console.warn("snapshot falhou", e);
  }
}

export async function listSnapshots(restaurantId: string): Promise<SnapshotRow[]> {
  const token = getActiveOwnerToken();
  if (!token) return [];
  const { data, error } = await supabase.rpc("list_restaurant_snapshots", {
    _session_token: token,
    _restaurant_id: restaurantId,
  });
  if (error) throw error;
  return (data ?? []) as SnapshotRow[];
}

export async function restoreSnapshot(snapshotId: string, restaurantId: string) {
  await recordSnapshot(restaurantId, "Antes de restaurar versão", "full");
  const token = getActiveOwnerToken();
  if (!token) throw new Error("Sessão expirada. Entre novamente.");
  const { error } = await supabase.rpc("restore_restaurant_snapshot_secure", {
    _session_token: token,
    _snapshot_id: snapshotId,
  });
  if (error) throw error;
}

export async function getLatestSnapshot(restaurantId: string): Promise<SnapshotRow | null> {
  const token = getActiveOwnerToken();
  if (!token) return null;
  const { data } = await supabase.rpc("get_latest_restaurant_snapshot", {
    _session_token: token,
    _restaurant_id: restaurantId,
  });
  return (data?.[0] as SnapshotRow) ?? null;
}