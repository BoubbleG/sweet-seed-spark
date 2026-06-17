---
name: Product option groups
description: Sistema genérico de personalização de produtos (adicionais, monte seu pedido, sabores, ponto da carne). Tabelas product_option_groups e product_options, componente ProductBuilderDialog, editor na sheet de produto do admin.
type: feature
---

## Estrutura

- public.product_option_groups: product_id, name, min_select, max_select, pricing_mode enum (free | per_option | most_expensive), display_order.
- public.product_options: group_id, name, extra_price, is_available, display_order.
- RLS aberta (mesmo padrão de products/categories).

## Codigo

- src/hooks/use-restaurant.ts -> useMenu traz option_groups (com options[]) anexado a cada produto.
- src/components/product-builder-dialog.tsx -> dialogo generico: radio/checkbox conforme max_select, valida min_select, calcula preco pelo pricing_mode.
- src/routes/\$slug.index.tsx -> o botao + abre o ProductBuilderDialog quando product.option_groups.length > 0.
- src/components/owner/product-sheet.tsx -> editor de grupos/opcoes no painel do restaurante.

## Como usar em novos cardapios

Para "monte seu pedido", "pizza meio-a-meio", "lanche com adicionais", "acai com cobertura": crie o produto base e insira os grupos/opcoes via migracao de seed (INSERT em product_option_groups + product_options) ou pelo admin. Nada de codigo por slug.
