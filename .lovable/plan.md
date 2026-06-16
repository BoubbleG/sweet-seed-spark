## Restaurar o Point do Gordinho

Olhei o histórico e confirmei: o cardápio original tinha **4 categorias** e **15 produtos**, mas hoje só restam **3 categorias** corretas + 1 categoria estranha ("adicionais") e **apenas 1 produto** ("Misto R$9", que nunca existiu no original).

Os dados do restaurante em si (nome, logo, banner, cores preto/laranja, WhatsApp, endereço) **continuam intactos** — só o cardápio foi apagado.

### O que vou restaurar

**Categorias (na ordem original):**
1. Hambúrgueres
2. Combos
3. Batatinhas
4. Bebidas

→ A categoria extra "adicionais" e o produto "Misto" (que não faziam parte do original) serão removidos.

**Produtos (15 itens, exatamente como antes):**

*Hambúrgueres:*
- Burguer Simples — R$ 15,00
- Smash Burguer — R$ 17,00 ⭐
- X-Bacon — R$ 18,00
- X-Calabresa — R$ 18,00
- Duplo Cheddar — R$ 22,00 ⭐

*Combos:*
- Combo Duplo Cheddar — R$ 30,00 ⭐
- Combo Família — R$ 75,00 (4 hambúrgueres + 20 mini coxinhas + batata cheddar/bacon + refri 1L)
- Combo Burguer Mac — R$ 20,00 (Burguer Mac + refri 269ml)

*Batatinhas:*
- Batata Simples — R$ 10,00
- Batata Turbinada — R$ 15,00 ⭐ (cheddar + bacon)
- Batata com Costela Desfiada — R$ 20,00

*Bebidas:*
- Coca-Cola 350ml — R$ 6,00
- Coca-Cola Zero 350ml — R$ 6,00
- Fanta 350ml — R$ 6,00
- Kuat 350ml — R$ 6,00

⭐ = marcado como destaque (igual antes)

**Imagens:** vou gerar novamente as 15 fotos no mesmo estilo original (food photography, fundo de madeira escura, luz quente) já que as URLs antigas se perderam quando os produtos foram apagados.

### Detalhes técnicos
- Inserts diretos em `categories` e `products` (restaurant_id `72b11ac1-65c6-4bd4-a30c-10fd5ac904df`).
- Geração de 15 imagens via `imagegen` em paralelo, upload via `lovable-assets`, gravando `image_url` em cada produto.
- Delete da categoria "adicionais" e do produto "Misto".
- Nenhuma mudança em código de frontend ou em outros restaurantes.

Confirma que posso restaurar exatamente assim? Se quiser manter o "Misto R$9" que está lá hoje, me avisa antes de aprovar.