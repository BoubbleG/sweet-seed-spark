import { createFileRoute } from "@tanstack/react-router";
import { RestaurantPublicMenu } from "./$slug.index";

export const Route = createFileRoute("/modelo")({
  head: () => ({
    meta: [
      { title: "Cardápio Modelo - Veja como ficaria o seu" },
      { name: "description", content: "Preview de demonstração de como seu cardápio digital pode ficar." },
    ],
  }),
  component: () => <RestaurantPublicMenu slug="delicias-da-taty" isPreview />,
});