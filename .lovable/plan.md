## Objetivo

Permitir ativar/desativar qualquer prato com um único toque, direto no card, sem precisar abrir edição.

## Onde

Arquivo: `src/components/owner/menu-screen.tsx` (tela "Meu cardápio" do dono).

Hoje cada prato já tem um botão "Disponível / Esgotado", mas ele só aparece quando a categoria está expandida e fica misturado com os botões de editar/apagar. Vou trocar por um **toggle (switch) sempre visível no topo do card de cada prato**.

## Mudanças

1. No card de cada prato (dentro da categoria expandida):
   - Adicionar um `Switch` no canto superior direito, ao lado do nome do prato.
   - Estado: ligado = disponível, desligado = esgotado.
   - Ao alternar, chama o `toggleAvailable(p)` que já existe (UPDATE em `products.is_available`).
   - Feedback visual: quando esgotado, o card fica com opacidade reduzida e uma tag cinza "Esgotado" abaixo do nome.

2. Remover o botão grande "Disponível / Esgotado" da barra inferior (fica redundante) — sobram só **Editar** e **Apagar**.

3. Mostrar contagem de disponíveis na categoria (ex.: "5 pratos · 2 esgotados") para o dono ter visão rápida.

## Detalhes técnicos

- Componente `Switch` já existe em `src/components/ui/switch.tsx`.
- A mutação otimista pode ser adicionada depois; por ora mantém o `invalidateQueries` atual para simplicidade.
- Nenhuma mudança de schema, RLS ou backend.

## Fora de escopo

- Ativar/desativar a categoria inteira de uma vez.
- Toggle nas telas pública (`$slug.tsx`) ou admin global — só na tela do dono.
- Correções de segurança das policies (assunto separado já discutido).
