## Objetivo

Transformar a tela de pedido (`CartDrawer`) num fluxo **passo a passo**, bem grande, visual e à prova de erro — pensado pra quem não tem intimidade com celular.

## O que muda na experiência

Hoje o cliente abre o carrinho e vê tudo de uma vez: itens, nome, telefone, endereço, bairro, referência, pagamento, observações, totais e o botão verde lá no fim. É muita coisa rolando junto.

Passa a funcionar como **4 passos guiados**, um de cada vez, com botão grande "Continuar" no rodapé:

```text
[1 Itens] → [2 Seus dados] → [3 Entrega] → [4 Pagamento] → Enviar
```

- Indicador de progresso no topo (bolinhas numeradas 1·2·3·4, com a atual destacada).
- Botão "Voltar" grande à esquerda, "Continuar" verde à direita.
- Só o passo atual aparece na tela — sem rolar pra encontrar campo.
- Erros aparecem em vermelho **embaixo do campo**, com texto curto ("Falta o telefone").

## Detalhes de cada passo

**1 · Itens** — igual hoje (lista do que está no carrinho com + / − / lixeira), mas com tipografia maior e o cartão de tempo de entrega no topo.

**2 · Seus dados** — só **Nome** e **Telefone**. Campos com altura 56px, label grande acima, ícone à esquerda (👤 / 📱). Telefone com máscara `(11) 98765-4321` aplicada enquanto digita.

**3 · Entrega** — Endereço, Bairro e Referência. Mesma fórmula: campo gigante, ícone (📍), placeholder com exemplo real ("Rua das Flores, 123").

**4 · Pagamento** — substitui o `Select` por **4 cartões grandes** lado a lado (2x2 no mobile), cada um com ícone colorido e nome em negrito:

```text
┌──────────┐ ┌──────────┐
│   PIX    │ │ Dinheiro │
│   📱     │ │   💵     │
└──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│ Crédito  │ │  Débito  │
│   💳     │ │   💳     │
└──────────┘ └──────────┘
```

Clicou, fica com borda grossa na cor do restaurante e check ✓. Se escolher Dinheiro, abre logo abaixo o campo "Troco para quanto?" com botões rápidos `R$ 20 · R$ 50 · R$ 100 · Sem troco`.

Depois mostra o **resumo grande** (Subtotal / Taxa / **Total** em fonte enorme) e o botão único:

```text
[ ✓ Enviar pedido pelo WhatsApp ]
```

Altura 64px, verde WhatsApp, ícone à esquerda.

## Detalhes técnicos

Arquivo único alterado: `src/components/cart-drawer.tsx`.

- Novo estado `step: 1 | 2 | 3 | 4` (começa em 1).
- Validação por passo no "Continuar" (não deixa avançar com campo obrigatório vazio); validações finais permanecem no envio.
- Helper `formatPhone(value)` aplicado no `onChange` do telefone.
- Componente interno `PaymentCard` (botão grande com ícone Lucide: `Smartphone`, `Banknote`, `CreditCard`).
- Componente interno `Stepper` para o indicador de progresso.
- Botão de envio do WhatsApp e `createOrder` ficam como estão — só mudam de lugar (passo 4).
- Estado vazio (carrinho sem itens) continua igual.
- Tema (`buildMenuTheme`) continua dirigindo as cores, então cada restaurante mantém sua identidade.

Nenhuma mudança em banco, hooks, ou outras telas.
