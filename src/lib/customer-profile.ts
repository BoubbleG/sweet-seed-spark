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
  const { data, error } = await supabase.rpc("find_customer_profile", {
    _restaurant_id: restaurantId,
    _phone: p,
  });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) return null;
  return {
    name: row.name ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    neighborhood: row.neighborhood ?? "",
    reference: row.reference ?? "",
    paymentMethod: row.payment_method ?? "",
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
    await supabase.rpc("upsert_customer_profile", {
      _restaurant_id: restaurantId,
      _phone: phone,
      _name: profile.name || "",
      _address: profile.address || "",
      _neighborhood: profile.neighborhood || "",
      _reference: profile.reference || "",
      _payment_method: profile.paymentMethod || "",
    });
  } catch (e) {
    console.warn("saveCustomerProfile remoto falhou", e);
  }
}

export async function deleteRemoteProfile(restaurantId: string, phone: string) {
  const p = normalizePhone(phone);
  if (p.length < 10) return;
  // Requer sessão PIN do restaurante; ignora erros silenciosamente.
  try {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("pin_session:")) {
          token = localStorage.getItem(k);
          if (token) break;
        }
      }
    }
    if (!token) return;
    await supabase.rpc("delete_customer_profile", {
      _session_token: token,
      _restaurant_id: restaurantId,
      _phone: p,
    });
  } catch {
    /* ignore */
  }
}