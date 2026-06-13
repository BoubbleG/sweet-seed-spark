import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/modelos")({
  head: () => ({
    meta: [
      { title: "Modelos de Cardápio — Veja exemplos e escolha o seu" },
      { name: "description", content: "Explore modelos de cardápio digital prontos: hamburgueria, comida caseira, saudável e mais. 100% interativo — apenas para demonstração." },
    ],
  }),
  component: () => <Outlet />,
});