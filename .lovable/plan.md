## Plano: Cardápio "Mix Doces e Salgados"

### 1. Criar restaurante no banco
Migration inserindo um novo restaurante:
- `slug`: `mix-doces-salgados`
- `name`: "Mix Doces e Salgados"
- `whatsapp`: `5549991714470`
- Cores (inspiradas no logo + flyers): laranja `#F39A3D` (primary), rosa `#E84A8A` (secondary/button), fundo creme `#FFF7EC`, texto marrom `#3A1F12`
- `font_family`: "Outfit" para corpo + headings em estilo manuscrito (Dancing Script) via CSS custom
- `accepts_delivery: true`, `accepts_pickup: true`
- Métodos de pagamento: pix, dinheiro, cartão crédito, transferência (representada como cartão)
- `description`: "Bolos artesanais, docinhos, salgados e kits festa por encomenda"
- Logo: usar `src/assets/mix-doces-salgados-logo.jpeg.asset.json` (upload do anexo 1)
- Banner: gerado com tema doce/festa

### 2. Categorias
Em ordem:
1. Kits Festa
2. Bolos Especiais
3. Salgados Fritos
4. Salgados Assados e Especiais
5. Docinhos Tradicionais
6. Doces Finos

### 3. Produtos (todos os itens listados pelo usuário)
- **4 Kits Festa** (10/20/30/40 pessoas) com descrição completa (bolo, recheios, salgados, docinhos, bebidas)
- **10 Bolos Especiais** com massa/recheio/cobertura, preço por kg, marcados com `sides_note`: "Pedido mínimo 2 kg • Encomenda com antecedência"
- **6 Salgados Fritos** a R$1,00 + 1 especial (Pastel bolha de carne R$1,60)
- **6 Salgados Assados/Especiais** (5 a R$1,60 + Cachorro-quente R$4,00)
- **8 Docinhos Tradicionais** a R$1,50
- **5 Doces Finos** (R$2,00 a R$3,00)

### 4. Imagens dos produtos
Gerar imagem 100% realista para cada produto (~40) via `lovable-assets` com agent `generate_image` (modelo `standard`), salvas em `src/assets/mix/`. Cada imagem reflete fielmente a descrição (massa, recheio, cobertura, decoração).

Para os kits festa: composição de mesa montada (bolo + bandejas de salgados + docinhos + garrafas de refrigerante) de acordo com a quantidade.

### 5. Upload do logo
`lovable-assets create --file /mnt/user-uploads/WhatsApp_Image_2026-06-15_at_22.45.18_2.jpeg --filename mix-logo.jpeg` → `src/assets/mix-doces-salgados-logo.jpeg.asset.json`

### 6. Aviso na descrição do restaurante
Incluir nota: "Bolos por encomenda • Mínimo 2kg • 50% na hora do pedido • Aceita dinheiro, Pix, transferência e cartão"

### 7. PIN do admin
Definir PIN inicial `4470` (pode ser alterado depois no painel master).

### Resultado
Cardápio acessível em `/mix-doces-salgados` com identidade visual quente (laranja/rosa/marrom), todos os produtos, preços e fotos realistas.

### Observação
A geração de ~40 imagens realistas consome bastante tempo/créditos. Posso reduzir para apenas Bolos + Kits + Doces Finos (≈19 imagens) e usar fotos genéricas/emoji para salgados/docinhos repetitivos se preferir — me avise antes de aprovar.
