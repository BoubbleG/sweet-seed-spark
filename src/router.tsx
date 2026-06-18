import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Query controla freshness; aumentamos o preload do router pra evitar refetch ao voltar à aba
    defaultPreloadStaleTime: 30_000,
  });

  return router;
};
