# Cardápio duplo: Lanches × Açaí

Transformar a página pública `/expresso-do-lanche-acai` em "dois cardápios em um", com um botão grande no topo para alternar entre **🍔 Lanches** e **🍧 Açaí**. Cada modo troca:
- as cores do tema (fundo, primário, botões, acentos)
- as categorias/itens visíveis (filtra só os daquele mundo)
- pequenos detalhes visuais (gradiente do banner, cor das pílulas de categoria, cor do botão flutuante do carrinho)

Não mexe em nada de outros restaurantes — a lógica é ativada só quando o slug é `expresso-do-lanche-acai`.

## Como o usuário vai ver

1. Abre o link do cardápio → cai por padrão no modo **Lanches** (tema escuro com laranja/amarelo/vermelho, só categorias de pastéis, sanduíches, batatas e combos).
2. Logo abaixo do header aparece um seletor grande estilo "abas premium" com dois botões: **🍔 Lanches** | **🍧 Açaí**.
3. Clica em **Açaí** → a tela inteira muda para tema roxo/violeta, clean e refrescante, mostrando só a categoria Açaí. As pílulas de categoria, o botão do carrinho e o destaque da seção também ficam roxos.
4. Volta para Lanches a qualquer momento clicando no outro lado do seletor. A troca é animada (cross-fade rápido).
5. A escolha fica lembrada na sessão (sessionStorage) — se rolar e voltar, mantém o modo atual.

## Detalhes técnicos

- Edita só `src/routes/$slug.index.tsx`:
  - Adiciona `const isDual = slug === 'expresso-do-lanche-acai'`.
  - Cria dois presets de tema (`lanchesTheme`, `acaiTheme`) construídos com `buildMenuTheme` passando overrides:
    - **Lanches**: `background #1A0F1F`, `primary #FF6B1A`, `button #FFC107`, texto claro.
    - **Açaí**: `background #1E0B2E`, `primary #8B5CF6`, `button #A855F7`, texto claro, com leve gradiente roxo no fundo.
  - Estado `mode: 'lanches' | 'acai'` (default `lanches`, persistido em `sessionStorage` com chave `expresso-mode`).
  - Função `isAcaiCategory(cat)` → identifica pelo nome (`/açaí|acai/i`).
  - `visibleCategories` = filtra `menu.categories` pelo modo; `filteredProducts` continua usando o restante da lógica mas restrita às categorias visíveis.
  - Tema efetivo `t = mode === 'acai' ? acaiTheme : lanchesTheme` quando `isDual`, senão `buildMenuTheme(restaurant)` como hoje.
- Componente novo inline `<ModeSwitcher />`: pill grande arredondada (rounded-full), dois botões 50/50, ícone + label, sliding indicator com `motion` (layoutId compartilhado para animar a "bolha" ativa entre os lados). Renderizado só quando `isDual`.
- Animação de troca: envolve o `<main>` em `<motion.div key={mode}>` com `initial={{opacity:0, y:8}} animate={{opacity:1, y:0}}` para um cross-fade suave.
- Promo banner (`promoProducts`) também é filtrado pelas categorias visíveis do modo atual.
- Zero alteração de banco, zero migração, zero mudança em outros restaurantes ou no admin.

## Fora do escopo

- Não cria campo no admin para configurar modos (fica hardcoded para este slug).
- Não muda logo nem o banner global — só o tema/cores e a lista de categorias.
- Não toca em rotas, auth ou backend.
