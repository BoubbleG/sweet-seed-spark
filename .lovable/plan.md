# Solução definitiva: imprimir cupom grátis em qualquer impressora

## Problema
O RawBT cobra para uso comercial. A mensagem aparece porque o cupom é enviado como "imagem/documento" pelo sistema de impressão do Android, e o RawBT intercepta isso.

## Solução
Trocar o fluxo de impressão por um que **não depende do RawBT** e funciona de graça em qualquer impressora (Bluetooth, USB ou Wi-Fi):

### 1. Impressão direta via Web Bluetooth (Android/PC Chrome)
- Adicionar um botão **"Conectar impressora Bluetooth"** no painel de pedidos.
- Usar a API `navigator.bluetooth` do Chrome para parear direto com impressoras térmicas ESC/POS (58mm/80mm — Goojprt, MTP, Epson, Bematech, Elgin, etc.).
- Gerar o cupom em **comandos ESC/POS puros** (texto cru + bytes de controle) e enviar via característica GATT.
- Resultado: **zero apps de terceiros**, zero marca d'água, zero pagamento. A impressora recebe o texto direto do navegador.

### 2. Fallback: "Imprimir como texto" (qualquer dispositivo)
- Manter o botão atual "Imprimir" usando `window.print()` com layout 58mm — funciona em qualquer impressora instalada no sistema (USB no PC, AirPrint no iPhone, impressora padrão Android).
- Esse caminho **não passa pelo RawBT**, então não tem aviso comercial.

### 3. Remover orientação para RawBT
- Atualizar `printer-help.tsx`: substituir as instruções de RawBT por:
  - **Android**: usar o botão "Conectar impressora Bluetooth" (Web Bluetooth no Chrome).
  - **PC**: imprimir USB direto pelo Chrome (já funciona).
  - **iPhone**: AirPrint pelo diálogo de impressão do iOS.

## Arquivos a alterar

- `src/lib/escpos.ts` (novo) — gerador de comandos ESC/POS (cabeçalho, itens, totais, corte) a partir do `Order`.
- `src/lib/bluetooth-printer.ts` (novo) — `connectPrinter()`, `printOrder(order)` usando Web Bluetooth (UUID padrão de impressoras térmicas: serviço `000018f0-0000-1000-8000-00805f9b34fb`).
- `src/components/owner/orders-screen.tsx` — adicionar botão "Conectar impressora Bluetooth", persistir conexão, usar Bluetooth quando conectada; senão `window.print()`.
- `src/components/owner/order-card.tsx` — botão "Imprimir" tenta Bluetooth primeiro, cai para `window.print()`.
- `src/components/owner/printer-help.tsx` — reescrever passo a passo sem RawBT.

## Detalhes técnicos

- ESC/POS: `\x1B\x40` (init), `\x1B\x61\x01` (centro), `\x1D\x21\x11` (texto grande), `\n`, `\x1D\x56\x00` (corte). Largura 32 ou 48 colunas.
- Web Bluetooth: `navigator.bluetooth.requestDevice({ filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }] })`, escrever em chunks de 100 bytes na característica `00002af1-0000-1000-8000-00805f9b34fb`.
- Compatibilidade: Chrome Android e Chrome desktop. iOS Safari não tem Web Bluetooth → usa fallback `window.print()` + AirPrint.
- Conexão salva em memória da sessão (Bluetooth do navegador exige gesto do usuário para pareamento inicial, mas reconecta automaticamente depois).

## Resultado para o usuário
- Aperta uma vez "Conectar impressora Bluetooth", escolhe a impressora.
- A partir daí, todo pedido (manual ou automático) imprime direto, sem abrir RawBT, sem aviso, sem custo.
- Em PC com impressora USB e iPhone com AirPrint, o fluxo atual continua funcionando normalmente.
