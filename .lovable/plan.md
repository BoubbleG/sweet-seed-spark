# Sistema genérico de "Monte seu pedido" e adicionais

Hoje o personalizador de açaí está hardcoded pelo slug (`expresso-do-lanche-acai`) e por nome de categoria. Para que qualquer cardápio futuro já saia pronto com itens personalizáveis (combos, açaí, marmita, pizza meio-a-meio, lanche com adicionais, etc.), vamos transformar isso em uma estrutura de dados de primeira classe — uma vez no banco e no código, reutilizada para sempre.

## Conceito

Cada produto pode ter **grupos de opções** (option groups). Cada grupo tem:
- **nome** ("Mix 1", "Adicionais", "Ponto da carne", "Sabores")
- **min / max** de seleções (ex.: min 1 / max 1 = obrigatório escolher um; min 0 / max 3 = até 3 livres)
- **tipo de cobrança** (`free` — não soma no preço; `per_option` — cada opção tem preço extra; `most_expensive` — paga só o mais caro, padrão de meio-a-meio)
- **opções** com nome e preço extra opcional

Quando o cliente clica em **Adicionar** num produto que tem grupos, abre um **diálogo único e genérico** ("ProductBuilderDialog") que renderiza todos os grupos do produto, valida min/max, calcula o preço final e adiciona ao carrinho com observações estruturadas ("Mix 1: Granola, Banana · Adicionais: Bacon (+R$ 4)").

Produtos sem grupos continuam funcionando exatamente como hoje (botão + direto no carrinho).

## Banco (uma migração só)

Duas tabelas novas:

- `product_option_groups`
  - `product_id` (FK products, on delete cascade)
  - `name`, `display_order`
  - `min_select`, `max_select`
  - `pricing_mode` enum: `free` | `per_option` | `most_expensive`
- `product_options`
  - `group_id` (FK product_option_groups, on delete cascade)
  - `name`, `extra_price` (default 0), `display_order`, `is_available`

Ambas com GRANTs para `authenticated`/`anon`/`service_role` e RLS escopada por restaurante (segue o padrão das tabelas `products`/`categories` existentes). Sem alteração nas tabelas atuais — adicionar grupos é opcional.

## Código

- **`src/components/product-builder-dialog.tsx`** (novo, genérico): recebe um `product` e seus `groups`. Renderiza checkboxes / radios conforme min/max, mostra preço extra de cada opção, calcula o total em tempo real e bloqueia "Adicionar" enquanto os mínimos não forem atendidos. Substitui o `acai-builder-dialog.tsx` e o `mix-selector-dialog.tsx` ao longo do tempo (mantemos os atuais funcionando por compatibilidade, mas paramos de usar nos cardápios novos).
- **`src/hooks/use-restaurant.ts`**: o `useMenu` passa a trazer também `option_groups` + `options` por produto (um único join). Produtos sem grupos não mudam de forma.
- **`src/routes/$slug.index.tsx`**: o botão "+" do card de produto verifica `product.option_groups?.length > 0` → abre o `ProductBuilderDialog`; senão, continua adicionando direto. Remove a lógica hardcoded de açaí por slug.
- **Admin (`/{slug}/admin` → tela Cardápio → editar prato)**: nova aba "Personalizações" no `OwnerProductSheet` para criar/editar grupos e opções (nome, min/max, tipo de preço, opções com preço extra). Drag-and-drop opcional, mas reordenação com setas (igual já existe nas categorias).
- **Carrinho / WhatsApp**: o `notes` do item passa a ser gerado a partir das seleções estruturadas, mantendo o formato legível que já é enviado.

## Como isso ajuda nos próximos cardápios

Quando você pedir "cria um cardápio com pizza meio-a-meio", "lanche com adicionais", "marmita monte seu prato", "açaí com cobertura", a IA vai poder:
1. Criar o produto base com preço.
2. Inserir os grupos certos via migração de seed (`product_option_groups` + `product_options`) no mesmo passo que insere o produto.
3. Tudo funciona automaticamente no cardápio público — sem código novo, sem caso especial por slug.

## Fora do escopo agora

- Não migra o personalizador de açaí atual do Expresso ainda — depois que a estrutura nova estiver pronta e testada, fazemos uma migração de dados que cria os grupos para os produtos açaí existentes e remove o caminho hardcoded.
- Não mexe em pagamentos, entrega ou impressão (o item já entra no carrinho/pedido como qualquer outro).
- Sem upload de imagens por opção (só nome + preço extra) — fica para uma versão futura se precisar.
