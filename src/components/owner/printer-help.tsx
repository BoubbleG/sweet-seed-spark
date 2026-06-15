import { useState } from "react";
import { ChevronDown, Printer } from "lucide-react";

export function PrinterHelp() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"pc" | "android" | "iphone">("pc");

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 active:bg-zinc-50"
      >
        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
          <Printer className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-sm font-black text-zinc-900 leading-tight">
            Como configurar minha impressora?
          </h3>
          <p className="text-xs text-zinc-500 leading-tight">
            Passo a passo simples por aparelho
          </p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-zinc-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-zinc-200 p-4">
          <div className="flex gap-2 mb-3">
            {(
              [
                ["pc", "No PC"],
                ["android", "Android"],
                ["iphone", "iPhone"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`flex-1 h-10 rounded-xl text-xs font-bold transition ${
                  tab === k
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {tab === "pc" && (
            <ol className="text-sm text-zinc-700 space-y-2 list-decimal pl-5">
              <li><b>Opção 1 (recomendada — Bluetooth):</b> clique em <b>"Conectar"</b> no card "Impressora Bluetooth" acima e escolha sua impressora. Imprime de graça, sem app extra.</li>
              <li><b>Opção 2 (USB):</b> conecte a impressora no USB, instale o driver e use o botão <b>"Imprimir"</b> — abre o diálogo do Chrome.</li>
              <li>Para automático, ative <b>"Imprimir automático"</b>. Com Bluetooth conectado, imprime direto; com USB, marque <b>"Lembrar minha escolha"</b> no Chrome na primeira impressão.</li>
            </ol>
          )}

          {tab === "android" && (
            <ol className="text-sm text-zinc-700 space-y-2 list-decimal pl-5">
              <li>Pareie sua impressora térmica no <b>Bluetooth do Android</b> (Configurações &gt; Bluetooth).</li>
              <li>Abra esta página no <b>Google Chrome</b> (não funciona em outros navegadores).</li>
              <li>Toque em <b>"Conectar"</b> no card "Impressora Bluetooth" acima e escolha sua impressora na lista.</li>
              <li>Pronto! Cada pedido imprime direto — <b>sem RawBT</b>, sem aviso de uso comercial, totalmente grátis. Ative <b>"Imprimir automático"</b> para imprimir sozinho.</li>
            </ol>
          )}

          {tab === "iphone" && (
            <ol className="text-sm text-zinc-700 space-y-2 list-decimal pl-5">
              <li>O iPhone não suporta Bluetooth direto pelo navegador. Use <b>AirPrint</b>: toque em <b>"Imprimir"</b> em cada pedido e selecione sua impressora AirPrint.</li>
              <li>Para impressão automática, use um celular/tablet Android ou PC com Chrome — ali o Bluetooth funciona sem apps de terceiros.</li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}