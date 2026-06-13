import { createFileRoute } from "@tanstack/react-router";
import { RestaurantPublicMenu } from "./$slug";

export const Route = createFileRoute("/modelos/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Modelo ${params.slug} — Cardápio de Demonstração` },
      { name: "description", content: "Veja como ficaria o seu cardápio digital. Modelo interativo de demonstração." },
    ],
  }),
  component: ModeloSlug,
});

function ModeloSlug() {
  const { slug } = Route.useParams();
  return <RestaurantPublicMenu slug={slug} isPreview />;
}