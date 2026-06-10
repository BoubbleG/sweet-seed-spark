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
              <li>Conecte a impressora térmica no USB do PC e instale o driver dela.</li>
              <li>Deixe esta página aberta no Chrome durante o expediente.</li>
              <li>
                Ative <b>"Imprimir automático"</b> aqui em cima — todo pedido novo
                imprime sozinho.
              </li>
              <li>
                Dica: na primeira impressão, marque <b>"Lembrar minha escolha"</b>{" "}
                no diálogo do Chrome.
              </li>
            </ol>
          )}

          {tab === "android" && (
            <ol className="text-sm text-zinc-700 space-y-2 list-decimal pl-5">
              <li>
                Instale o app grátis <b>RawBT</b> na Play Store (ele transforma sua
                impressora Bluetooth em impressora do sistema).
              </li>
              <li>Abra o RawBT e pareie sua impressora Bluetooth nele.</li>
              <li>Volte aqui no Chrome e deixe esta página aberta.</li>
              <li>
                Ative <b>"Imprimir automático"</b>. Quando aparecer a tela de
                impressão, escolha <b>RawBT</b>.
              </li>
            </ol>
          )}

          {tab === "iphone" && (
            <ol className="text-sm text-zinc-700 space-y-2 list-decimal pl-5">
              <li>O iPhone não permite impressão automática via navegador.</li>
              <li>
                Você verá os pedidos chegando aqui — toque em <b>"Imprimir"</b> em
                cada pedido e use o app da sua impressora.
              </li>
              <li>
                Para automático, use um tablet/PC Android com RawBT ou um PC com a
                impressora USB.
              </li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}