## Objetivo
Garantir que tudo que o cliente personaliza (adicionais, "monte seu combo", "monte seu prato", misturas, observações) apareça em **todas as telas do pedido** — não só na mensagem do WhatsApp.

## Onde aparece hoje
- Mensagem do WhatsApp: já mostra `Observação: ...` mas em uma linha só, separada por ` · `.
- Carrinho (drawer): **não mostra** as escolhas, só nome + tamanho.
- Tela de revisão do checkout (demo-checkout): **não mostra** as escolhas, só `qtd× nome`.
- Card do pedido no painel do dono: já mostra inline (`· notes`).
- Cupom/recibo do dono: já mostra como "obs:".

## O que vai mudar

### 1. Carrinho (`src/components/cart-drawer.tsx`)
Abaixo do nome do item, renderizar `item.notes` quebrado em linhas (uma escolha por linha) com tipografia menor e cor suave, usando os tokens do tema. Se houver várias categorias (ex.: "Mix 1: Granola, Banana | Mix 2: Confete"), cada grupo vira uma linha.

### 2. Revisão do checkout (`src/components/demo-checkout.tsx`, linha ~549)
Mesmo tratamento: mostrar as personalizações logo abaixo do nome do item na lista de revisão, com indentação leve.

### 3. Formatação das notas (`src/components/product-builder-dialog.tsx`)
Trocar o separador atual ` · ` por `\n` ao montar `notes`, mantendo o padrão `Grupo: opção1, opção2`. Isso faz com que em qualquer lugar que renderize `notes` com `whitespace-pre-line` as linhas fiquem separadas — sem mudar a lógica de preço nem o formato dos grupos.

### 4. Mensagem do WhatsApp (`src/lib/utils.ts`)
Manter `Observação:` mas usar as quebras de linha vindas do `notes` (já fica naturalmente legível no WhatsApp).

### 5. Renderização com quebra de linha
Adicionar `whitespace-pre-line` nas áreas que mostram `item.notes` (carrinho, checkout, card do dono, recibo) para respeitar os `\n`.

## Fora de escopo
- Não muda banco de dados, RLS, preço, lógica de cálculo nem o `ProductBuilderDialog` em si.
- Não muda o fluxo de adicionar ao carrinho.
- Não toca no painel do dono além de adicionar `whitespace-pre-line` nas notas já exibidas.
