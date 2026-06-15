## Objetivo

Refazer todas as 16 imagens do cardápio do **Mix Burger XIS** com prompts mais precisos e estilo visual consistente: **foto realista profissional de hamburgueria, fundo escuro de madeira rústica, iluminação quente lateral, top-down ou 45°**.

## Por que as atuais estão erradas

- Combos/X-burgers genéricos (não parecem hambúrguer artesanal de hamburgueria)
- Porções, molhos e bebidas com aparência fora de contexto (ex.: maionese parecendo sorvete)
- Estilo visual inconsistente entre itens

## O que vou fazer

1. **Gerar 16 novas imagens** com `imagegen--generate_image` (qualidade `standard` para fidelidade fotográfica), todas no mesmo estilo base:
   > *"professional food photography, dark rustic wooden table background, warm side lighting, shallow depth of field, hamburgueria artesanal style, appetizing, high detail"*

2. **Prompts específicos por item** (resumidos):

   **Combos** (3) — composição com vários itens no mesmo prato/tábua:
   - Combo Casal: 2 X-Bacon + batata frita + bolinhas de queijo + rodelas de cebola + 2 potinhos molho
   - Combo Solteiro: 1 X-Salada + batata frita + bolinhas de queijo + rodelas de cebola
   - Combo Mix: hambúrguer duplo grande + batata + acompanhamentos variados

   **Lanches/Xis** (4) — hambúrguer brasileiro típico (pão brioche, ingredientes visíveis em corte lateral 45°):
   - X-Tudo: pão, 2 carnes, queijo derretido, bacon, ovo, presunto, alface, tomate
   - X-Salada: pão, carne, queijo, alface, tomate, maionese
   - X-Bacon: pão, carne, queijo derretido, bacon crocante abundante
   - X-Egg: pão, carne, ovo com gema, queijo, bacon

   **Porções** (5):
   - Batata Frita: porção em cestinha de papel
   - Batata com Cheddar e Bacon: batata coberta com cheddar derretido e bacon
   - Bolinha de Queijo: bolinhas fritas douradas com queijo derretido
   - Coxinha: coxinhas brasileiras douradas
   - Rodelas de Cebola: onion rings empanados crocantes

   **Molhos** (2):
   - Maionese: potinho pequeno com maionese cremosa branca
   - Ketchup: potinho pequeno com ketchup vermelho

   **Bebidas** (2):
   - Refrigerante Lata: lata genérica de refrigerante gelada com gotas de condensação
   - Suco Natural: copo de vidro com suco de laranja natural e fatia de laranja

3. **Upload via `lovable-assets`** de cada imagem para o CDN.

4. **Atualizar `products.image_url`** no banco de dados para cada um dos 16 produtos com a nova URL.

## Detalhes técnicos

- Modelo: `imagegen--generate_image` com `model: "standard"` (fidelidade fotográfica)
- Dimensões: `1024x1024`
- Formato: `.jpg` (sem transparência)
- Update SQL único com `CASE WHEN slug = ... THEN ...` para todas as 16 linhas
- Logo e dados do restaurante permanecem inalterados

## Não vou alterar

- Logo, cores, nome, slug, descrição do restaurante
- Preços, descrições e nomes dos produtos
- Categorias
- Token de edição