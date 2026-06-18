# Plano de otimização avançada (Lighthouse → 100)

Vou seguir os 3 passos que você pediu: **(1)** estruturar o prompt de auditoria, **(2)** transformar a resposta desse prompt em plano, **(3)** executar — esta resposta é o passo 2 (o plano). A execução acontece quando você aprovar.

## Passo 1 — Prompt de auditoria avançada (referência)

> "Audite o cardápio público (`/{slug}`) buscando Lighthouse Performance ≥ 95 em mobile 4G. Para cada uma das 6 métricas (LCP, FCP, CLS, INP, TBT, Speed Index) liste a causa provável no código atual e a correção mínima. Considere SSR/edge cache, payload de JS, fontes web, imagens (formato/dimensão/preload), CSS crítico, hidratação parcial, fila de rede e React Query. Não toque em visual nem em lógica de negócio."

## Passo 2 — Plano derivado

### Diagnóstico (o que ainda pesa)

1. **Cardápio renderiza vazio no SSR** — `useRestaurantMenu` só dispara no cliente, então o HTML inicial não tem conteúdo. LCP fica preso esperando JS + RPC.
2. **Imagens sem `width/height` e sem `fetchpriority`** — gera CLS e atrasa LCP da logo/banner. Imagens do Unsplash/R2 baixam em tamanho cheio (1–2 MB cada).
3. **Sem `preconnect` ao Supabase e ao CDN de imagens** — cada primeira requisição paga DNS + TLS (~300 ms em 4G).
4. **JS de checkout entra no bundle inicial** — `cart-drawer.tsx` (829 linhas) + `framer-motion` + 3 diálogos (`mix-selector`, `acai-builder`, `product-builder`) são carregados antes mesmo do cliente abrir o carrinho.
5. **Fonte web carrega 6 famílias** (`Outfit`, `Space Grotesk`, `Inter`, `Montserrat`, `Poppins`, `Playfair`, `Pacifico`) em todas as rotas — bloqueia render.
6. **RPC `public_get_menu` sem cache HTTP** — cada visita refaz a query, mesmo o cardápio mudando pouco.
7. **Imagens externas (Unsplash/R2) sem transformação** — sem `&w=`/`&q=` nem AVIF/WebP negociado.

### Ações

#### 1. SSR do cardápio (maior ganho de LCP)
- Adicionar `loader` em `src/routes/$slug.index.tsx` que chama o RPC `public_get_menu` via `queryClient.ensureQueryData`, e trocar `useRestaurantMenu` por `useSuspenseQuery` com a mesma `queryOptions`. HTML inicial passa a conter produtos → LCP cai de ~3 s para <1 s.
- Definir `errorComponent` e `notFoundComponent` na rota (obrigatório quando há loader).

#### 2. Preconnect + preload do LCP
Em `src/routes/__root.tsx` (`head().links`):
- `<link rel="preconnect" href="https://mrjkizqyrmljtlvusgta.supabase.co" crossorigin>`
- `<link rel="preconnect" href="https://images.unsplash.com" crossorigin>` e o domínio R2 usado pelos restaurantes.
- `<link rel="dns-prefetch">` como fallback.

Na rota `$slug.index.tsx`, derivar do loader o `logo_url`/`banner_url` e adicionar `<link rel="preload" as="image" href={...} fetchpriority="high">`.

#### 3. Imagens leves e estáveis
- Adicionar `width` e `height` em **todos** os `<img>` (logo, banner, cards) para zerar CLS.
- Helper `optimizeImageUrl(url, { w, q })` que injeta `?w=400&q=70&fm=webp` quando o host é Unsplash, e `?width=400&quality=70` quando é R2 (Cloudflare Images). Aplicar em cards de produto (w=400) e banner (w=1200).
- `fetchpriority="high"` só na logo/banner; demais ficam `loading="lazy"`.

#### 4. Code-splitting agressivo
- Carregar via `lazy()` + `<Suspense>`: `CartDrawer`, `MixSelectorDialog`, `AcaiBuilderDialog`, `ProductBuilderDialog`. Eles só montam quando o usuário interage, então saem do bundle inicial (~150 KB a menos de JS).
- Remover `framer-motion` dos componentes acima do dobro (substituir `motion.div` simples por classes utilitárias de animação CSS já existentes). Mantém visual idêntico.

#### 5. Fontes web
- Reduzir o `<link>` de fontes do `__root.tsx` para apenas as 2 famílias realmente usadas no projeto (vou auditar com `rg "font-(outfit|space|inter|montserrat|poppins|playfair|pacifico)"` antes). As demais saem.
- Acrescentar `&display=swap` (já está) e `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.

#### 6. Cache HTTP do RPC do cardápio
- Envolver a chamada `public_get_menu` num server route `/api/public/menu/$slug` que devolve o JSON com `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. O edge da Cloudflare passa a servir HIT em ~20 ms global. Cliente continua chamando via React Query (mesma chave).

#### 7. Higiene final
- `defaultPreloadStaleTime` no router para 30 s, evitando refetch ao voltar para a aba.
- Adicionar `<meta name="theme-color">` e `viewport` já está.
- Auditar com Lighthouse antes/depois e reportar números.

### Métricas-alvo (mobile, 4G simulado)
| Métrica | Hoje (estimado) | Meta |
|---|---|---|
| LCP | 3.0–4.0 s | < 1.5 s |
| TBT | 400 ms+ | < 150 ms |
| CLS | 0.15+ | < 0.05 |
| Performance | 60–75 | 95+ |

### O que NÃO muda
- Visual, cores, animações percebidas, fluxo de checkout, RLS, dados.
- Painel do dono e área admin ficam de fora desta passada (foco é o cardápio público, que é o que o Lighthouse mede).

## Passo 3 — Execução
Faço todas as alterações em uma única passada após sua aprovação, na ordem acima (SSR → preconnect → imagens → code-split → fontes → cache HTTP → verificação).

Posso começar?
