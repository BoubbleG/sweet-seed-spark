/**
 * Recupera credenciais para chamar a edge function `ai-designer`.
 * - admin master: hash da senha em sessionStorage (`admin_session_hash`)
 * - dono do restaurante: token PIN em localStorage (`pin_session:{slug}`)
 */
export function getAiDesignerAuth(): {
  adminPasswordHash?: string;
  sessionToken?: string;
} {
  if (typeof window === "undefined") return {};
  const adminPasswordHash =
    sessionStorage.getItem("admin_session_hash") || undefined;
  if (adminPasswordHash) return { adminPasswordHash };
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("pin_session:")) {
      const v = localStorage.getItem(k);
      if (v) return { sessionToken: v };
    }
  }
  return {};
}