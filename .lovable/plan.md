## Cardápio Point do Gordinho — novos itens + taxa de entrega

### 1. Novos produtos

**Categoria "Combos"**

- **Combo Família — R$ 75,00**  
Descrição: "4 hambúrgueres + 20 mini coxinhas + porção de batata com cheddar e bacon + refri 1L"
- **Combo Burguer Mac — R$ 20,00**  
Descrição: "1 Burguer Mac + refri 269ml"

**Categoria "Batatinhas"**

- **Batata com Costela Desfiada — R$ 20,00**  
Descrição: "Porção de batata frita coberta com costela desfiada"

### 2. Taxa de entrega

- Atualizar `delivery_fee` do restaurante para **R$ 2,00** (atualmente está R$ 0,00).

### 3. Imagens

- Gerar 3 imagens (combo família, combo burguer mac, batata com costela) e fazer upload pra CDN, salvando em `image_url` de cada produto novo — mesmo padrão usado nos pratos da Delícias da Taty.

### Detalhes técnicos

- Os inserts vão direto na tabela `products` (sem migration, é só dado).
- Update do `delivery_fee` na tabela `restaurants` (id `72b11ac1-...`).
- Nada de mudar schema nem código do app — o front já lê esses campos.

Confirma que posso seguir? Se quiser ajustar nomes/descrições/preços ou pular as imagens, me avisa. e quero tambem que seja possivel eu fazer o upload das imagens dos produtos