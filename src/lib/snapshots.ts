import { supabase } from "@/integrations/supabase/client";

export type SnapshotScope = "menu" | "visual" | "info" | "promo" | "delivery" | "full";

export interface SnapshotRow {
  id: string;
  restaurant_id: string;
  label: string;
  scope: SnapshotScope;
  created_at: string;
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
    const snapshot = await captureFullState(restaurantId);
    if (!snapshot.restaurant) return;
    await supabase.from("restaurant_snapshots").insert({
      restaurant_id: restaurantId,
      label,
      scope,
      snapshot: snapshot as any,
    });
    // limpa snapshots antigos (mantém últimos 100)
    const { data } = await supabase
      .from("restaurant_snapshots")
      .select("id, created_at")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });
    if (data && data.length > 100) {
      const idsToDrop = data.slice(100).map((s) => s.id);
      await supabase.from("restaurant_snapshots").delete().in("id", idsToDrop);
    }
  } catch (e) {
    console.warn("snapshot falhou", e);
  }
}

export async function listSnapshots(restaurantId: string): Promise<SnapshotRow[]> {
  const { data, error } = await supabase
    .from("restaurant_snapshots")
    .select("id, restaurant_id, label, scope, created_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as SnapshotRow[];
}

export async function restoreSnapshot(snapshotId: string, restaurantId: string) {
  // antes de restaurar, salva o estado atual para que dê para desfazer a restauração
  await recordSnapshot(restaurantId, "Antes de restaurar versão", "full");
  const { error } = await supabase.rpc("restore_restaurant_snapshot", {
    _snapshot_id: snapshotId,
  });
  if (error) throw error;
}

export async function getLatestSnapshot(restaurantId: string): Promise<SnapshotRow | null> {
  const { data } = await supabase
    .from("restaurant_snapshots")
    .select("id, restaurant_id, label, scope, created_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(1);
  return (data?.[0] as SnapshotRow) ?? null;
}