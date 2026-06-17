## Problema

Hoje, ao entrar em `/{slug}/admin` com o PIN, criamos uma sessão de 30 dias e salvamos o token no `localStorage`. Na teoria não precisaria entrar de novo, mas o código tem um bug que faz você ser deslogado sem motivo:

Em `src/routes/$slug.admin.tsx` existe este `useEffect`:

```ts
if (token && !isLoading && !restaurant && !isError) {
  localStorage.removeItem(storageKey(slug));
  setToken(null);
}
```

Ele apaga o token sempre que o resultado não chega imediatamente "carregado com sucesso" — ou seja, em qualquer falha transitória de rede, ou enquanto o React Query ainda está no estado inicial, o token é descartado. Resultado: você precisa digitar o PIN repetidamente.

Além disso, o token expira 30 dias depois do login e nunca é renovado, então quem usa o painel todo dia perde a sessão no dia 31.

## O que vou fazer

Tudo só no frontend + uma pequena função no backend para renovar a sessão. Nada quebra outras telas.

### 1. Manter o login lembrado de verdade

Em `src/routes/$slug.admin.tsx`:

- **Só apagar o token quando o servidor disser claramente que ele é inválido/expirado.** Falhas de rede, timeouts ou estados intermediários do React Query mantêm a sessão.
- Adicionar `staleTime: Infinity` e `gcTime` longo na query de validação, para não revalidar o token a cada navegação.
- Validar o token só uma vez ao montar; nas navegações seguintes dentro do painel, reutilizar o resultado em cache.

### 2. Sessão deslizante (renovação automática)

Adicionar uma RPC `extend_pin_session(_token text)` que, se o token ainda é válido, empurra `expires_at = now() + 30 days`. O painel chama essa RPC silenciosamente quando você abre o admin, então enquanto você usar pelo menos uma vez a cada 30 dias, nunca mais precisa digitar PIN naquele dispositivo.

### 3. Botão "Sair" continua igual

Apenas o botão "Sair" no topo verde, ou um PIN inválido / expirado retornado pelo servidor, limpam a sessão. Nada mais.

### Arquivos afetados

- `src/routes/$slug.admin.tsx` — lógica do gate (não toca no UI de PIN nem no painel).
- Nova migração com a função `extend_pin_session`.

### O que NÃO muda

- Tela de PIN, painel do admin (`OwnerShell`), painel master `/admin`, login do master, RLS, nada disso é tocado.
- O PIN continua sendo o mesmo, a segurança não muda — apenas a sessão fica mais resiliente e se renova sozinha enquanto usada.