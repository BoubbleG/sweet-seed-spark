## Erro
`column reference "id" is ambiguous` na RPC `public_create_order` — as colunas de saída `id`/`order_number` (do `RETURNS TABLE`) colidem com as colunas da tabela `orders` dentro do `RETURNING`.

## Correção
Migration nova que recria `public_create_order` com:
- Nomes de saída renomeados para `order_id` e `order_no` no `RETURNS TABLE`
- `RETURNING orders.id, orders.order_number INTO new_id, new_num` (sem ambiguidade)
- Mesmo `GRANT EXECUTE` para `anon, authenticated`

Frontend (`src/lib/orders.ts`): ler `row.order_id` em vez de `row.id` ao montar o retorno.
