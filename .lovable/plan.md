# Plano: Retirada no local + Toggles de pagamento/entrega

## 1. Banco de dados (migration)

Adicionar colunas na tabela `restaurants`:

- `accepts_delivery` (boolean, default true) — aceita entrega
- `accepts_pickup` (boolean, default false) — aceita retirada no local
- `payment_methods` (jsonb, default `{"pix": true, "credit_card": true, "debit_card": true, "cash": true, "meal_voucher": false}`) — métodos de pagamento ativos

Para "Empadas da Eva", ativar `accepts_pickup = true` já no seed.

## 2. Checkout do cliente (`src/components/cart-drawer.tsx`)

- Se o restaurante aceitar ambos (entrega e retirada), exibir 2 botões no topo do checkout: **Entrega** / **Retirada**.
- Se aceitar só um, fixar nessa opção (sem mostrar seletor).
- Quando **Retirada** selecionada:
  - Ocultar campos de endereço (rua, número, bairro, complemento, referência, taxa de entrega).
  - Mostrar bloco com endereço do restaurante + horário de funcionamento + aviso "Retirar no local".
  - Zerar taxa de entrega no total.
- Seletor de pagamento passa a listar apenas os métodos ativos em `payment_methods`.
- Enviar `order_type` ("delivery" | "pickup") ao inserir o pedido e incluir no texto do WhatsApp.

## 3. Painel do dono do restaurante (`src/routes/editar.$token.tsx`)

Adicionar nova seção **"Entrega e Pagamento"** com:

- Switch **Aceitar entrega** (`accepts_delivery`)
- Switch **Aceitar retirada no local** (`accepts_pickup`)
- Grupo de switches **Formas de pagamento aceitas**:
  - PIX
  - Cartão de crédito
  - Cartão de débito
  - Dinheiro
  - Vale-refeição

Validação: pelo menos uma forma de entrega e uma de pagamento devem estar ativas antes de salvar.

## 4. Detalhes técnicos

- Tipo TS gerado automaticamente após migration aprovada.
- `cart-drawer.tsx` já tem lógica de pickup no demo — vamos portar/adaptar para a versão real.
- Sem mudanças no fluxo de criação de pedido além de `order_type` e `payment_method` já existentes.

Sem alterações em RLS — colunas adicionadas a uma tabela já pública.
