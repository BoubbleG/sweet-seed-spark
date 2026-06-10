## Problema

O botão "Ver Demonstração" abre o `DemoCheckoutFlow` dentro do `DialogContent` do shadcn. O `DialogContent` padrão aplica:

- `fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]`
- `max-w-lg`, `p-6`, `gap-4`, `border`
- animação `zoom-in-95`

No mobile (375px), essas regras conflitam com o override `w-screen h-[100dvh]`, deixando o conteúdo desalinhado, com padding/borda extras, scroll horizontal e — quando o teclado abre — empurrando os inputs para fora da tela. Resultado: layout "bugado" e impossível de preencher.

## Solução

Trocar o `Dialog` do shadcn por um overlay fullscreen próprio (mesmo padrão usado no `cart-drawer.tsx`), totalmente mobile-first.

### Mudanças em `src/components/demo-checkout.tsx`

1. **Remover dependência do `Dialog`/`DialogContent`** (que traz centralização + paddings nativos). Substituir por:
   ```tsx
   <AnimatePresence>
     {open && (
       <>
         <motion.div className="fixed inset-0 bg-black/60 z-[100]" ... />
         <motion.div
           role="dialog" aria-modal="true"
           className="fixed inset-0 z-[100] bg-zinc-50 flex flex-col
                      sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                      sm:w-[440px] sm:h-[90vh] sm:rounded-3xl overflow-hidden shadow-2xl"
           initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
           transition={{ type: 'spring', damping: 32, stiffness: 280 }}
         >
   ```
2. **Bloquear scroll do body** enquanto `open` (useEffect com `document.body.style.overflow`).
3. **Header / footer `shrink-0`**, body `flex-1 overflow-y-auto overscroll-contain` — garante que o footer com o botão "Continuar" fica sempre visível mesmo com teclado aberto.
4. **Safe-area** no footer: `paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'`.
5. **Inputs**: trocar `text-base` (16px) já está, mas adicionar `autoComplete`, `enterKeyHint`, e remover `text-base` em favor de `text-[16px]` explícito (evita zoom no iOS independente do breakpoint). Adicionar `w-full` consistente e `min-w-0` no wrapper grid de Rua/Número para que não estoure.
6. **Grid Rua/Número**: trocar `grid-cols-3` por `grid-cols-[1fr_88px]` para evitar quebra estranha em telas estreitas (320–375px).
7. **Animação de step**: trocar `x: 20`/`x: -20` por `y: 10`/`y: -10` — translações horizontais dentro de container `overflow-x-hidden` continuam causando barra horizontal momentânea no mobile. Adicionar `overflow-x-hidden` no container de steps.
8. **Body root**: adicionar `touch-pan-y` no scroll para evitar bounce horizontal no iOS.
9. **Esc / botão X / clique no overlay**: manter fechamento via `onOpenChange(false)`.

### Garantias visuais

- Largura nunca passa de `100vw`; nenhum `min-w` fixo em filhos.
- Botão "Continuar"/"Enviar no WhatsApp" sempre fixo no rodapé, dentro do safe-area.
- Inputs com altura ≥48px, font-size 16px, foco com ring verde (já existente).

## Arquivos

- `src/components/demo-checkout.tsx` — refatorar wrapper e steps conforme acima.

Nada mais precisa mudar (o gatilho em `src/routes/index.tsx` segue igual).
