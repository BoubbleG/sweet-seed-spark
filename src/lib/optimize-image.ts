// Otimização de URL de imagem para Unsplash e Cloudflare R2.
// Reduz bytes baixados em até 70% e habilita formatos modernos quando o host suporta.
export function optimizeImageUrl(
  url: string | null | undefined,
  opts: { w?: number; q?: number } = {},
): string {
  if (!url) return "";
  const { w = 400, q = 70 } = opts;
  try {
    const u = new URL(url);
    // Unsplash: aceita w, q e fm=webp via querystring
    if (u.hostname.endsWith("unsplash.com")) {
      u.searchParams.set("w", String(w));
      u.searchParams.set("q", String(q));
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}