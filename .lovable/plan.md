# Demonstração 100% Interativa — Fluxo de Pedido Completo

Transformar o botão **"Ver Demonstração"** em uma jornada de checkout simulada de ponta a ponta, com visual premium e desenhada **mobile-first** (cards grandes, botões com área de toque generosa, tipografia legível, scroll vertical confortável).

## Como vai funcionar

Ao clicar em "Ver Demonstração", abre um **modal fullscreen no mobile** (drawer lateral no desktop) que simula a experiência real de um cliente do "Bistro Master", em **5 passos numerados** com barra de progresso no topo:

```text
┌─────────────────────────────┐
│  ● ─ ○ ─ ○ ─ ○ ─ ○   Passo 1/5 │
├─────────────────────────────┤
│                             │
│      Conteúdo do passo      │
│                             │
├─────────────────────────────┤
│  [ Voltar ]   [ Continuar → ]│
└─────────────────────────────┘
```

### Passo 1 — Cardápio + Carrinho
- Reaproveita o cardápio interativo que já existe (categorias, fotos, +/- quantidade).
- Botão "Continuar" só ativa quando há ≥ 1 item.

### Passo 2 — Order Bumps (Aumente seu pedido)
- Tela visualmente rica com 3-4 sugestões em cards horizontais (batata frita, refrigerante, sobremesa, molho extra).
- Cada card tem foto, nome, preço com desconto ("De R$ 18 por **R$ 12**"), badge "Oferta exclusiva" e botão grande de toggle "Adicionar" / "Adicionado ✓".
- Animação de pulse no preço para chamar atenção.

### Passo 3 — Endereço de Entrega
- Cards de seleção de tipo: **Entrega** ou **Retirar no local** (toggle grande).
- Se "Entrega": formulário com CEP (autocomplete fake), Rua, Número, Complemento, Bairro, Referência.
- Validação client-side com Zod (campos obrigatórios, CEP no formato 00000-000).
- Inputs grandes (h-14), labels claros, mensagens de erro inline.

### Passo 4 — Forma de Pagamento
- Lista de opções como cards grandes selecionáveis com ícone colorido:
  - **PIX** (com badge "5% OFF" e QR code fake gerado quando selecionado)
  - **Cartão de Crédito** (campos: número, validade, CVV, nome — formatação automática)
  - **Cartão de Débito** (mesma estrutura)
  - **Dinheiro** (campo "Troco para quanto?")
- Resumo expansível do pedido sempre visível no topo (subtotal, entrega, desconto, total).

### Passo 5 — Revisão e Envio
- Resumo final bonito com todos os dados (itens, endereço, pagamento, total destacado em verde).
- Botão principal grande: **"Enviar Pedido no WhatsApp"** (com ícone WhatsApp, gradient verde, shadow).
- Ao clicar: animação de envio (loading 1.5s) → tela de sucesso com ✓ animado, número fake do pedido (#1247), tempo estimado e CTA "Criar meu cardápio assim".

## Design mobile-first

- Modal ocupa **100vh** no mobile, drawer de 480px no desktop.
- Footer fixo sticky com os botões **Voltar / Continuar** sempre acessíveis com o polegar.
- Cards e botões com `min-h-14` (área de toque ≥ 56px conforme WCAG).
- Tipografia escalada: títulos `text-2xl` no mobile, `text-3xl` no desktop.
- Espaçamento generoso entre seções (gap-6).
- Cores: verde esmeralda (sucesso/CTA), zinc escuro (texto), branco (cards), com toques de primary.
- Microinterações: scale no toque, transição suave entre passos (slide horizontal), checkmark animado nas seleções.

## Detalhes técnicos

- Tudo dentro de um novo componente `DemoCheckoutFlow` em `src/routes/index.tsx` (ou extraído para `src/components/demo-checkout.tsx` se ficar > 400 linhas).
- Estado gerenciado com `useState` + `useReducer` para o pedido completo (`{ items, bumps, address, payment, step }`).
- Usa o `Dialog` do shadcn com classes customizadas (`max-w-full h-screen sm:h-auto sm:max-w-md`) ou o `Drawer` da vaul para o feel nativo mobile.
- Validação com `zod` (já disponível) + `react-hook-form` se já instalado, senão validação manual leve.
- Sem chamadas reais a APIs — 100% simulação client-side.
- Mantém o cardápio interativo atual como Passo 1 (sem perder o que já foi construído).

## O que não muda
- Resto da landing (hero, features, portfólio, footer) permanece igual.
- Nenhuma mudança no backend.
