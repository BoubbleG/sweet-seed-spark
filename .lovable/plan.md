## Novo cardápio: Expresso do Lanche & Açaí

Vou criar um novo restaurante `expresso-do-lanche-acai` com cardápio completo, logo (a do anexo), banner e foto para cada produto.

### 1. Assets (Lovable Assets CDN)
- **Logo**: usar a imagem anexada (`ChatGPT_Image_17_de_jun._de_2026_00_17_31.png`) como logo oficial.
- **Banner**: gerar 1920×800 com clima split — lado esquerdo quente (laranja/vermelho/amarelo, pastéis e hambúrgueres) e lado direito roxo (açaí cremoso com frutas). Frase "O sabor que vicia".
- **Fotos dos produtos** (premium quality, super fiéis à descrição):
  - Pastéis tradicionais (8): queijo, misto, carne, pizza, frango, frango c/ queijo, calabresa, calabresa c/ queijo — pastel fritado dourado e crocante, recheio aparente.
  - Pastéis especiais (3): expresso especial (mistão), carne de sol, camarão c/ creme de queijo.
  - Sanduíches (8): X-Tudo, X-Bacon, X-Bacon Egg, X-Salada, X-Bauru, X-Frango, X-Frango Egg, X-Carne de Sol — pão árabe/bola conforme descrito, com ingredientes visíveis.
  - Batatas (2): fritas P/G (mesma foto), batata recheada (cheddar + bacon + calabresa).
  - Combos (4): Expresso, Casal, Amigos, Fome de Leão — composições com itens reais do combo.
  - Açaí (1): copo 400ml roxo com mix de frutas, granola, banana, morango, leite condensado, confete — visual cremoso e gelado.

Total: ~27 imagens de produto + banner + logo.

### 2. Banco de dados (uma migração)
- **Restaurant**: 
  - slug: `expresso-do-lanche-acai`
  - name: `Expresso do Lanche & Açaí`
  - tagline: `O sabor que vicia`
  - WhatsApp: `5585996678859`
  - Instagram: `expressodolanche.açai`
  - horário: 16:00–00:00
  - **tema**: fundo escuro (`#1A0F1F`), primária laranja quente (`#FF6B1A`), botões/destaques amarelo (`#FFC107`), texto claro, fonte display impactante (ex: "Bebas Neue" headings + "Inter" body). A seção Açaí terá tom roxo via cor de categoria.
  - sem PIN (mantém regra atual).
- **Categories** (6): Pastéis Tradicionais, Pastéis Especiais, Sanduíches, Batatas, Combos, Açaí.
- **Products**: todos os ~27 itens com nome, descrição (ingredientes listados), preço e foto correspondente.
  - Itens com 2 tamanhos (Batata Frita P/G, Batata Recheada P/G) entram como 2 produtos separados (P e G), padrão já usado em outros cardápios.

### 3. Sem mudanças de código
Todo o resto (rota `/expresso-do-lanche-acai`, layout público) já funciona via slug dinâmico — nada a alterar em `src/routes/$slug.index.tsx`.

### Observações
- A logo do anexo será enviada como está (sem regenerar) via `lovable-assets create`.
- Imagens dos produtos serão geradas em modelo `standard` (e logo/banner em `premium`) para qualidade alta sem custo excessivo.
- Acessível em `/expresso-do-lanche-acai` assim que migração rodar.
