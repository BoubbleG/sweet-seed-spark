## Objetivo

1. Permitir que o dono do restaurante **desfaça/refaça** alterações no editor (cardápio, visual e informações) e possa **restaurar uma versão anterior** mesmo depois de fechar a aba.
2. O **cliente** que pede no mesmo cardápio mais de uma vez não precisa redigitar nome, WhatsApp, endereço, bairro, referência e forma de pagamento — preenche sozinho.

---

## Parte 1 — Histórico de edições (editor do dono)

### Comportamento

- **Desfazer / Refazer rápidos** (botões no topo do editor + atalho Ctrl/Cmd+Z e Shift+Ctrl/Cmd+Z): até 50 ações da sessão atual. Cobre cardápio, visual e info.
- **Versões salvas** (aba "Histórico" no editor): a cada alteração relevante salva no banco um snapshot do restaurante + categorias + produtos. Lista mostra data/hora e um resumo ("Visual alterado", "Produto X criado", "Taxa de entrega alterada"). Botão **Restaurar esta versão** pede confirmação e reaplica tudo.
- Snapshots ficam guardados por 30 dias (limpeza automática) e no máx. 100 por restaurante.

### Banco (nova tabela)

- `restaurant_snapshots`: `restaurant_id`, `label` (resumo curto), `scope` (`menu` | `visual` | `info` | `full`), `snapshot` (JSON com restaurante + categorias + produtos), `created_at`.
- RLS: leitura/escrita liberada via `edit_token` (mesmo padrão das outras tabelas do editor).
- Função `restore_restaurant_snapshot(snapshot_id, edit_token)` que valida o token e reaplica o JSON em transação.

### UI

- Barra fixa no topo dos editores (`menu-screen`, `visual-screen`, `info-screen`, `delivery-payment-screen`, `promo-screen`) com botões **↶ Desfazer** / **↷ Refazer** e link **Histórico**.
- Tela "Histórico de alterações" com lista cronológica e botão restaurar por item.

---

## Parte 2 — Cliente recorrente

### Comportamento

- **No mesmo aparelho**: ao abrir o checkout, os campos já vêm preenchidos com o último pedido feito naquele cardápio (guardado em `localStorage` por `restaurant_id`).
- **Em qualquer aparelho (via WhatsApp)**: ao digitar o telefone no checkout, se houver perfil salvo para aquele WhatsApp + restaurante, aparece um aviso discreto "👋 Bem-vindo de volta, {nome}!" e os outros campos são preenchidos automaticamente (o cliente pode editar antes de enviar).
- Ao concluir o pedido, os dados são salvos/atualizados para a próxima vez.
- Pequeno link "Limpar meus dados" no rodapé do checkout para apagar localmente + remover do banco.

### Banco (nova tabela)

- `customer_profiles`: `restaurant_id`, `phone` (normalizado só dígitos), `name`, `address`, `neighborhood`, `reference`, `payment_method`, `last_order_at`. Unique em (`restaurant_id`, `phone`).
- RLS pública para `SELECT` e `UPSERT` filtrados por `restaurant_id` + `phone` (sem expor lista). Dono lê tudo pelo `edit_token` (visualizar lista de clientes pode vir depois — fora do escopo deste plano).

### UI

- `cart-drawer.tsx`: ao montar, carrega do `localStorage` e preenche. Ao digitar o WhatsApp completo, busca no banco; se achar, preenche o resto e mostra a saudação.
- Após `createOrder` bem-sucedido, faz `upsert` em `customer_profiles` e grava no `localStorage`.

---

## Detalhes técnicos

- **Undo/Redo**: hook `useEditHistory<T>(state, setState)` que mantém pilhas `past[]`/`future[]`. Snapshot só do "modelo" (restaurante/categorias/produtos), não da UI.
- **Snapshots**: salvos com debounce de 5s após a última edição, com label gerado a partir do diff (ex.: "Produto 'Pastel de Carne' criado"). Snapshot tipo `full` é tirado também ao restaurar (para poder desfazer a restauração).
- **Restaurar**: faz `DELETE` + `INSERT` em transação por `restore_restaurant_snapshot` (Postgres function `SECURITY DEFINER` validando `edit_token`).
- **Auto-fill cliente**: chamada de busca acontece em `onBlur` do telefone, com `phone.replace(/\D/g,'')` e `length >= 10`. Erro silencioso se não achar.
- Migração de tabela inclui `GRANT` apropriado (`anon` para `customer_profiles` SELECT/INSERT/UPDATE filtrado por RLS; `authenticated`/`service_role` padrão).

---

## Entregáveis

1. Migração SQL: `restaurant_snapshots`, `customer_profiles`, função `restore_restaurant_snapshot`, RLS + GRANTs.
2. `src/lib/history.ts` (snapshots + undo/redo) e `src/lib/customer-profile.ts` (busca/salva cliente).
3. Hook `useEditHistory` + barra de histórico reutilizável.
4. Integração nas telas: `menu-screen`, `visual-screen`, `info-screen`, `delivery-payment-screen`, `promo-screen`.
5. Auto-preenchimento + saudação no `cart-drawer.tsx`, com persistência ao concluir pedido.
