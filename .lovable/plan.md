## Problema

As fotos atuais dos pastéis da Isas Lanches ficaram parecendo croquetes/empanadas empanadas (massa grossa e farelenta), não pastéis brasileiros de verdade. As referências enviadas mostram o estilo correto:

- Massa **fina, lisa e bolhada** (bolhas de óleo características da fritura)
- Cor **dourado clara**, translúcida nas bordas
- Formato **retangular achatado**, tipo "travesseirinho"
- Bordas com **frisado/zigue-zague** marcando o fechamento
- Recheio aparece apenas quando o pastel é **cortado/partido ao meio**

## O que será feito

Regerar as 10 imagens dos produtos do cardápio de pastéis substituindo o prompt para refletir o estilo real:

1. Queijo
2. Pizza
3. Carne
4. Bauru
5. Frango
6. Calabresa
7. Carne com Queijo
8. Frango com Catupiry
9. Calabresa com Queijo
10. Especial da Casa

Para cada imagem usar prompt padronizado descrevendo:
- "Pastel brasileiro frito retangular, massa fina lisa e bolhada (com bolhas características da fritura em óleo), bordas frisadas em zigue-zague, cor dourada clara"
- "Cortado ao meio mostrando o recheio de [X]" (para os que mostram recheio) ou "inteiro empilhado sobre tábua de madeira" (para variar a composição)
- Fotografia gastronômica profissional, luz natural quente, fundo de tábua de madeira rústica

Usar modelo `standard` de geração de imagem (mesma qualidade da rodada anterior).

## Passos técnicos

1. Gerar as 10 novas imagens em paralelo em `/tmp/`
2. Subir cada uma para a CDN via `lovable-assets create` (substituindo os arquivos `src/assets/isas-pastel-*.jpg.asset.json`)
3. Atualizar `image_url` de cada produto no banco (`products` da categoria Pastéis da Isas Lanches) com as novas URLs
4. **Não** alterar nomes, preços nem descrições — apenas as imagens

## O que NÃO será feito

- Não mexer em outros restaurantes nem em outras categorias
- Não alterar a lista de pastéis (já está correta da última rodada)
- Não mexer em layout/visual do cardápio
