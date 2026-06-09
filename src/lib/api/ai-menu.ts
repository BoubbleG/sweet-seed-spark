import { createServerFn } from "@tanstack/react-start";

interface ExtractionData {
  imageUrl: string;
}

export const extractMenuFromImage = createServerFn({ method: "POST" })
  .validator((data: ExtractionData) => data)
  .handler(async ({ data }) => {
    try {
      console.log("Extracting menu from image:", data.imageUrl);
      
      return {
        success: true,
        categories: [
          {
            name: "EXTRAÍDO POR IA",
            items: [
              {
                name: "Produto Exemplo IA",
                price: 29.90,
                description: "Este item foi identificado automaticamente pela nossa IA de visão."
              }
            ]
          }
        ]
      };
    } catch (error: any) {
      console.error("AI Extraction Error:", error);
      throw new Error(error.message);
    }
  });
