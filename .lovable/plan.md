# Refinar Preview Público — Mobile-First + Auditoria Completa

Tornar o cardápio público (rota `/$slug` e `cart-drawer`) 100% mobile-first, com textos limpos, hierarquia consistente e espaçamentos harmônicos. Sem mudar a lógica nem o backend — só presentation.

## Diagnóstico atual

Problemas identificados no `src/routes/$slug.tsx` e `src/components/cart-drawer.tsx`:

**1. Conteúdo fake misturado com dados reais**
- Header fake "9:41" + bolinhas simulando status bar de iPhone — confunde o cliente final.
- "(312 avaliações)" e "4,8" hardcoded — passa credibilidade falsa.
- "Entrega • 30-45 min" fixo, mas a taxa real vem do banco.
- "R$ 5,99 • Grátis acima de R$ 60" fixo no cart-drawer (não usa `restaurant.delivery_fee`).
- Endereço/dados do cliente "João da Silva / Rua das Palmeiras" hardcoded no carrinho.
- Slider de banner com 3 bolinhas mas só 1 imagem.

**2. Textos cortados / overflow**
- Nome do restaurante com `break-words` mas sem `truncate` em telas <360px.
- "Entrega • 30-45 min" e linha da taxa empilham mal quando o nome do restaurante é longo.
- Descrição do produto com `line-clamp-3` mas card em modo lista tem altura fixa de 96px (h-24) — texto e botão se sobrepõem.
- Categorias em pill mostram só ícone genérico `Package` para tudo.

**3. Espaçamento e tipografia desarmônicos**
- `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]` espalhados sem sistema.
- `px-6` no header mas `px-8` no footer — bordas diferentes.
- `space-y-10` entre seções é exagerado no mobile; `gap-4` dentro dos cards é apertado.
- `pb-32` no body + footer fixo de 76px ≈ gap visual grande.
- Header sticky `pt-20` empurra demais o conteúdo.

**4. Tab navigation quebrada**
- "Início" e "Cardápio" não fazem nada (só mudam estado visual).
- "Mais" não tem destino.
- Só "Meu pedido" funciona (abre o drawer).

**5. Cart drawer**
- Em mobile usa `h-[100vh]` mas o `DialogContent` do shadcn vem com `max-w-lg` e margins — não fica fullscreen real no celular.
- Botão "Trash" tem `onClick` no ícone interno em vez do `Button` wrapper (não funciona em toda área de toque).
- Bloco "Endereço de entrega" e "Seus dados" são placeholders fake — devem ser substituídos pelo form real que o cliente preenche.
- Falta validação visual nos campos obrigatórios.

**6. Acessibilidade / responsividade**
- Botão `+` de adicionar produto tem 32px (`w-8 h-8`) — abaixo dos 44px recomendados (WCAG touch target).
- Header sticky com `backdrop-blur` em cima de status bar fake duplica visual.
- Sem `min-w-0` em vários containers flex → text overflow horizontal.

## Mudanças propostas

### A. `src/routes/$slug.tsx` — reescrever presentation mobile-first

1. **Remover totalmente o mock de status bar** (linhas 65–75). Header começa direto na logo.
2. **Header redesenhado**:
   - Grid `grid-cols-[auto_minmax(0,1fr)_auto]` com logo · info · favorito.
   - Logo: 64px no mobile, 80px no `sm:`.
   - Nome: `text-xl sm:text-2xl`, `truncate` em uma linha.
   - Linha de meta (delivery fee real + categoria descritiva): texto único com `truncate`, sem invenção de avaliações/tempo a menos que existam no schema.
   - Se `restaurant.delivery_fee == 0` → "Entrega grátis"; caso contrário formata via `formatCurrency`.
3. **Banner**: remover bolinhas de slider falso. Altura `h-40 sm:h-48`. Fallback elegante quando não há banner.
4. **Categorias**:
   - Pills horizontais com scroll-snap (`snap-x snap-mandatory`).
   - Clique faz scroll suave até a `<section>` correspondente (não filtra mais — mantém todas visíveis).
   - Indicador ativo via `IntersectionObserver` enquanto o usuário rola.
   - Ícones por categoria via campo `icon` se existir, senão fallback consistente.
5. **Busca**: input com `inputMode="search"`, `enterKeyHint="search"`, ícone à esquerda, altura 48px (h-12) mantida — mas sem o ring laranja hardcoded; usar `primary_color` via inline style.
6. **Cards de produto** (revisão completa):
   - Layout `flex gap-4` em coluna no mobile; imagem 88px (`w-22 h-22`) fixa à esquerda.
   - Title `text-base font-bold line-clamp-2 leading-snug`.
   - Description `text-xs text-zinc-500 line-clamp-2 leading-relaxed mt-1`.
   - Footer do card em linha separada: preço à esquerda (`text-base font-black`), botão `+` à direita (44×44px, `rounded-full`, cor primária do restaurante).
   - Badge "MAIS PEDIDO" se `is_best_seller` — posicionado como chip acima do título.
   - Sem altura fixa no card; deixa altura intrínseca.
   - `min-w-0` em todo container de texto.
7. **Sistema tipográfico consolidado**:
   - `text-[10px]` → uppercase labels apenas.
   - `text-xs` (12px) → metadados, descrições.
   - `text-sm` (14px) → corpo, badges.
   - `text-base` (16px) → títulos de produto e preço.
   - `text-lg` (18px) → títulos de seção.
   - `text-xl` / `text-2xl` → nome do restaurante.
   - Remover todos os `text-[8px]`, `text-[9px]`, `text-[11px]` órfãos.
8. **Espaçamento padronizado**:
   - Padding lateral global: `px-5` no mobile, `px-6` no `sm:`.
   - Entre seções: `space-y-8`.
   - Dentro de seção (header + grid): `space-y-4`.
   - Cards: `p-4` interno.
   - Bottom padding do body: `pb-24` (footer mede ~72px + margem).
9. **Footer tab bar**:
   - Manter visual, mas conectar comportamento:
     - "Início" → scroll para topo.
     - "Cardápio" → scroll para a primeira `<section>` de categoria.
     - "Meu pedido" → abre drawer (já funciona).
     - "Mais" → remover ou trocar por "Buscar" (foca o input). Decisão: remover, ficam 3 tabs centralizados.
   - Altura tab bar 64px com safe-area: `pb-[env(safe-area-inset-bottom)]`.
   - Botões com `min-h-12 min-w-12` para área de toque.
10. **Loading skeleton mobile-first**: troca o spinner por skeletons reais (header + 3 cards) na cor do tema.
11. **Acessibilidade**: `aria-label` em todos os botões ícone, `role="search"` no form de busca, `aria-current` na tab ativa.

### B. `src/components/cart-drawer.tsx` — fullscreen real no mobile + form de verdade

1. **Trocar `Dialog` por `Sheet` lateral** ou customizar o `DialogContent` com `data-[state=open]:slide-in-from-bottom` + `inset-0 max-w-full rounded-none sm:rounded-3xl sm:max-w-md sm:inset-auto sm:right-4`.
2. **Remover dados fake** ("João da Silva", "Rua das Palmeiras") — substituir por estado real do form `customer`.
3. **Form de checkout inline** dentro do scroll: nome, telefone (`inputMode="tel"`), endereço, bairro, referência, forma de pagamento (select), troco (condicional se "Dinheiro"), observação. Cada campo `h-12`, label uppercase 10px, erro inline em vermelho.
4. **Validação visual**: ao tocar "Enviar", marca campos vazios com `border-rose-400` em vez de `alert()`.
5. **Bloco de alerta de entrega**: usar `restaurant.delivery_fee` real e calcular dinâmico ("Grátis acima de R$X" só se houver regra no schema, senão remover).
6. **Trash button**: mover `onClick` para o `<Button>` wrapper, não no ícone interno.
7. **Footer fixo do drawer**: `pb-[env(safe-area-inset-bottom)]`, botão WhatsApp `h-14`.
8. **Quando carrinho vazio**: estado empty com ícone + CTA "Adicionar itens".

### C. Auditoria de textos (passada palavra por palavra)

Revisar e normalizar:
- Capitalização ("Meu pedido" vs "MEU PEDIDO" — escolher um por contexto).
- Acentuação (já está OK).
- Remover textos puramente decorativos ("Em destaque" duplicado em toda categoria — manter só nome da categoria).
- "Pedido enviado diretamente para o restaurante" → "Seu pedido vai direto pelo WhatsApp".
- Trocar emoji `🔒` por ícone Lucide `Lock` para coerência visual.

### D. Cores & tema

Garantir que TODO texto use `restaurant.text_color` (com fallback) e nenhum `text-zinc-*` hardcoded que conflite com fundo escuro. Verificar contraste mínimo AA com `primary_color` no botão de adicionar.

## Fora de escopo

- Sem mexer no `/admin`, `visual-manager`, `menu-manager`, backend, banco, RLS, edge functions.
- Sem mudar lógica de carrinho, hooks ou tipos.
- Sem trocar libs.

## Detalhes técnicos

Arquivos editados:
- `src/routes/$slug.tsx` (reescrita do JSX presentation, mesmas queries/hooks).
- `src/components/cart-drawer.tsx` (reestrutura visual + form real + fullscreen mobile).

Sem novos pacotes. Mantém TanStack Router, framer-motion, shadcn já instalados.

Validação:
- Testar viewports 320, 360, 390, 414 e 768px no preview.
- Verificar console sem warnings de hydration.
- Conferir que `useCart`, `useRestaurant`, `useMenu` continuam funcionando sem alteração.

```text
Mobile (390px)
┌──────────────────────┐
│ [logo] Nome rest.  ♥ │ ← header sem status bar fake
│        Entrega R$X   │
├──────────────────────┤
│   [Banner 160px]     │
├──────────────────────┤
│ ●Burgers ○Bebidas ○… │ ← pills com scroll-snap
├──────────────────────┤
│ 🔍 Buscar…           │
├──────────────────────┤
│ Hambúrgueres         │
│ ┌─────┐ Smash Burger │
│ │ img │ pão brioche… │
│ └─────┘ R$ 17,00  ⊕  │
│ ─────────────────    │
│ ┌─────┐ X-Bacon      │
│ │ img │ pão brioche… │
│ └─────┘ R$ 18,00  ⊕  │
├──────────────────────┤
│ 🏠 Início  📋 Menu 🛒│ ← 3 tabs, safe-area
└──────────────────────┘
```
