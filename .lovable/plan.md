## Plano: Imagens completas do cardápio Skina do Lanche

Vou gerar **logo + banner + 1 imagem para cada produto** (≈85 imagens). Aviso franco: vai consumir bastante créditos de geração de imagem e leva alguns minutos rodando em paralelo.

### 1. Logo
- Recortar o quadrado dourado "Skina do Lanche - Restaurante & Pizzaria" do flyer enviado (`user-uploads://WhatsApp_Image_2026-06-15_at_22.48.19.jpeg`) com PIL.
- Salvar como `src/assets/skina/logo.png`, subir via `lovable-assets`.

### 2. Banner
- Gerar 1 banner horizontal (1920×640) estilo flyer: fundo preto + amarelo dourado, hambúrguer + pizza + refri, com a vibe do flyer original. Sem texto.
- Salvar como `src/assets/skina/banner.jpg`, subir via `lovable-assets`.

### 3. Produtos (≈85 imagens, todas fotorrealistas alta qualidade)
Estilo padrão para todas: **foto realista premium, fundo escuro de madeira/ardósia, iluminação quente, comida em primeiro plano, ângulo 45°, alto contraste — combina com a paleta preto+amarelo do restaurante**. 1024×1024, formato `.jpg`, tier `fast`.

Cada prompt é gerado a partir da descrição exata do banco — exemplo:
- "X-Tudo": "professional food photography, brazilian style burger with 2 beef patties, cheese, ham, egg, lettuce, tomato, sausage, calabresa sausage and bacon, soft sesame bun, dark wood background, warm cinematic lighting, 45° angle, high detail"
- "Pizza Portuguesa": "professional pizza photography top-down, mozzarella, ham, sliced egg, peas, corn, onion, tomato, black olives, oregano, on dark slate, warm lighting"
- Sucos: copo alto com o suco da fruta correspondente, fruta inteira ao lado, fundo escuro.
- Combos: composição agrupada (hambúrguer + batata + refri lata para Combo 1, etc.).
- Carne na chapa: prato individual vs travessa grande para diferenciar 1p / 2p.

Salvo cada imagem em `src/assets/skina/produtos/{slug}.jpg`, subo para o CDN com `lovable-assets`.

### 4. Atualização no banco
Após cada lote subido, rodo um `UPDATE public.products SET image_url = ... WHERE restaurant_id = (slug='skina-do-lanche') AND name = ...` para apontar cada produto à sua URL CDN. Mesmo para o restaurante (`logo_url`, `banner_url`).

### 5. Execução / paralelismo
- Gero as imagens em **lotes paralelos** (6-8 por vez) para não tomar horas.
- Cada lote: imagegen → lovable-assets upload → coleta URL.
- Ao final: 1 UPDATE em massa atualizando logo, banner e todos os 85 produtos.

### Fora do escopo
- Não mexo em código de UI, componentes, hooks ou outros restaurantes.
- Não gero variações alternativas — 1 imagem por item.
- Não toco em personalizações (adicionais/sabores) já criadas.

### Aviso
~85 imagens em tier `fast` é caro em créditos. Se quiser interromper depois das primeiras categorias e ver como ficou antes de seguir, é só pedir.
