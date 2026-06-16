## Novo cardápio: Frango Assado Ponto Com

Vou criar um restaurante novo no sistema com tudo do panfleto e gerar imagem pra cada item.

### Restaurante
- **Nome**: Frango Assado Ponto Com
- **Slug**: `frango-assado-ponto-com` (URL: `/frango-assado-ponto-com`)
- **Tipo**: Churrasco / carnes assadas
- **Descrição**: "Carnes assadas com sabor de churrasco de verdade!"
- **Visual**: tema escuro com madeira queimada, dourado e laranja-fogo (combina com o panfleto)
- **WhatsApp**: (62) 99459-7546 (principal) — segundo (62) 99343-8937 vai na descrição
- **Endereço**: "Em frente ao Supermercado Família — aos domingos no antigo Bambuzal, saída pra Nova Fátima"
- **Logo + banner**: gero a partir do panfleto

### Categorias e produtos (10 itens, todos com imagem gerada)

**Carnes Assadas**
1. Panceta Crocante — a partir de R$ 35,00 — "Suculenta por dentro, crocante por fora"
2. Pernil Suíno — a partir de R$ 35,00 — "Macio, temperado e assado na brasa"
3. Costela Gaúcha 2kg — R$ 90,00 — "Defumada lentamente para um sabor incomparável"
4. Costelinha de Porco Assada na Brasa — a partir de R$ 35,00 — "Assada na brasa até desmanchar de tão macia"
5. Frango Assado na Brasa — R$ 50,00 — "Na brasa, dourado e suculento"

**Acompanhamentos** (usando tamanhos P=500g / M=1kg do sistema existente)
6. Arroz Soltinho — 500g R$ 10,00 / 1kg R$ 15,00
7. Feijão Tropeiro — 500g R$ 15,00 / 1kg R$ 20,00

**Bebidas**
8. Cerveja Lata — a partir de R$ 4,50
9. Coca-Cola 2 Litros — R$ 16,00
10. Água c/ ou sem gás 500ml — R$ 3,00

### Imagens
10 imagens geradas com estilo fotografia gastronômica rústica (tábua de madeira, brasa, iluminação quente), enviadas via `lovable-assets` e salvas no `image_url` de cada produto. Também gero logo e banner pra cabeçalho.

### Técnico
- Migration cria registro em `restaurants`, `categories` e `products` (todas as tabelas já existem)
- Não mexo em nenhum outro restaurante (Isas Lanches etc. ficam intactos)
- Não mexo em código de UI — uso o template público existente em `/$slug`
