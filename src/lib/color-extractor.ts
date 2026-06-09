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

      const size = 150; // Increased resolution for better detail
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

        // Group colors by quantization
        const qr = Math.round(r / 8) * 8;
        const qg = Math.round(g / 8) * 8;
        const qb = Math.round(b / 8) * 8;
        
        const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([color]) => color);

      // Utility to check if a color is "boring" (too close to white/black/gray)
      const isDynamic = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = (max - min) / (max || 1);
        const brightness = max / 255;
        return saturation > 0.15 && brightness > 0.1 && brightness < 0.9;
      };

      const dynamicColors = sortedColors.filter(isDynamic);
      
      const primary = dynamicColors[0] || sortedColors[0] || "#7c3aed";
      const secondary = dynamicColors[1] || sortedColors[1] || primary;
      const accent = dynamicColors[2] || sortedColors[2] || secondary;
      
      // Determine background (usually the most frequent color if it's very light/dark)
      const background = sortedColors.find(hex => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 230 || brightness < 25;
      }) || "#ffffff";

      // Text should contrast with background
      const bgR = parseInt(background.slice(1, 3), 16);
      const bgG = parseInt(background.slice(3, 5), 16);
      const bgB = parseInt(background.slice(5, 7), 16);
      const bgBrightness = (bgR * 299 + bgG * 587 + bgB * 114) / 1000;
      const text = bgBrightness > 128 ? "#1f2937" : "#f9fafb";

      resolve({
        primary,
        secondary,
        accent,
        background,
        text,
        allColors: sortedColors.slice(0, 10)
      });
    };

    img.onerror = () => reject(new Error("Failed to load image"));
  });
}
