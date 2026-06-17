## Imagens faltantes (53)

- **Carne na Chapa** (3): Filé de Frango 2p, Mistão 1p, Mistão 2p
- **Pizzas** (16): todas
- **Combos** (10): Combo 1 a Combo 10
- **Sucos 500ml** (8): todos os sabores
- **Sucos Jarra 1L** (8): todos os sabores
- **Bebidas Cremosas e Frutas** (7): Milkshake 300/500, Salada de Frutas 300/500, Vitaminada 500/1L/Mista

## Estilo (mantém o já gerado)
Foto realista premium, fundo escuro de ardósia/madeira, luz quente, 1024×1024, modelo `google/gemini-2.5-flash-image`.
- Pizzas: top-down, pizza inteira em forma redonda, ingredientes visíveis na descrição de cada sabor.
- Carnes na chapa: vista 45°, chapa de ferro quente, 1p = porção individual / 2p = porção dupla maior com 2 pratos.
- Combos: agrupamento (lanche + acompanhamento + bebida conforme descrição do combo no banco).
- Sucos 500ml: copo alto com fruta ao lado. Jarra 1L: jarra de vidro + 2 copos + fruta. Cor/polpa real de cada sabor.
- Milkshake: copo alto com chantilly. Salada de frutas: taça com frutas variadas. Vitaminada: copo com vitamina cremosa.

## Execução
1. Buscar descrições reais dos 53 produtos no banco para prompts precisos.
2. Gerar em lotes paralelos de ~6 chamadas via AI Gateway (mesmo script anterior), salvar como `src/assets/skina/produtos/{slug}.jpg` e fazer upload para CDN.
3. `UPDATE products SET image_url=... WHERE id=...` para cada produto.
4. Verificar no fim que todos os 83 produtos têm `image_url`.

Se houver rate limit, retomo automaticamente em lotes menores até completar.
