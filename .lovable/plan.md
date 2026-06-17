## Novo restaurante: Shalom Burger

Vou criar um novo cardápio digital com slug `shalom-burger`, replicando o **estilo visual do Point do Gordinho** (fundo preto, cards glass, fonte Outfit, layout em lista), mas com a identidade laranja/preto da Shalom Burger.

### Identidade visual
- **Slug:** `/shalom-burger`
- **Cores:** primary `#F59E0B` (laranja/dourado da logo), secondary `#FFFFFF`, background `#0A0A0A`, texto branco
- **Fonte:** Outfit · **Cards:** glass · **Layout:** list · **Categorias:** pills
- **Logo:** recortada da imagem enviada (o "SHALOM BURGER LANCHES" circular) e enviada via lovable-assets
- **Rodapé:** "Shalom Burger — Sabor que abençoa 🔥"

### Categorias (5)
1. Burguers Simples
2. Burguers Duplos
3. Jantar
4. Porções
5. Bebidas & Sobremesas

### Produtos (23) — extraídos do cardápio

**Burguers Simples** (pão brioche, carne 100g, queijo cheddar + extras)
- Simples R$10 · Creme Cheese R$13 · Bacon R$15 · Gorgonzola R$15 · Queijo Reino R$17 · Bacon & Gorgonzola R$20 · Burger & Cebola Caramelizada R$12 · Queijo Reino & Bacon R$20

**Burguers Duplos** (pão brioche, 2 carnes 100g, cheddar + extras)
- Duplo Simples R$15 · Duplo Creme Cheese R$18 · Duplo Bacon R$20 · Duplo Gorgonzola R$20 · Duplo Queijo Reino R$22 · Burger Duplo Caramelizado R$17 · Duplo Bacon & Gorgonzola R$25 · Duplo Queijo Reino & Bacon R$25

**Jantar**
- Macaxeira com Bisteca/Charque/Carne sol R$17 · Cachorro-Quente R$10 · X-Tudo 3 carnes R$20

**Porções**
- Batata P 300g R$10 · Batata M 400g R$15 · Batata Completa 600g (frita, ovo, bacon, calabresa) R$30

**Bebidas & Sobremesas**
- Fatia de bolo R$8 · Refrigerante Lata R$5 · Refrigerante 1 Litro R$10

### Imagens dos produtos
- Cada produto recebe uma imagem do Unsplash escolhida por tipo (burger simples, burger duplo, hot dog, batata frita, refri, bolo, etc.)
- **Validação obrigatória:** rodo `curl -I` em cada URL candidata ANTES de inserir; só uso as que retornam HTTP 200
- Depois do INSERT, faço SELECT + nova validação HEAD em todas as URLs salvas — se alguma falhar, substituo na hora
- Garantia final: `image_url IS NULL` = 0 e 100% das URLs respondem 200

### Execução
1. Recortar logo da imagem enviada → upload via `lovable-assets`
2. Validar todas as URLs Unsplash candidatas
3. 1 migration: INSERT restaurant + categories + 23 products (com GRANTs públicos já existentes na tabela)
4. Verificação final via SELECT e HEAD em todas as imagens
5. Preview em `/shalom-burger`
