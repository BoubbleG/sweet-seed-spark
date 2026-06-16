## Mais segurança + acesso individual por restaurante

Hoje qualquer pessoa com o link `/editar/<token>` entra direto no painel do restaurante — basta vazar o link uma vez. E você acessa o painel admin com uma única "senha mestre". Vou reforçar as duas pontas sem complicar o fluxo do cliente.

### 1) Acesso dos clientes: token + PIN, em URL bonita

- Nova URL por restaurante: **`/{slug}/admin`** (ex: `point-do-gordinho/admin`, `isas-lanches/admin`). Cada cliente recebe a sua.
- Ao abrir, aparece uma tela simples pedindo um **PIN de 4–6 dígitos** que você define pra ele.
- O PIN é armazenado com hash (bcrypt) no banco — você nunca vê o PIN dos outros, e ninguém consegue extrair do banco.
- Depois de validar, o cliente recebe uma sessão (cookie httpOnly, 30 dias) e entra direto no painel — não precisa digitar de novo no celular.
- **3 tentativas erradas → bloqueia o restaurante por 15 minutos** (evita força bruta).
- Você cria/redefine o PIN de cada restaurante no painel admin (botão "Definir PIN" / "Redefinir PIN").
- O link antigo `/editar/<token>` continua funcionando **só pra você** (admin master) — clientes não usam mais.

### 2) Seu painel admin: login real com e-mail/senha + Google

- Substitui a "senha mestre" atual por **login de verdade** (e-mail/senha) com opção de entrar com **Google** em 1 clique.
- Só contas marcadas como `admin` (na tabela `user_roles`) entram em `/admin`. Você é o primeiro admin.
- Recuperação de senha por e-mail.
- Proteção contra senhas vazadas ativada (HIBP).

### 3) Endurecer o backend (RLS)

- Hoje várias tabelas têm regras permissivas pra suportar o fluxo via token. Vou fechar:
  - `restaurants`, `categories`, `products`, `orders`: leitura pública só do que aparece no cardápio público; escrita só via funções de servidor que validam **sessão de PIN do dono** ou **role admin**.
  - `restaurant_edit_tokens`: passa a ser acessível apenas por admin.
  - `customer_profiles`, `order_items`: leitura/escrita só do dono do restaurante dono dos pedidos.
- Tudo que o painel do cliente faz hoje (editar produto, mudar visual, ver pedidos) passa por server functions que checam a sessão antes de tocar no banco.

### O que muda na prática

- **Pra você:** entra em `/admin` com seu e-mail (ou Google). Vê a lista de restaurantes, define um PIN pra cada um, e envia ao cliente: *"Seu painel: site.com/point-do-gordinho/admin — PIN: 4729"*.
- **Pra cada cliente:** abre o link único dele, digita o PIN uma vez no celular, e fica conectado.
- **Pra invasores:** sem PIN não entra; com PIN errado é bloqueado; tabelas no banco rejeitam qualquer acesso direto sem sessão válida.

### Detalhes técnicos
- Migration: nova coluna `pin_hash`, `pin_failed_attempts`, `pin_locked_until` em `restaurants`; nova tabela `restaurant_sessions` (token de sessão httpOnly); nova `app_role` enum + `user_roles` + função `has_role`; revisão das policies de todas as tabelas.
- Auth: ativar email/password + Google via `configure_social_auth`, ativar HIBP via `configure_auth`.
- Server functions (`createServerFn`) para: `setRestaurantPin` (admin), `verifyPinAndIssueSession` (público), `requireRestaurantSession` (middleware nas escritas).
- Rotas novas: `/{slug}/admin` (TanStack `$slug.admin.tsx`), `/auth` (login admin), `/_admin/*` (área protegida do admin master). Rota `/editar/$token` mantida só com gate de admin.
- Migração suave: scripts gera PIN inicial aleatório pros restaurantes existentes e exibe pra você no painel.

### O que **não** vai mudar
- O cardápio público (`/point-do-gordinho` etc.) continua aberto, sem login — só o que está hoje.
- O design e os componentes do painel do dono ficam iguais — só muda a porta de entrada.

Posso seguir?