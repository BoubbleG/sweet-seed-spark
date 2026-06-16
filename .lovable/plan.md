# Regenerar imagens realistas — Point do Gordinho

## Objetivo
Substituir as 15 imagens atuais dos produtos por fotos hiper-realistas, fiéis a cada descrição, no estilo "montado por um humano de verdade" (estilo food photography profissional, não AI genérico).

## Produtos (15) e prompts derivados das descrições

**Hambúrgueres** (close-up, foco nos ingredientes visíveis no corte lateral, pão brioche dourado, luz natural, fundo escuro de madeira de hamburgueria):
1. Burguer Simples — brioche, 1 carne bovina, batata palha, cebola caramelizada, mussarela derretida, molho da casa
2. Smash Burguer — brioche, 1 carne smash, bacon, cebola caramelizada, mussarela, cheddar especial escorrendo
3. Duplo Cheddar — brioche, 2 carnes, bacon, cebola caramelizada, mussarela + cheddar derretido pelas laterais
4. X-Bacon — brioche, carne, bacon, ovo com gema mole, cebola caramelizada, mussarela, molho
5. X-Calabresa — brioche, carne, rodelas de calabresa, ovo, cebola caramelizada, mussarela, molho

**Batatinhas** (cestinha/tábua de madeira):
6. Batata Simples — batata frita dourada + ramekin de molho da casa
7. Batata Turbinada — batata frita coberta com cheddar derretido, bacon em cubos crocante, molho
8. Batata com Costela Desfiada — batata frita coberta com costela bovina desfiada suculenta

**Combos** (composição completa na bandeja):
9. Combo Burguer Mac — 1 burguer + lata de refrigerante 269ml
10. Combo Duplo Cheddar — duplo cheddar + porção batata frita + lata 350ml
11. Combo Família — 4 hambúrgueres, 20 mini coxinhas, porção batata cheddar+bacon, refri 1L

**Bebidas** (lata 350ml realista sobre balcão, gotas de condensação):
12. Coca-Cola 350ml
13. Coca-Cola Zero 350ml
14. Fanta Laranja 350ml
15. Kuat Guaraná 350ml

> Para latas de marca: gerar como "lata genérica de refrigerante cola/laranja/guaraná" sem logos protegidos, evitando rejeição por copyright.

## Execução

1. Para cada produto, gerar imagem com `imagegen--generate_image` (model `standard`, 1024x1024, .jpg) salvando em `/tmp/gordin/<slug>.jpg`. Prompt em inglês detalhado + "ultra realistic food photography, shot on DSLR 50mm, natural soft light, shallow depth of field, no text, no logos".
2. Fazer upload via `lovable-assets create` → gerar novo `.asset.json` em `src/assets/products/<slug>.jpg.asset.json`.
3. Migração SQL única: `UPDATE products SET image_url = '<nova_url>' WHERE id = '<id>'` para os 15 ids.
4. Os assets antigos ficam órfãos (não deletar — ainda referenciados em deploys anteriores).

## Observações

- Apenas o restaurante `point-do-gordinho` é afetado. O clone `modelo-point-do-gordinho` (demo) **não** será alterado — continua com as imagens antigas.
- 15 imagens em qualidade `standard` consome créditos significativos. Se preferir economizar, posso usar `fast` (qualidade menor mas ainda realista) ou `premium` só para os 5 hambúrgueres (carros-chefe) e `standard` no resto.

## Pergunta antes de implementar
Qual tier de qualidade? `fast` (mais barato), `standard` (recomendado, equilíbrio) ou `premium` (melhor, mais caro)?
