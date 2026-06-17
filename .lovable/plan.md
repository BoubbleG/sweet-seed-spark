# Manter o admin master logado

## Problema
Hoje a senha do painel `/admin` é guardada em `sessionStorage` (`admin_session_hash`), que some toda vez que a aba é fechada — por isso você precisa digitar a senha sempre que volta ao site.

## Solução
Trocar a persistência para `localStorage` e revalidar o hash automaticamente ao abrir `/admin`. Se ainda for válido, entra direto, sem pedir senha. O botão "Sair" continua limpando a sessão.

## Mudanças
- `src/routes/admin.tsx`
  - Salvar `admin_session_hash` em `localStorage` (em vez de `sessionStorage`) nos dois pontos do `handleAuthSubmit`.
  - No `useEffect` inicial: ler o hash do `localStorage`, chamar `verify_admin_password`; se válido, setar `sessionHash` + `unlocked` (pula a tela de senha).
  - No logout: remover do `localStorage`.
- `src/lib/ai-designer-auth.ts`
  - Ler o hash do `localStorage` (mantendo `sessionStorage` como fallback) para o AI Designer continuar funcionando.

## Segurança
O hash já é só um SHA-256 da senha (mesmo modelo de hoje) e o servidor revalida via `verify_admin_password` a cada chamada — mudar de `sessionStorage` para `localStorage` apenas estende a duração da sessão neste navegador, sem afetar quem tem acesso.

Sem alterações de banco.
