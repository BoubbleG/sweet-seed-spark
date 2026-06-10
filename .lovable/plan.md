## Sistema de Pedidos + Impressão Automática

### Observação importante sobre Bluetooth
Você escolheu **impressora Bluetooth no celular** + **impressão automática pelo navegador**. Essas duas coisas combinam de um jeito específico:

- **No PC (Chrome/Edge)**: o navegador imprime direto na impressora térmica USB do driver do sistema. Funciona 100% automático.
- **No celular Android**: navegador não fala com Bluetooth de impressora térmica direto. A solução real é o app **RawBT** (grátis, na Play Store) — ele vira a "impressora padrão" do Android e qualquer `window.print()` do Chrome vai pra impressora Bluetooth pareada. Eu deixo o painel pronto pra isso e escrevo as instruções de 3 passos pro dono dentro do próprio painel.
- **No iPhone**: não tem solução boa via navegador. Cai pro botão manual "Imprimir" + share sheet.

Tudo isso fica no mesmo painel, mesmo link.

---

### O que vou construir

**1. Banco de dados (1 migração)**
- Tabela `orders`: número do pedido (sequencial por restaurante), nome do cliente, telefone, endereço, forma de pagamento, troco, observações, subtotal, taxa de entrega, total, tipo (entrega/retirada), status (`novo` → `preparando` → `pronto` → `entregue` / `cancelado`), `created_at`, `printed_at`.
- Tabela `order_items`: vínculo com o pedido, nome do produto (snapshot), preço unitário (snapshot), quantidade, observações.
- Realtime habilitado em `orders` pra notificar o painel na hora.
- RLS aberta (mesmo modelo dos outros): token no link controla o acesso no front, igual já faz hoje.

**2. Salvar pedido no checkout (cardápio público `/$slug`)**
- No `cart-drawer.tsx`, antes de abrir o WhatsApp: gravar o pedido + itens no banco.
- O WhatsApp continua sendo enviado igual hoje (você pediu pra manter).
- Mensagem do WhatsApp passa a incluir o número do pedido (#0042) pra casar com o painel.

**3. Nova aba "Pedidos" no `/editar/{token}`**
Adiciono um 5º card grande na home do editor: **"Pedidos chegando"** com badge de quantos pedidos novos tem.

Dentro:
- Lista em tempo real (Supabase Realtime). Pedido novo entra no topo com **som de campainha** + **destaque vermelho piscando**.
- Cada pedido em card grande: número, hora, nome, total, itens resumidos, botão "Ver completo".
- Filtros por status em pílulas grandes (Novos / Preparando / Prontos / Hoje).
- Botões grandes pra mover status: **"Aceitar"** → **"Pronto"** → **"Entregue"**.
- Botão **"Imprimir novamente"** em cada pedido.

**4. Impressão automática**
- Toggle no topo do painel: **"Imprimir automático"** (on/off, salvo no `localStorage` do dispositivo).
- Quando ligado e chega pedido novo via Realtime: monta um cupom HTML otimizado pra 80mm (fonte monoespaçada, alto contraste, sem cores) e dispara `window.print()`.
- Marca `printed_at` no banco pra não imprimir duplicado se a aba reabrir.
- CSS `@media print` esconde o resto da página e mostra só o cupom.

**5. Cupom térmico (componente novo)**
Layout otimizado pra papel 80mm:
```text
========================
   NOME DO RESTAURANTE
========================
PEDIDO #0042
10/06/2026  20:35
------------------------
CLIENTE: João Silva
TEL: (11) 99999-9999
ENTREGA: Rua X, 123
------------------------
2x  X-Burger        30,00
    sem cebola
1x  Coca 2L         12,00
------------------------
Subtotal           42,00
Taxa entrega        5,00
TOTAL              47,00
------------------------
PAGAMENTO: Dinheiro
TROCO PARA: R$ 50,00
========================
```

**6. Card de instrução pro dono (dentro do painel)**
Bloco colapsável "Como configurar minha impressora?" com 3 abas curtas:
- **No PC**: 1. Instale o driver da sua impressora térmica. 2. Deixe esta aba aberta. 3. Ligue "Imprimir automático".
- **Celular Android (Bluetooth)**: 1. Baixe o app RawBT na Play Store. 2. Pareie sua impressora Bluetooth nele. 3. Volte aqui, deixe esta aba aberta e ligue "Imprimir automático".
- **iPhone**: Toque no botão "Imprimir" em cada pedido (automático não é suportado).

---

### Arquivos

**Migração**
- `supabase/migrations/<timestamp>_orders.sql` — tabelas `orders` + `order_items` com GRANTs, RLS, e sequência de número de pedido por restaurante.

**Edição**
- `src/components/cart-drawer.tsx` — salvar pedido no banco antes do WhatsApp.
- `src/routes/editar.$token.tsx` — adicionar card "Pedidos chegando" na home.
- `src/types/index.ts` — tipos `Order`, `OrderItem`.

**Novos**
- `src/components/owner/orders-screen.tsx` — painel de pedidos em tempo real.
- `src/components/owner/order-card.tsx` — card de pedido com ações de status.
- `src/components/owner/order-receipt.tsx` — cupom térmico 80mm com `@media print`.
- `src/components/owner/printer-help.tsx` — bloco de instruções PC/Android/iPhone.
- `src/lib/orders.ts` — helpers (criar pedido, próximo número, hook de realtime + auto-print).
- `src/assets/new-order.mp3` — som de notificação (ou usar Web Audio API com beep gerado).

### Fora de escopo
- Integração nativa com impressoras (ESC/POS via WebUSB) — fica pra v2 se você quiser depois.
- Notificação push quando a aba está fechada (precisa de service worker + permissão; podemos adicionar depois).
- `/admin` master e cardápio público (a parte de salvar pedido é a única mudança no checkout).

Posso seguir?