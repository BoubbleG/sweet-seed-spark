# Plano: Cardápio Mix Burger XIS

Vou criar um **novo restaurante** no sistema com a logo enviada, todas as categorias e itens, com imagens geradas para cada produto.

## 1. Upload da logo
- Subir a imagem `WhatsApp_Image_2026-06-14_at_21.49.07.jpeg` como asset Lovable e usar como `logo_url` e `banner_url`.

## 2. Criar restaurante
Migration insert na tabela `restaurants`:
- `name`: Mix Burger XIS
- `slug`: mix-burger-xis
- `description`: "Sabor que vira vício!"
- `business_type`: hamburgueria
- `whatsapp`: placeholder (51999999999 — usuário edita depois pelo painel)
- Cores fortes do logo: `primary_color` #E63946 (vermelho), `button_color` #F4A300 (amarelo), `background_color` #0B0B0B, `text_color` #FFFFFF, `secondary_color` #FFD23F
- `accepts_delivery: true`, `accepts_pickup: true`
- `payment_methods`: pix, dinheiro, débito, crédito ativos

## 3. Categorias (display_order)
1. Combos
2. Lanches (Xis)
3. Porções
4. Molhos
5. Bebidas

## 4. Produtos
Cada produto recebe imagem gerada via `imagegen--generate_image` (fast, fundo escuro estilo do logo) e é inserido com nome, descrição, preço e `image_url` (asset URL).

**Combos:**
- Combo Casal — R$ 99,90 — "2x X-Bacon, 6 bolinhas de queijo, 5 rodelas de cebola, batata frita, maionese e ketchup. Sabor, diversão e companhia."
- Combo Solteiro — R$ 49,90 — "1 X-Salada, 6 bolinhas de queijo, 5 rodelas de cebola, batata frita, maionese e ketchup."
- Combo Mix Burger XIS — R$ 109,90 — "3x X-Bacon, 6 coxinhas, 8 rodelas de cebola, batata frita, maionese e ketchup."

**Lanches (Xis):** X-Tudo, X-Salada, X-Bacon, X-Egg — preço sugerido R$ 24,90 cada (usuário ajusta no painel) com a lista de ingredientes na descrição.

**Porções:** Batata Frita R$ 19,90 · Batata com Cheddar e Bacon R$ 32,90 · Bolinha de Queijo R$ 18,90 · Coxinha R$ 16,90 · Rodelas de Cebola R$ 17,90.

**Molhos:** Maionese R$ 3,00 · Ketchup R$ 3,00.

**Bebidas:** Refrigerante Lata R$ 7,00 · Suco Natural R$ 9,00.

## 5. Token de edição
Criar `restaurant_edit_tokens` (random uuid) para o dono acessar `/editar/:token` e ajustar WhatsApp e preços.

## 6. Entrega
Ao final mostro:
- Link público: `/mix-burger-xis`
- Link de edição: `/editar/:token`

## Observação
Como preços de lanches individuais não vieram na lista, uso valores sugeridos coerentes — facilmente editáveis no painel do dono. WhatsApp também é placeholder até o usuário informar.
