## Objetivo
Deixar o cardápio rápido e o checkout instantâneo, eliminando travamentos e erros de conexão quando o cliente finaliza o pedido.

## Diagnóstico (o que está pesando hoje)

1. **Cardápio faz 5 consultas em sequência** ao abrir (`restaurante` → `categorias` → `produtos` → `grupos de opções` → `opções`). Cada uma é uma ida e volta separada ao banco — em rede lenta isso vira 2–4 segundos só para mostrar a tela.
2. **Faltam índices no banco** em `products(restaurant_id)` e `categories(restaurant_id)`. Toda consulta varre a tabela inteira; quanto mais restaurantes/produtos, mais lento fica para todo mundo.
3. **No checkout, o app espera salvar o perfil do cliente antes de abrir o WhatsApp.** Se a rede oscila, o botão "Enviar pedido" parece travado, o cliente clica de novo e gera pedido duplicado.
4. **Sem timeout nem nova tentativa** em `createOrder`: se a primeira chamada falha por conexão fraca, aparece só "Não conseguimos salvar o pedido" e o cliente desiste.
5. **Painel do dono recarrega pedidos a cada 6s** com uma consulta pesada (todos os pedidos + itens). Em horários de pico, isso sobrecarrega o banco e respinga na velocidade do cliente.
6. **Imagens dos produtos sem `loading="lazy"` / dimensões fixas**, então o navegador baixa todas de uma vez e trava a rolagem em celular fraco.

## Plano de ação

### 1. Acelerar o carregamento do cardápio (1 consulta em vez de 5)
- Criar a função `public_get_menu(_slug)` no banco que devolve, em **uma única resposta**, o restaurante + categorias + produtos + opções já agrupados.
- Adaptar `useRestaurant` / `useMenu` (`src/hooks/use-restaurant.ts`) para usar essa função. Resultado esperado: tempo de abertura do cardápio cai de ~5 chamadas para 1.
- Subir `staleTime` no React Query (cardápio muda pouco em poucos minutos) para evitar refetch desnecessário ao trocar de aba.

### 2. Índices no banco (ganho imediato e gratuito)
Adicionar via migration:
- `products (restaurant_id, is_available)`
- `categories (restaurant_id, status, display_order)`
- `orders (restaurant_id, status, created_at DESC)` para o painel do dono

### 3. Checkout instantâneo e à prova de conexão ruim
No `cart-drawer.tsx` / `lib/orders.ts`:
- **Disparar o WhatsApp assim que o pedido for criado**, sem esperar o "salvar perfil do cliente" (esse vira fire-and-forget em segundo plano).
- Adicionar **timeout de 8s + 1 nova tentativa automática** no `createOrder`. Mensagem de erro mais clara se mesmo assim falhar.
- **Travar o botão "Enviar pedido"** enquanto envia (com spinner) para impedir clique duplo e pedidos duplicados.
- Salvar o perfil do cliente localmente **antes** de chamar o servidor, então mesmo offline o próximo pedido já vem preenchido.

### 4. Reduzir carga do painel do dono (afeta todo mundo)
Em `src/components/owner/orders-screen.tsx`:
- Subir o polling de **6s para 15s**, e pausar quando a aba está em segundo plano (`document.hidden`).
- Buscar só os pedidos das últimas 24h por padrão (hoje busca os 200 mais recentes sempre).

### 5. Imagens mais leves
Nas listagens de produto (`$slug.index.tsx`):
- Adicionar `loading="lazy"`, `decoding="async"` e `width/height` em todas as imagens.
- Acrescentar `&w=400&q=70` nos URLs do Unsplash usados (eles aceitam transformação na URL) para baixar ~70% menos bytes.

### 6. Verificação final
- Rodar o linter do banco para garantir que as policies continuam corretas.
- Testar fluxo de checkout completo em rede lenta simulada (Playwright) e medir o tempo do clique "Enviar pedido" até o WhatsApp abrir — meta: < 1s mesmo com conexão fraca.

## O que NÃO vai mudar
- Visual, cores e fluxo de telas do cardápio e do checkout ficam idênticos.
- Nenhum pedido existente é afetado; só mudam consultas e índices.

Posso começar?
