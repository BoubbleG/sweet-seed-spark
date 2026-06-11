## Objetivo

Permitir que o dono cadastre um prato com 3 preços (P, M, G) — como no cardápio da Delícias da Taty. No menu público, o cliente escolhe o tamanho antes de adicionar ao carrinho, e o preço/nome muda conforme a escolha. Tudo flui no WhatsApp, no painel de pedidos e na impressão.

## Como o dono cadastra

Na ficha do produto (painel `/editar/{token}` → Cardápio → produto), abaixo do campo "Preço" atual, um bloco novo:

- Switch: **"Este prato tem tamanhos (P / M / G)"**
- Quando ligado, aparecem 3 campos: Preço P, Preço M, Preço G
- Quando desligado, fica o preço único como hoje
- Campo opcional **"Acompanhamentos / observação"** (texto livre, ex: "arroz, salada, farofa, batata palha") — aparece como nota no card do prato

Promoção fica desabilitada quando o prato tem tamanhos (pra não complicar — pode ser feature futura).

## Como o cliente vê

No card do produto no cardápio público:
- Em vez do preço único, mostra 3 pílulas: `P R$13` · `M R$16` · `G R$20`
- Cliente toca em uma pílula → ela fica selecionada
- Botão `+` adiciona ao carrinho com o tamanho escolhido
- Se o cliente não tocou em nenhuma, abre uma mini-folha pedindo pra escolher
- No carrinho, o nome aparece como **"Strogonoff de frango (M)"** com o preço do tamanho escolhido
- Se tiver texto de acompanhamento, aparece em cinza abaixo do nome no card

## Pedidos e impressão

- Cada item do pedido grava `size` (`P` / `M` / `G` ou null) e o preço efetivo
- WhatsApp e cupom impresso mostram o tamanho entre parênteses no nome
- Painel de pedidos do dono idem

## Mudanças técnicas

### Banco (migração)
- `products`: adicionar `has_sizes boolean default false`, `price_p numeric`, `price_m numeric`, `price_g numeric`, `sides_note text`
- `order_items`: adicionar `size text` (P/M/G ou null)

### Frontend
- `src/components/owner/product-sheet.tsx` — bloco de tamanhos + campo de acompanhamentos
- `src/routes/$slug.tsx` — pílulas P/M/G no card de produto; lógica de seleção; bloqueia adicionar sem tamanho
- `src/hooks/use-cart.ts` + `src/types/index.ts` — `CartItem` ganha `size?: 'P'|'M'|'G'`; produtos do mesmo id+size agrupam; ids diferentes ficam separados
- `src/components/cart-drawer.tsx` — exibe `(P/M/G)` no nome; envia no WhatsApp; persiste `size` no `createOrder`
- `src/lib/orders.ts` — propaga `size`
- `src/components/owner/order-card.tsx` e `order-receipt.tsx` — exibem `(P/M/G)` no nome
- Promo: ocultar UI de promo quando `has_sizes` está ligado; seção "Ofertas de hoje" ignora produtos com `has_sizes`

### Fora de escopo (não vou fazer agora)
- Não vou popular um restaurante demo "Delícias da Taty" — a feature serve pra qualquer cardápio, e o dono cadastra os pratos dele normalmente
- Promo em produtos com tamanhos (pode virar feature depois)
- Tamanhos customizáveis (ex: 300ml/500ml) — fica P/M/G fixo conforme você pediu
