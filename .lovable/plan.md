
## Objetivo

Criar um novo restaurante **Isas Lanches e Variedades** no banco com cardápio completo extraído do panfleto enviado, com imagem realista em cada item (estilo foto de hamburgueria, fundo laranja/madeira combinando com a identidade visual).

## Identidade visual

- **Nome:** Isas Lanches e Variedades
- **Slug:** `isas-lanches`
- **Tema:** Laranja vibrante (cor primária `#F26A1F`), texto branco/escuro, fundo creme claro — combinando com o panfleto
- **WhatsApp:** (11) 95928-3650
- **Endereço:** Rua Santo Ivo, 272
- **Slogan/descrição:** "Lanches, hot dogs, pastéis e muito mais. Peça já!"
- **Logo:** vou gerar uma logo "isas lanches" laranja no estilo do panfleto

## Cardápio (21 itens, 4 categorias)

**Lanches (X) — 6 itens**
- X-Burguer — R$ 20,00 — pão, hambúrguer e mussarela
- X-Bacon — R$ 26,00 — pão, hambúrguer, bacon, mussarela e tomate
- X-Egg — R$ 27,00 — pão, hambúrguer, ovo, tomate e mussarela
- X-Egg Salada — R$ 28,00 — pão, hambúrguer, ovo, tomate, alface, mussarela, milho e presunto
- X-Salada — R$ 24,00 — pão, hambúrguer, alface, milho e mussarela
- X-Tudo — R$ 47,00 — pão, hambúrguer, bacon, frango, presunto, ovo, mussarela, alface, tomate, milho e batata palha

**Hot Dogs — 3 itens**
- Hot Dog Simples — R$ 15,00
- Hot Dog Completo — R$ 20,00
- Hot Dog à Moda da Casa — R$ 25,00

**Pastéis — 10 itens**
- Queijo, Pizza, Carne, Bauru, Frango, Calabresa — R$ 13,00 cada
- Carne com Queijo, Frango com Catupiry, Calabresa com Queijo — R$ 14,00 cada
- Especial da Casa — R$ 15,00

**Porções e Bebidas — 2 itens base**
- Porção de Batata Frita — R$ 18,00
- Refrigerante Lata — R$ 7,00

## Imagens (23 imagens novas)

Geradas com `imagegen--generate_image` (qualidade `standard`, 1024x1024, .jpg), estilo unificado:

> *"professional food photography, warm orange/wooden background, top-down or 45°, appetizing, brazilian street food style, high detail"*

- 1 logo "isas lanches e variedades" (laranja, fonte arredondada bold)
- 6 lanches (cada X com ingredientes visíveis em corte 45°)
- 3 hot dogs (simples, completo com purê/vinagrete/milho, moda da casa carregado)
- 10 pastéis (cada um com recheio aparente)
- 2 porção/bebida
- 1 banner do restaurante (composição com lanches, fundo laranja)

Total: **23 imagens via CDN (lovable-assets)**.

## Banco de dados

1. `INSERT` em `restaurants` com slug `isas-lanches`, cores, WhatsApp, endereço, logo_url, banner_url, edit_token gerado
2. `INSERT` em `categories` (4 categorias com display_order)
3. `INSERT` em `products` (21 produtos) com `image_url` apontando para o CDN

## Não vou alterar

- Restaurante Mix Burger XIS (permanece intacto)
- Estrutura de componentes/rotas (o cardápio já é renderizado por `/$slug`)
- Schema de tabelas

## URLs finais

- Cardápio público: `/isas-lanches`
- Painel de edição: `/editar/{token}`
