
# Plano: Restaurante "André Bebidas"

Criar um novo restaurante de depósito de bebidas + petiscos no sistema existente, junto com a logo enviada, imagens das bebidas e dos espetinhos.

## 1. Dados do restaurante

- **Nome**: André Bebidas
- **Slug**: `andre-bebidas`
- **Tipo**: depósito de bebidas / petiscos
- **WhatsApp**: (83) 8838-8430
- **Horário/observação**: "Atendemos sábado e domingo — tudo via delivery. Aos finais de semana trabalhamos com fava."
- **Pagamentos**: PIX, Dinheiro, Cartão Débito, Cartão Crédito
- **Cores**: fundo preto, dourado (#D4AF37) como primária, branco quente como secundária — combinando com a logo
- **Estilo visual**: moderno, card glass, fonte elegante

## 2. Logo

Usar a imagem enviada `ChatGPT_Image_15_06_2026_01_33_49.png` como logo oficial (upload ao CDN via lovable-assets).

## 3. Categorias e produtos

### Cervejas (lata 350ml) — preços estimados, ajustáveis depois
- Skol — R$ 4,50
- Brahma — R$ 4,50
- Schin — R$ 4,00
- Budweiser — R$ 6,00
- Heineken — R$ 7,50
- Devassa Puro Malte — R$ 5,00
- Corona Extra (long neck) — R$ 9,00

### Destilados
- Johnnie Walker Black Label 1L — R$ 220,00
- Gin Tanqueray London Dry 750ml — R$ 150,00

### Espetinhos (R$ 9,00 cada — do cardápio enviado)
Carne, Cupim, Carne de Charque, Carne Moída, Carne de Sol com Queijo, Carne com Bacon, Carneiro, Camarão, Coração, Frango com Bacon, Frango, Ovo com Bacon, Linguiça, Salsichão, Pão de Alho, Queijo Coalho, Romeu e Julieta, Moela, Fígado. (19 itens)

### Petiscos de fim de semana
- Fava (porção) — R$ 25,00 (preço a confirmar)

## 4. Geração de imagens (estilo: foto realista, fundo escuro, iluminação dourada/quente, combinando com a logo)

- 1 logo (upload da imagem enviada)
- 1 banner (composição com garrafas e brasas)
- 7 cervejas (foto de cada garrafa/lata com o rótulo correto, em fundo escuro)
- 2 destilados (Johnnie Walker, Tanqueray)
- 19 espetinhos (cada espetinho grelhado, fundo de madeira escura com brasas)
- 1 porção de fava

**Total: ~31 imagens** geradas em qualidade standard 1024x1024.

## 5. Banco de dados

- INSERT em `restaurants` (1 linha)
- INSERT em `categories` (4: Cervejas, Destilados, Espetinhos, Petiscos)
- INSERT em `products` (29 itens com `image_url` apontando para o CDN)
- Gerar `edit_token` para o painel do dono

## 6. Entrega

Ao final, fornecer:
- Link público do cardápio: `/andre-bebidas`
- Link do painel do dono com edit token

## Observações / suposições

- **Preços das bebidas e da fava são estimativas** — o dono pode ajustar facilmente no painel do dono depois.
- Considerei só lata 350ml para as cervejas. Se quiser long neck/600ml/1L também, é só me avisar.
- Os itens Corona/Johnnie Walker/Tanqueray/Devassa aparecem na logo então incluí no catálogo.
