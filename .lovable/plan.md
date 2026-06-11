## Arquivo de prompts de imagem — Point do Gordinho

Vou criar um único arquivo markdown em `docs/prompts-imagens-point-do-gordinho.md` com um prompt detalhado por produto, listando exatamente os ingredientes que aparecem na descrição cadastrada. Assim você gera as imagens e elas batem com o que o cliente vai receber.

### Formato de cada item

Para cada produto, uma seção com:

- **Nome do produto**
- **Ingredientes** (lista do que tem dentro)
- **Prompt** (texto pronto pra colar no gerador de imagem, em inglês, descrevendo enquadramento, iluminação e cada ingrediente visível)

### Produtos cobertos (15 no total)

Hambúrgueres:
- Burguer Simples — pão brioche, hambúrguer bovino, batata palha, cebola caramelizada, mussarela, molho da casa
- X-Bacon — pão brioche, hambúrguer, bacon, ovo, cebola caramelizada, mussarela, molho da casa
- X-Calabresa — pão brioche, hambúrguer, calabresa, ovo, cebola caramelizada, mussarela, molho da casa
- Smash Burguer — pão brioche, hambúrguer, bacon, cebola caramelizada, mussarela, cheddar especial
- Duplo Cheddar — pão brioche, **2x** hambúrguer, bacon, cebola caramelizada, mussarela, cheddar especial

Batatas:
- Batata Simples
- Batata Turbinada (cheddar + bacon)
- Batata com Costela Desfiada

Combos (foto da composição completa, com cada item visível):
- Combo Família — 4 hambúrgueres + 20 mini coxinhas + batata cheddar/bacon + refri 1L
- Combo Burguer Mac — 1 Burguer Mac + refri 269ml
- Combo Duplo Cheddar — duplo cheddar + batata + refri lata 350ml

Bebidas:
- Coca-Cola 350ml, Coca-Cola Zero 350ml, Fanta 350ml, Kuat 350ml

### Padrão visual aplicado a todos os prompts

- Fundo: mesa de madeira escura, iluminação quente lateral, estilo food photography
- Enquadramento: 3/4, close-up, foco no produto
- Sem texto, sem logos, sem mãos

### Observações

- É só um arquivo de documentação (markdown). Nenhuma mudança no código do app, no banco ou nas imagens já existentes.
- Os prompts vão em **inglês** (modelos de imagem respondem melhor), mas com nomes/contexto fiéis ao cardápio brasileiro.

Confirma que posso criar o arquivo assim? Se quiser em português ou em outro caminho/nome, me avisa.