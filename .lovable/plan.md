## Plano: Cardápio "Skina do Lanche"

Vou criar o restaurante completo no banco via migration de seed (igual aos outros restaurantes do projeto), com 11 categorias e todos os itens informados.

### 1. Restaurante
- **Slug:** `skina-do-lanche`
- **Nome:** Skina do Lanche — Restaurante & Pizzaria
- **WhatsApp:** 5592984251529
- **Tipo:** lanchonete/pizzaria
- **Cores (do flyer preto + amarelo dourado):**
  - `background_color`: preto `#0a0a0a`
  - `primary_color` / `button_color`: amarelo dourado `#f5b800`
  - `text_color`: branco `#fafafa`
  - `secondary_color`: amarelo mais claro
- **Descrição:** "Este estabelecimento deu certo porque existem dois donos: DEUS e Eu."
- `delivery_fee`: 0 (você configura depois)
- `accepts_delivery: true`, `accepts_pickup: true`
- Instagram: `@skinadolancheepizzaria`

### 2. Categorias (11)
1. Sanduíches Tradicionais
2. Sanduíches Premium
3. Hot Dog
4. Fritas e Porções
5. Sopa
6. Carne na Chapa
7. Pizzas
8. Combos
9. Sucos 500ml
10. Sucos Jarra 1L
11. Bebidas Cremosas e Frutas

### 3. Produtos
Todos os itens da lista que você passou, com nome, descrição e preço únicos (pizzas como tamanho único conforme escolhido).

Carne na chapa: cada prato vira **2 produtos** (1 pessoa / 2 pessoas) com sufixo no nome, ex.: "Contra Filé (1 pessoa)" R$ 28 e "Contra Filé (2 pessoas)" R$ 45.

### 4. Personalizações (option groups)
Vou já configurar usando o sistema `product_option_groups` + `product_options` que existe:

**a) Adicionais nos sanduíches** (todos os X- das categorias 1 e 2):
- Grupo "Adicionais" — opcional, max 6, modo `per_option`
- Opções: Bacon +R$ 4, Ovo +R$ 2, Queijo extra +R$ 3, Calabresa +R$ 4, Catupiry +R$ 4, Batata palha +R$ 2

**b) Sabor do Milkshake** (300ml e 500ml):
- Grupo "Sabor" — obrigatório (min=1, max=1), modo `free`
- Opções: Chocolate, Morango, Ovomaltine, Ninho, Baunilha

**c) Sabor da Vitaminada** (500ml e 1L, não a mista):
- Grupo "Frutas" — obrigatório, min=1, max=3, modo `free`
- Opções: Banana, Maçã, Mamão, Aveia, Granola

### 5. Imagens
Por padrão, **sem imagens** (campo `image_url` vazio) — os cards mostram só nome/preço. Se quiser, depois posso gerar imagens com IA para itens específicos.

### Como entrego
1. Uma migration SQL única que: insere restaurant → categorias → produtos → option_groups → options, tudo conectado por IDs determinísticos (`gen_random_uuid` capturados em CTEs/variáveis).
2. Após rodar, o cardápio aparece em `/skina-do-lanche` e o painel em `/skina-do-lanche/admin` (PIN você define em `/admin`).

### Fora do escopo
- Não mexo em nenhum outro restaurante.
- Não toco em RLS, código de UI, hooks ou componentes — o sistema já suporta tudo isso.
- Não configuro taxa de entrega/bairros (você faz no painel).
