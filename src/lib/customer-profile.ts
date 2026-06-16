import { supabase } from "@/integrations/supabase/client";

export interface CustomerProfile {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  reference: string;
  paymentMethod: string;
}

function lsKey(restaurantId: string) {
  return `customer_profile_${restaurantId}`;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function readLocalProfile(restaurantId: string): Partial<CustomerProfile> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(lsKey(restaurantId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeLocalProfile(restaurantId: string, profile: Partial<CustomerProfile>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(lsKey(restaurantId), JSON.stringify(profile));
  } catch {
    /* ignore quota */
  }
}

export function clearLocalProfile(restaurantId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(lsKey(restaurantId));
  } catch {
    /* ignore */
  }
}

export async function findRemoteProfile(
  restaurantId: string,
  phone: string,
): Promise<Partial<CustomerProfile> | null> {
  const p = normalizePhone(phone);
  if (p.length < 10) return null;
  const { data, error } = await supabase
    .from("customer_profiles")
    .select("name, phone, address, neighborhood, reference, payment_method")
    .eq("restaurant_id", restaurantId)
    .eq("phone", p)
    .maybeSingle();
  if (error || !data) return null;
  return {
    name: data.name ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    neighborhood: data.neighborhood ?? "",
    reference: data.reference ?? "",
    paymentMethod: data.payment_method ?? "",
  };
}

export async function saveCustomerProfile(
  restaurantId: string,
  profile: CustomerProfile,
) {
  const phone = normalizePhone(profile.phone);
  if (phone.length < 10) return;
  writeLocalProfile(restaurantId, profile);
  try {
    await supabase.from("customer_profiles").upsert(
      {
        restaurant_id: restaurantId,
        phone,
        name: profile.name || null,
        address: profile.address || null,
        neighborhood: profile.neighborhood || null,
        reference: profile.reference || null,
        payment_method: profile.paymentMethod || null,
        last_order_at: new Date().toISOString(),
      },
      { onConflict: "restaurant_id,phone" },
    );
  } catch (e) {
    console.warn("saveCustomerProfile remoto falhou", e);
  }
}

export async function deleteRemoteProfile(restaurantId: string, phone: string) {
  const p = normalizePhone(phone);
  if (p.length < 10) return;
  await supabase
    .from("customer_profiles")
    .delete()
    .eq("restaurant_id", restaurantId)
    .eq("phone", p);
}