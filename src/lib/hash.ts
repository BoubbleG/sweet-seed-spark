// Tiny SHA-256 helper used to hash the admin master password before
// storing it in `app_settings`. Web Crypto is available in the browser and
// in the Workers runtime, so this works server- and client-side.
export async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}