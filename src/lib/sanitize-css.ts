/**
 * Sanitiza CSS fornecido por terceiros antes de injetar em <style>.
 * Bloqueia vetores comuns de exfiltração e UI redress:
 * - tags HTML (<script>, <style>, etc.)
 * - construções perigosas: expression(), javascript:, behavior, @import,
 *   -moz-binding, url(...) com origens externas ou data URIs
 */
export function sanitizeCustomCss(input: string | null | undefined): string {
  if (!input) return "";
  let css = String(input);

  // Remove qualquer tag HTML embutida
  css = css.replace(/<\/?[a-zA-Z][^>]*>/g, "");

  // Strings perigosas
  const banned = [
    /expression\s*\(/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /behavior\s*:/gi,
    /-moz-binding/gi,
    /@import\b/gi,
    /@charset\b/gi,
    /@namespace\b/gi,
  ];
  for (const re of banned) css = css.replace(re, "/*blocked*/");

  // Remove url(...) que aponte para origem externa ou data URI.
  // Mantém url(#id) (referências SVG/anchor internas).
  css = css.replace(/url\s*\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, _q, ref) => {
    const v = String(ref).trim();
    if (v.startsWith("#") || v.startsWith("/")) return `url(${v})`;
    return "none";
  });

  return css;
}