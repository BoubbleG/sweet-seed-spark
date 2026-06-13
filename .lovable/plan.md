## Objetivo

Adicionar **"Empadas da Eva"** como um 4º modelo de demonstração no portfólio `/modelos`, reproduzindo o tema visual (vermelho vinho profundo + dourado, tipografia script elegante para títulos) e todos os 12 produtos do cardápio da imagem.

## Onde

- **Migration** — insere o restaurante + 4 categorias + 12 produtos no banco (mesmo padrão dos modelos existentes "point-do-gordinho", "delicias-da-taty", "cardapio-saudavel").
- **`src/routes/modelos.tsx`** — adicionar o card "Empadas da Eva" na grade do portfólio com `STYLE_META`.

## Tema visual (extraído da imagem)

- `background_color`: **#3D0A0A** (vermelho vinho profundo / bordô)
- `primary_color`: **#D4A24C** (dourado quente dos preços e detalhes)
- `button_color`: **#D4A24C** (dourado)
- `text_color`: **#F5E6C8** (creme suave para contraste)
- `font_family`: **Playfair Display** (serif elegante, mais próximo do script "Cardápio")
- `visual_style`: `premium`
- `card_style`: `elevated`
- `border_radius`: `1rem`

## Dados do cardápio

**Restaurante:**
- Nome: Empadas da Eva
- Slug: `empadas-da-eva`
- Tipo: Salgados Artesanais
- Descrição: "Sabor que encanta, qualidade que fideliza"
- WhatsApp: (71) 98743-5520
- Instagram: @empadasdaeva
- Status: active

**Categorias e produtos:**

| Categoria | Produto | Preço |
|---|---|---|
| Coxinhas | Frango | 7,99 |
| Coxinhas | Frango c/ Catupiry | 9,99 |
| Coxinhas | Costela | 11,99 |
| Coxinhas | Camarão | 11,99 |
| Empadas | Frango Cremoso | 7,99 |
| Empadas | Camarão | 8,99 |
| Mini Empadão | Frango Cremoso | 14,99 |
| Mini Empadão | Camarão | 19,99 |
| Batatas (porções 200g) | C/ Cheddar | 9,99 |
| Batatas (porções 200g) | Calabresa | 14,99 |

## Como ficará disponível

- Listado em `https://sweet-seed-spark.lovable.app/modelos` ao lado dos 3 modelos atuais.
- Preview interativo em `https://sweet-seed-spark.lovable.app/modelos/empadas-da-eva`.
- Também acessível no link público `/empadas-da-eva` (como qualquer restaurante real).
- Pedidos no preview continuam **simulados** (toast de demonstração, sem enviar pro WhatsApp).

## Fora de escopo

- Gerar imagens dos produtos (sem `image_url` — vão usar o placeholder padrão do template).
- Importar a logo da imagem como asset (a imagem foi enviada como referência de design, não como logo a embutir).
- Alterar o tema dos modelos já existentes.
