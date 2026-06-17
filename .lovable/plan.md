## Causa do erro

A migration de segurança recente removeu as policies amplas de `orders`/`order_items` e deixou só `INSERT` público. Mas:

1. **As tabelas `orders` e `order_items` ficaram sem nenhum GRANT** para `anon`/`authenticated`. Sem GRANT, o PostgREST bloqueia a requisição com "permission denied" antes mesmo de avaliar a RLS — por isso o cliente vê "Não conseguimos salvar o pedido".
2. O `.insert().select().single()` em `src/lib/orders.ts` exige policy de `SELECT` para devolver a linha criada — que não existe mais (e nem deve existir, para não vazar pedidos de outros).
3. O trigger `assign_order_number` faz `SELECT MAX(order_number) FROM orders` rodando como o usuário invocador (anon) — também quebra sem permissão de leitura.

## Solução

Criar uma RPC `SECURITY DEFINER` chamada `public_create_order` que recebe os dados do pedido + itens em JSON, insere tudo atomicamente e devolve só `{ id, order_number }`. O frontend deixa de fazer insert direto e passa a chamar essa RPC.

### Migração SQL
- `CREATE FUNCTION public.public_create_order(_restaurant_id uuid, _customer jsonb, _totals jsonb, _items jsonb) RETURNS TABLE(id uuid, order_number int) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public`
  - Valida que o restaurante existe e está ativo
  - INSERT em `orders` com campos vindos do JSON
  - INSERT em `order_items` em lote (`jsonb_array_elements`)
  - Retorna `id` + `order_number`
- `GRANT EXECUTE ON FUNCTION public.public_create_order(...) TO anon, authenticated`
- Manter as policies atuais (não reintroduzir SELECT público)

### Frontend (`src/lib/orders.ts`)
- Substituir o bloco `supabase.from("orders").insert(...).select().single()` + insert em `order_items` por uma única chamada `supabase.rpc("public_create_order", { _restaurant_id, _customer, _totals, _items })`.
- Tratar erro retornando `null` (mantém a mensagem atual no `cart-drawer.tsx`).
- Tipos: usar `as any` no payload por ora, já que `types.ts` é auto-gerado e a regen acontece pós-migration.

### Verificação
- Após aplicar: testar criação de um pedido no preview e olhar `orders` no banco.
- Confirmar que o número do pedido (`order_number`) continua sendo gerado corretamente pelo trigger.

## Arquivos
- **Nova migration** em `supabase/migrations/`
- **Editar** `src/lib/orders.ts` (só a função `createOrder`)
