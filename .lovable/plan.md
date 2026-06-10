# Sistema de Links de Edição por Restaurante

## Como vai funcionar

```
Você (Admin Master)
   │  acessa /admin com senha
   │  cria restaurante "Point do Gordinho"
   │  copia link único de edição: /editar/abc123xyz...
   │
   ▼
Envia link pro dono do restaurante
   │
   ▼
Dono abre /editar/abc123xyz
   │  edita cardápio, promoções, visual, dados
   │  vê botão "Copiar link público"
   │
   ▼
Link público do cliente: /point-do-gordinho
   (cardápio que os clientes acessam pra pedir)
```

Cada restaurante tem **dois links**:
- **Link de edição** (secreto, só o dono tem) — `/editar/{token}`
- **Link público** (compartilhável com clientes) — `/{slug}`

## O que vou construir

### 1. Banco de dados
- Adicionar coluna `edit_token` (texto único, gerado automaticamente) na tabela `restaurants`
- Adicionar coluna `admin_password_hash` numa nova tabela `app_settings` (senha do admin master)
- Ajustar políticas de acesso: leitura pública continua liberada pros cardápios; escrita passa a exigir o token de edição correto (validado via função do servidor)

### 2. Página de edição `/editar/$token`
Quando o dono abre o link, ele vê uma versão do painel atual `/admin` mas **filtrada só pro restaurante dele**, com 4 abas:
- **Cardápio** — produtos, preços, categorias (CRUD completo)
- **Promoções** — marcar item como "oferta do dia" com preço promocional riscado
- **Visual** — logo, capa, cores, fonte
- **Informações** — nome, WhatsApp, endereço, horário, taxa de entrega
- Botão no topo: "Ver cardápio público" + "Copiar link público"

### 3. Promoções (recurso novo)
- Novos campos em `products`: `promo_price` (preço promocional), `is_on_promo` (ativo/inativo), `promo_label` (ex: "Oferta do dia")
- No cardápio público: item em promoção mostra preço original riscado + preço novo em destaque + badge

### 4. Admin master `/admin`
- Tela de **login com senha** (a senha fica protegida; primeira vez você define)
- Após login: lista todos os restaurantes em cards com:
  - Nome, slug, status
  - Botão **"Copiar link de edição"** (gera/copia `/editar/{token}`)
  - Botão **"Copiar link público"** (`/{slug}`)
  - Botão **"Regenerar token"** (caso o link vaze)
  - Botão **"Excluir restaurante"**
- Botão **"+ Novo restaurante"** que cria com slug, token e abre direto a página de edição

### 5. Segurança
- Token de edição: 32 caracteres aleatórios (impossível de adivinhar)
- Toda escrita no banco passa por uma função do servidor que valida `token === restaurant.edit_token` antes de salvar
- Senha do admin: armazenada com hash (bcrypt), validada via função do servidor
- Sessão do admin: cookie httpOnly de 7 dias

## Detalhes técnicos

**Rotas novas:**
- `src/routes/editar.$token.tsx` — painel do dono (reusa componentes de `MenuManager`, `VisualManager`, `RestaurantDialog` filtrando por `restaurant_id` resolvido pelo token)
- `src/routes/admin.tsx` — refatorado: adiciona tela de login + lista master de restaurantes
- `src/lib/restaurant-edit.functions.ts` — server functions: `validateEditToken`, `updateRestaurantByToken`, `upsertProductByToken`, etc.
- `src/lib/admin-auth.functions.ts` — server functions: `adminLogin`, `adminLogout`, `createRestaurantWithToken`, `regenerateEditToken`

**Migração SQL:**
- `restaurants.edit_token text unique not null default encode(gen_random_bytes(24), 'hex')`
- `products.promo_price numeric`, `products.is_on_promo boolean default false`, `products.promo_label text`
- Tabela `app_settings(id, admin_password_hash text, updated_at)` — single-row
- RLS revisada: SELECT continua público; INSERT/UPDATE/DELETE só via service role (server functions)

**Cardápio público (`/$slug`):**
- Renderizar badge de promoção + preço riscado quando `is_on_promo = true`

## Fluxo do primeiro uso

1. Você abre `/admin` → tela "Defina a senha do admin" (primeira vez)
2. Faz login
3. Clica em "+ Novo restaurante" → preenche nome e slug
4. Sistema cria o restaurante e mostra: "Link de edição: `/editar/abc...` 📋 Copiar"
5. Você envia esse link por WhatsApp pro dono
6. Dono abre, edita tudo, e copia o link público `/point-do-gordinho` pra divulgar pros clientes

## O que NÃO vai mudar
- Visual atual do cardápio público continua igual (só ganha o badge de promoção)
- Componentes de edição existentes (`MenuManager`, `VisualManager`) são reaproveitados
