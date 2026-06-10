// Theme helpers for public menu / cart drawer.
// Every text color, surface and border in the public-facing UI should
// derive from these helpers so the design works on light OR dark themes
// chosen by the restaurant in the admin.

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.trim().replace('#', '');
  if (m.length === 3) {
    const r = parseInt(m[0] + m[0], 16);
    const g = parseInt(m[1] + m[1], 16);
    const b = parseInt(m[2] + m[2], 16);
    return { r, g, b };
  }
  if (m.length === 6) {
    return {
      r: parseInt(m.slice(0, 2), 16),
      g: parseInt(m.slice(2, 4), 16),
      b: parseInt(m.slice(4, 6), 16),
    };
  }
  return null;
}

// W3C relative luminance (0..1)
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(rgb.r) + 0.7152 * toLin(rgb.g) + 0.0722 * toLin(rgb.b);
}

export function isDark(hex: string): boolean {
  return getLuminance(hex) < 0.5;
}

// Best readable foreground on a given background.
export function contrastOn(bg: string): string {
  return isDark(bg) ? '#ffffff' : '#111111';
}

// Hex with alpha appended (e.g. "#FF0000" + 0.2 -> "#FF000033").
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

export interface MenuTheme {
  primary: string;
  onPrimary: string;
  text: string;
  textMuted: string;
  textFaint: string;
  background: string;
  surface: string;        // cards / chips on top of background
  surfaceMuted: string;   // subtle inner surfaces (icon backgrounds)
  border: string;
  font: string;
  buttonColor: string;
  onButton: string;
}

interface ThemeInput {
  primary_color?: string | null;
  text_color?: string | null;
  background_color?: string | null;
  button_color?: string | null;
  font_family?: string | null;
}

export function buildMenuTheme(r: ThemeInput): MenuTheme {
  const primary = r.primary_color || '#E29B5D';
  const text = r.text_color || '#3B2C24';
  const background = r.background_color || '#FDF5E6';
  const buttonColor = r.button_color || primary;
  const dark = isDark(background);
  return {
    primary,
    onPrimary: contrastOn(primary),
    text,
    textMuted: withAlpha(text, 0.65),
    textFaint: withAlpha(text, 0.4),
    background,
    // Light themes get a white surface; dark themes get a lighter tinted surface.
    surface: dark ? withAlpha('#ffffff', 0.06) : '#ffffff',
    surfaceMuted: dark ? withAlpha('#ffffff', 0.04) : withAlpha(text, 0.04),
    border: dark ? withAlpha('#ffffff', 0.08) : withAlpha(text, 0.08),
    font: r.font_family || 'Outfit',
    buttonColor,
    onButton: contrastOn(buttonColor),
  };
}