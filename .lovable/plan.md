# Plano — Novo restaurante "Batatas da Naylla"

Criar um novo restaurante completo no painel `/admin`, com cardápio, identidade visual e imagens IA pra cada produto. O estilo segue o mesmo padrão do Point do Gordinho (fundo escuro, foto grande, glass cards, fonte Outfit), mas com a paleta da marca Naylla (preto + vermelho + amarelo das imagens enviadas).

## 1. Restaurante (migração `restaurants`)

- **Slug:** `batatas-da-naylla` → URL pública: `/batatas-da-naylla`
- **Nome:** Batatas da Naylla
- **WhatsApp:** `879981191047` (você passou esse; vou usá-lo como principal)
- **Taxa de entrega:** R$ 4,00 (igual ao panfleto)
- **Paleta Naylla** (puxada das duas imagens):
  - `primary_color`: `#F5B400` (amarelo das marcas)
  - `secondary_color`: `#E11D2A` (vermelho dos botões de preço)
  - `button_color`: `#E11D2A`
  - `background_color`: `#0A0A0A` (preto)
  - `text_color`: `#FFFFFF`
- **Layout/visual:** `visual_style=modern`, `header_style=standard`, `card_style=glass`, `font_family=Outfit`, `border_radius=1.5rem` — idêntico ao Gordinho.
- **PIN:** vou deixar pra você definir no `/admin` depois (não dá pra criar sem você escolher os dígitos).

## 2. Cardápio — categorias + produtos

Vou juntar TUDO (texto que você mandou + imagens):

**Categorias (na ordem):**
1. **Lanches** — 12 itens (X-SALADA R$11, X-BACON R$14, X-CALABRESA R$14, HAMBÚRGUER R$10, HAMBÚRGUER COMPLETO R$15, X-EGG R$13, X-TUDO R$15, X-TUDO PREMIUM R$17, GIGANTE DA NAYLLA R$20 + BAURU R$6, BAURU X-BACON R$7, BAURU X-CALABRESA R$7 — esses 3 só apareciam nas imagens)
2. **Batatas (com cheddar + Catupiry)** — 6 itens das fotos (SIMPLES R$20, BATABRESA R$30, CALABACON R$40, BATABACON R$30, BATATA CARNE SECA R$35, BATATA DA CASA R$45)
3. **Salgados (kits)** — 6 itens (15un R$11, 25un R$17, 35un R$24, 45un R$31, 50un R$35, 100un R$70)
4. **Salgados (avulso)** — Pastel de Queijo R$5, Pastel de Frango R$5, Coxinha de Frango R$5, Coxinha de Frango c/ Cream Cheese R$10, Coxinha de Costela c/ Cream Cheese R$10
5. **Bebidas** — Coca 2L R$15, Fanta 2L R$15, Guaraná 2L R$15, Cajuína 2L R$15, Coca 1L R$10, Fanta 1L R$10, Guaraná 1L R$10, Cajuína 1L R$10, Coca 500ml R$6, Coca lata 350ml R$5, Sprite lata R$5, Fanta lata R$5, Guaraná lata R$5, Cajuína lata R$5

Total: ~40 produtos.

## 3. Imagens (IA, padrão Gordinho)

Vou gerar UMA imagem por produto via Lovable AI (`google/gemini-3.1-flash-image-preview`), salvar via `lovable-assets` no R2 (mesmo fluxo dos sucos do Nando Burger) e gravar o `image_url` direto na tabela `products`. Cada imagem é validada (HTTP 200 + tipo `image/*`) antes de gravar — se uma falhar, eu regenero ou deixo sem imagem ao invés de salvar URL quebrada.

Estilo das fotos: prato/lanche em fundo preto liso, iluminação warm overhead, queijo derretido visível quando cabe — bem parecido com o que já fiz pro Point do Gordinho.

Bebidas em lata/garrafa = produto isolado sobre fundo preto.

**Logo:** gero uma marca textual "Batatas da Naylla" no mesmo estilo vermelho+amarelo das imagens enviadas, já que você não anexou o logo final em arquivo separado.

## 4. Ordem de execução (build mode)

1. Migração SQL: cria o `restaurants` + 5 `categories` (sem produtos ainda; só pra ter os IDs).
2. Geração das ~40 imagens IA + upload em lote (paralelo em grupos pra não estourar rate).
3. `INSERT` único na `products` com nome/descrição/preço/categoria/image_url.
4. Verificação rápida: abrir `/batatas-da-naylla`, conferir que todos os produtos aparecem com imagem carregada (HTTP 200 nas URLs do R2).

## Custo / tempo

- ~40 imagens IA = uns 2–4 min de geração + créditos do Lovable AI.
- Nenhuma mudança em código de UI — só dados.

## O que NÃO faço sem você confirmar depois

- Definir o PIN do admin desse restaurante (você faz pelo painel `/admin`).
- Trocar a paleta se não gostar do amarelo+vermelho que extraí — me avise e ajusto.

Posso seguir?