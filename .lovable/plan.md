## Objetivo

Adicionar um novo atalho **"Entrega e Pagamento"** na tela inicial do painel do dono (`/editar/:token`), abrindo uma tela dedicada com os toggles de:
- Aceitar entrega
- Aceitar retirada no local
- Taxa de entrega, pedido mínimo grátis e tempo médio
- Formas de pagamento (PIX, Crédito, Débito, Dinheiro, Vale-refeição)

Os mesmos toggles continuam disponíveis dentro de **"Meu restaurante"** (sem remoção), atendendo ao pedido de manter em ambos os lugares.

## Mudanças

### 1. `src/components/owner/delivery-payment-screen.tsx` (novo)
Tela nova reutilizando `SectionShell`, `SectionCard`, `StickySaveBar`, `Toggle` e `Field`. Salva apenas os campos relacionados:
`accepts_delivery`, `accepts_pickup`, `delivery_fee`, `min_order_for_free_delivery`, `average_delivery_time`, `payment_methods`.

Mesma validação já usada em `info-screen.tsx`:
- ao menos uma opção de entrega ativa (entrega OU retirada)
- ao menos uma forma de pagamento ativa

Invalida as queries `restaurant-by-token` e `restaurant` após salvar.

### 2. `src/components/owner/shared.tsx`
Exportar os helpers internos `Toggle` e `Field` de `info-screen.tsx` movendo-os para `shared.tsx` (ou re-exportando), para que a nova tela use os mesmos componentes sem duplicação. Atualizar `info-screen.tsx` para importar deles.

### 3. `src/routes/editar.$token.tsx`
- Adicionar `"delivery"` ao tipo `Screen`.
- Adicionar novo card na lista da home, posicionado logo após "Meu cardápio":
  - título: **"Entrega e Pagamento"**
  - descrição: "Ative entrega, retirada e formas de pagamento"
  - ícone: `Truck` (lucide-react)
  - cores: `bg-sky-100` / `text-sky-700`
- Roteamento: ao clicar, montar `<OwnerDeliveryPaymentScreen restaurant={restaurant} onBack={() => setScreen("home")} />`.

### 4. Nenhuma mudança em banco, RLS ou checkout
Reusa as colunas e a lógica já existentes. `cart-drawer.tsx` continua lendo `accepts_delivery`, `accepts_pickup` e `payment_methods` como hoje.
