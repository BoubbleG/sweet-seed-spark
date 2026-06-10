/**
 * Advanced color extractor that identifies prominent, secondary, and accent colors,
 * plus background and text color suggestions based on image analysis.
 */
export async function extractDetailedDesignFromImage(imageUrl: string): Promise<{
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  allColors: string[];
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Could not get canvas context"));

      const size = 200; // Higher resolution captures small accents (logos, prices)
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size).data;
      const colorCounts: { [key: string]: number } = {};

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue;

        // Coarser quantization so similar shades merge into one bucket
        const qr = Math.round(r / 24) * 24;
        const qg = Math.round(g / 24) * 24;
        const qb = Math.round(b / 24) * 24;

        const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([color]) => color);

      const hexToRgb = (hex: string) => ({
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      });

      const saturationOf = (hex: string) => {
        const { r, g, b } = hexToRgb(hex);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return max === 0 ? 0 : (max - min) / max;
      };

      const brightnessOf = (hex: string) => {
        const { r, g, b } = hexToRgb(hex);
        return Math.max(r, g, b) / 255;
      };

      // Vibrant = clearly saturated, not pure white/black. Generous bounds
      // so bright accent colors (orange, red, yellow) qualify.
      const isVibrant = (hex: string) => {
        const s = saturationOf(hex);
        const b = brightnessOf(hex);
        return s > 0.35 && b > 0.18 && b < 0.98;
      };

      // Deduplicate visually similar colors (Euclidean distance in RGB)
      const dedupe = (colors: string[], minDist = 60) => {
        const out: string[] = [];
        for (const c of colors) {
          const cr = hexToRgb(c);
          const tooClose = out.some(o => {
            const or = hexToRgb(o);
            const d = Math.hypot(cr.r - or.r, cr.g - or.g, cr.b - or.b);
            return d < minDist;
          });
          if (!tooClose) out.push(c);
        }
        return out;
      };

      // Rank vibrant colors by frequency × saturation so small but punchy
      // accents (orange logo on black bg) beat huge blocks of near-black.
      const vibrantRanked = Object.entries(colorCounts)
        .filter(([hex]) => isVibrant(hex))
        .map(([hex, count]) => ({ hex, score: count * (0.5 + saturationOf(hex)) }))
        .sort((a, b) => b.score - a.score)
        .map(c => c.hex);

      const vibrant = dedupe(vibrantRanked, 50);
      const allDeduped = dedupe([...vibrant, ...sortedColors], 40).slice(0, 10);

      const primary = vibrant[0] || sortedColors.find(c => saturationOf(c) > 0.15) || sortedColors[0] || "#7c3aed";
      const secondary = vibrant[1] || vibrant[0] || sortedColors[1] || primary;
      const accent = vibrant[2] || vibrant[1] || sortedColors[2] || secondary;
      
      // Determine background (usually the most frequent color if it's very light/dark)
      const background = sortedColors.find(hex => {
        const { r, g, b } = hexToRgb(hex);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 230 || brightness < 25;
      }) || "#ffffff";

      // Text should contrast with background
      const { r: bgR, g: bgG, b: bgB } = hexToRgb(background);
      const bgBrightness = (bgR * 299 + bgG * 587 + bgB * 114) / 1000;
      const text = bgBrightness > 128 ? "#1f2937" : "#f9fafb";

      resolve({
        primary,
        secondary,
        accent,
        background,
        text,
        allColors: allDeduped,
      });
    };

    img.onerror = () => reject(new Error("Failed to load image"));
  });
}
