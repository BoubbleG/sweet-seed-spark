## Novo cardápio: Nandoburg — Hamburgueria Artesanal

### 1. Restaurante
- **Slug:** `nandoburg`
- **Nome:** Nandoburg
- **Tipo:** Hamburgueria Artesanal
- **WhatsApp:** 98 97021-9483
- **Endereço:** Av. Tancredo Neves, Nº 52
- **Logo:** upload do PNG enviado para Lovable Assets, depois referenciado em `restaurants.logo_url`
- **Tema (cores do flyer):**
  - `primary_color` (fundo) → amarelo `#FFB800`
  - `secondary_color` → preto `#0A0A0A`
  - `button_color` → preto `#0A0A0A`
  - `background_color` → branco neve / amarelo claro
  - `text_color` → preto
  - `font_family` → fonte display "bold/condensada" (Anton/Bebas) já disponível
  - frase rodapé: "Não somos os melhores, nós somos diferentes"

### 2. Categorias
- **Hambúrgueres** (display_order 1)
- **Bebidas** (display_order 2)

### 3. Produtos (extraídos do flyer)

**Hambúrgueres**
| Nome | Preço | Descrição |
|---|---|---|
| Esmesh | R$ 12,00 | Pão, carne, queijo, presunto, molho |
| Tradicional | R$ 16,00 | Pão, carne, ovo, queijo, presunto, tomate, alface, maionese caseira |
| X-Bacon | R$ 20,00 | Pão, 1 carne, ovo, bacon, queijo, presunto, tomate, alface, molho |
| X-Calabresa | R$ 20,00 | Pão, 1 carne, calabresa, ovo, queijo, presunto, tomate, alface, molho |
| X-Tudo | R$ 24,00 | Pão, 1 carne, ovo, bacon, calabresa, queijo, presunto, tomate, alface, molho |
| X-Duplo | R$ 28,00 | Pão, 2 carnes, ovo, queijo, presunto, tomate, alface, molho |
| X-Triplo | R$ 34,00 | Pão, 3 carnes, ovo, bacon, calabresa, queijo, presunto, tomate, alface, molho |
| X-Da Casa | R$ 38,00 | Pão, 4 carnes, 2 ovos, bacon, queijo, presunto, tomate, alface, maionese caseira e cheddar |
| Especial | R$ 42,00 | Pão, 5 carnes, 3 ovos, calabresa, queijo, presunto, alface, tomate, molho |
| Nandoburg | R$ 50,00 | Pão, 6 carnes, 4 ovos, calabresa, bacon, tomate, molho verde e cheddar |

**Bebidas**
| Nome | Preço |
|---|---|
| Suco | R$ 5,00 |
| Refrigerante 1L | R$ 10,00 |
| Lata 350ml | R$ 5,00 |

### 4. Imagens
- Cada produto recebe uma URL pública do Unsplash escolhida de acordo com o tipo (hambúrguer simples, duplo, com bacon, calabresa, etc.).
- **Antes** de gravar no banco, faço `HEAD` em todas as URLs candidatas — só as que retornarem HTTP 200 entram no insert. Se alguma falhar, substituo por outra e re-testo.
- Validação final: query no banco listando produtos onde `image_url IS NULL` (deve dar zero) + HEAD em todas as URLs aplicadas.

### 5. Execução
1. Migration: inserir `restaurants`, `categories`, `products` (todos GRANTs públicos já existentes).
2. Upload do logo via `lovable-assets` e gravar URL CDN em `restaurants.logo_url`.
3. Após cargas, abrir `/nandoburg` no preview para conferir.

### Arquivos / mudanças
- 1 migration de dados (insert do restaurante + categorias + produtos)
- 1 pointer `.asset.json` para a logo
- Nenhuma alteração de código frontend (o template do cardápio público já lida com tudo via `slug`)
