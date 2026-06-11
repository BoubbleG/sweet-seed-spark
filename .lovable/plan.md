## Objetivo
No cardápio da **Delícias da Taty**, quando o cliente tocar em um tamanho (P, M ou G) de um prato caseiro, abrir um seletor para escolher as **misturas** que vão na marmita, respeitando o limite do tamanho:

- **P** → 1 mistura (só a base)
- **M** → até 2 misturas (pode repetir ou combinar com qualquer outro prato)
- **G** → até 3 misturas (qualquer combinação entre todos os pratos)

O preço continua sendo o do tamanho escolhido do prato-base (P=R$ X, M=R$ Y, G=R$ Z). Misturar não muda o valor.

Também: mostrar o texto **"Acompanha: arroz branco, salada crua ou cozida, farofa, batata palha e batata doce"** completo (sem cortar em 2 linhas), pra ficar visível no card.

## Como vai funcionar (fluxo)

1. Cliente toca em **M** no Strogonoff de frango.
2. Abre um modal: *"Escolha até 2 misturas"* com a lista de todos os pratos caseiros (Strogonoff de frango já vem pré-selecionado como 1ª mistura).
3. Pode adicionar outra mistura (ex: Strogonoff de carne) ou repetir a mesma. Botões +/− por prato, contador no topo (1/2, 2/2).
4. Confirma → vai pro carrinho como **"Strogonoff de frango (M) — Misturas: Strogonoff de frango, Strogonoff de carne"** pelo preço M do prato-base.
5. No tamanho **P**, como é só 1 mistura, o modal nem abre — adiciona direto igual hoje.

## Mudanças

### Frontend — `src/routes/$slug.tsx`
- Remover `line-clamp-2` do `sides_note` (mostrar texto inteiro, em itálico, abaixo da descrição).
- Nos botões P/M/G de pratos com `has_sizes`:
  - **P**: comportamento atual (adiciona direto).
  - **M/G**: abre um novo componente `MixSelectorDialog` em vez de adicionar direto.
- O diálogo recebe: prato-base, tamanho, lista de todos os produtos `has_sizes=true` da mesma categoria ("Pratos Caseiros"), e `maxMisturas` (2 ou 3).
- Ao confirmar, chama `addItem({ ...prod, price: priceForSize(prod, size) }, { size, notes: "Misturas: A, B, C" })`.

### Novo componente — `src/components/mix-selector-dialog.tsx`
- Modal mobile-first (sheet/dialog) com:
  - Título: nome do prato + tamanho.
  - Contador "X / N misturas".
  - Lista de pratos com botão +/− por item (permite repetir o mesmo prato várias vezes até atingir o limite).
  - Botão "Confirmar" desabilitado até ter ≥1 mistura; "Cancelar".
- A 1ª mistura já vem preenchida com o prato-base (cliente pode trocar se quiser).

### Carrinho — `src/components/cart-drawer.tsx` / `use-cart.ts`
- Sem mudança estrutural: as misturas vão no campo `notes` existente, já renderizado no carrinho e no pedido. O `lineId` continua por `produto+tamanho`; se o cliente montar 2 marmitas M do mesmo prato com misturas diferentes, a segunda sobrescreveria a `notes` — pra evitar isso, vou estender `lineId` para incluir um hash das misturas (ou simplesmente as misturas concatenadas) e tratar como linhas distintas.

## Fora de escopo
- Não muda preço por mistura.
- Não cria tabela nova; tudo cliente-side a partir do que já existe em `products`.
- Não mexe nos outros restaurantes (a lógica só aparece quando `has_sizes=true`, que hoje é só Delícias da Taty).
