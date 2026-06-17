## Novo cardápio

### 1. Restaurante
Migration inserindo novo restaurante:
- `name`: "Cardápio"
- `slug`: `cardapio`
- `whatsapp`: `5514988284135`
- `description`: "Para aquecer o frio! 🔥 Cuscuz, caldos na cumbuca e sobremesas."
- Cores quentes/aconchegantes (inverno): primary laranja-âmbar `#D9541E`, secondary vermelho-telha `#A23116`, fundo creme `#FFF6E9`, texto marrom escuro `#2A1A10`
- Fontes: heading "Fraunces" (serif elegante), corpo "Outfit"
- `accepts_delivery: true`, `accepts_pickup: true`
- Pagamentos: pix, dinheiro, cartão

### 2. Categorias (ordem)
1. Cuscuz
2. Caldos na Cumbuca
3. Sobremesas

### 3. Produtos
**Cuscuz** (2)
- Cuscuz Pequeno — R$ 15,00
- Cuscuz Grande — R$ 30,00

**Caldos na Cumbuca** (10, todos R$ 25,00, descrição "Servido na cumbuca, acompanha torradas")
- Cabotiá com bacon
- Carne seca com abóbora
- Canja de galinha
- Vaca atolada
- Canja de legumes
- Mandioca com costela
- Mandioquinha com carne
- Caldo verde
- Feijão
- Ervilha com bacon

**Sobremesas** (3)
- Bombom de morango com Ninho — R$ 15,00
- Mousse de maracujá — R$ 10,00
- Mousse de limão — R$ 10,00

### 4. Imagens (geradas com `imagegen`, modelo `standard`, realistas, salvas em `src/assets/cardapio/`)
- **Logo** (`logo.png`, transparente): emblema circular com cumbuca de barro fumegante + colher de pau, tipografia serifada "Cardápio" com subtítulo "Para aquecer o frio"
- **Banner** (`banner.jpg`, 1920×800): mesa rústica de madeira com cumbucas de caldo fumegantes, cuscuz e torradas, luz quente de inverno
- **2 cuscuz** (porção pequena em prato fundo, porção grande em travessa)
- **10 caldos**: cada um numa cumbuca de barro com torradas ao lado, refletindo o ingrediente principal (cabotiá+bacon, carne seca+abóbora, canja amarela, vaca atolada com mandioca+costela bovina, canja de legumes coloridos, mandioca+costela, mandioquinha amarela+carne, caldo verde com couve+calabresa, feijão marrom cremoso, ervilha verde+bacon)
- **3 sobremesas**: bombom morango+Ninho em taça, mousse maracujá com sementes, mousse limão com raspas

Total: ~16 imagens (logo + banner + 15 produtos).

### 5. WhatsApp e frase
- WhatsApp `5514988284135` no campo padrão.
- Frase "Para aquecer o frio!" usada como tagline/subtítulo do hero e na descrição.

### 6. PIN
Sem PIN (conforme regra atual — só configuro PIN quando solicitado).

### Resultado
Cardápio acessível em `/cardapio`, identidade visual quente de inverno, todos os itens com foto realista, logo e banner customizados.

### Observação
São ~16 imagens em qualidade `standard` — consome tempo e créditos. Se quiser, posso reduzir para apenas logo + banner + 3 representativas (um cuscuz, uma cumbuca genérica, uma sobremesa) e usar fotos genéricas/emoji para os demais. Me avise se preferir essa versão enxuta antes de aprovar.
