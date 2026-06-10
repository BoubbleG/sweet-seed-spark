# Editor mobile-first para donos de restaurante

O link `/editar/{token}` que o dono recebe vai ser usado **quase sempre no celular** por pessoas que **não têm familiaridade com painéis**. Vou refazer toda a navegação e os formulários do editor com foco em: textos curtos em português simples, botões grandes que cabem o polegar, uma ação principal visível por tela, e zero "jargão de admin".

## O que muda

### 1. Nova navegação mobile (substitui as abas atuais)

Atualmente a página usa abas no topo (`Cardápio / Visual / Informações`) que ficam apertadas no celular. Vou trocar por:

- **Tela inicial do editor** com 4 cartões grandes empilhados (estilo "menu de app"):
  - 🍔 **Meu cardápio** — "Adicionar, editar ou remover pratos"
  - 🏷️ **Promoções** — "Marcar oferta do dia e preço promocional"
  - 🎨 **Aparência** — "Logo, capa e cores"
  - 📞 **Meu restaurante** — "WhatsApp, endereço, horário, taxa"
- Cada cartão abre uma **tela cheia** com um botão "← Voltar" gigante no topo e a ação principal fixa no rodapé (`Salvar` ou `+ Adicionar`).
- **Barra fixa inferior** (bottom bar) com 3 atalhos sempre visíveis: `Editar`, `Ver meu cardápio`, `Compartilhar link`.

### 2. Cardápio — fluxo simplificado

- Lista de categorias em **cards grandes expansíveis** (acordeão), não em colunas.
- Cada produto vira um cartão com: foto, nome, preço, e um único botão "Editar". Sem ícones de lápis/lixeira soltos — tudo dentro do diálogo de edição.
- Botão flutuante `+` no canto inferior direito para "Adicionar prato".
- Reordenar via setas ↑ ↓ (drag-and-drop não funciona bem no toque).
- Toggle grande "Disponível hoje" em cada prato (em vez de checkbox pequeno).

### 3. Promoções — tela dedicada e visual

Hoje a promoção fica escondida dentro do diálogo do produto. Vou criar uma **aba própria "Promoções"** que mostra:
- Lista de todos os pratos com um **switch grande** "Em promoção".
- Quando ligado, aparecem dois campos lado a lado: `Preço normal` (cinza, riscado) e `Preço promocional` (destaque) + um campo `Etiqueta` ("Oferta do dia", "-20%", etc).
- Pré-visualização imediata em cima mostrando como o cliente vai ver.

### 4. Aparência — só o essencial, sem técnico

- 3 blocos grandes: **Logo**, **Capa**, **Cor principal**.
- Upload com botão "Tirar foto / Escolher do celular" (input `capture` quando útil).
- Cor principal via paleta de **8 cores predefinidas** (não color-picker hex).
- Pré-visualização ao vivo embaixo mostrando "Assim seu cliente vai ver".

### 5. Informações — formulário em passos

Em vez de um formulão único:
- Tela rolável com **cards de seção**: `Contato` (WhatsApp), `Endereço`, `Horário`, `Entrega`.
- Cada campo com label grande, exemplo embaixo (ex.: "Ex.: 11 99999-9999"), `inputMode` correto para abrir teclado numérico/telefone, `autocomplete`.
- Botão `Salvar` fixo no rodapé (sticky) com feedback "✓ Salvo!" inline.

### 6. Microajustes de UX mobile

- Todos os botões com altura mínima de **52px** (`min-h-13`) e texto legível (≥14px).
- Inputs com altura **48px** mínimo, `text-base` (16px) para evitar zoom do iOS.
- Toasts grandes, posicionados no topo no mobile (para não cobrir o teclado).
- Diálogos viram **bottom sheets** que cobrem 100% no celular e rolam internamente.
- "Salvar" automático com debounce em campos simples (toggle de promoção, disponibilidade), com indicador "Salvando… ✓ Salvo".
- Linguagem 100% em português coloquial: "Apagar" em vez de "Excluir", "Mostrar para clientes" em vez de "Ativar", etc.

## Arquivos envolvidos

- `src/routes/editar.$token.tsx` — refeito com home + sub-telas e bottom bar.
- `src/components/admin/menu-manager.tsx` — versão mobile (cards expansíveis, FAB, toggles grandes).
- `src/components/admin/product-dialog.tsx` — vira bottom sheet, separa edição de promoção.
- `src/components/admin/visual-manager.tsx` — paleta predefinida, uploads simplificados, preview.
- Novo `src/components/admin/promo-manager.tsx` — tela dedicada de promoções.
- Novo `src/components/admin/owner-info-form.tsx` — substitui o `InfoForm` inline em cards seccionados.

## Fora do escopo

- O `/admin` (master) **não muda** — continua igual; foco é só no link que o dono recebe.
- O cardápio público `/{slug}` **não muda**.
- Sem mexer em banco de dados ou lógica de backend.
