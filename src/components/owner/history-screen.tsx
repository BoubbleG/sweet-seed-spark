import { useEffect, useState } from "react";
import { SectionShell } from "./shared";
import { History, RotateCcw, Clock } from "lucide-react";
import { toast } from "sonner";
import { listSnapshots, restoreSnapshot, SnapshotRow } from "@/lib/snapshots";
import { useQueryClient } from "@tanstack/react-query";

const SCOPE_LABEL: Record<string, string> = {
  menu: "Cardápio",
  visual: "Aparência",
  info: "Informações",
  promo: "Promoções",
  delivery: "Entrega/Pagamento",
  full: "Geral",
};

const SCOPE_COLOR: Record<string, string> = {
  menu: "bg-orange-100 text-orange-700",
  visual: "bg-violet-100 text-violet-700",
  info: "bg-emerald-100 text-emerald-700",
  promo: "bg-amber-100 text-amber-700",
  delivery: "bg-sky-100 text-sky-700",
  full: "bg-zinc-100 text-zinc-700",
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OwnerHistoryScreen({
  restaurantId,
  onBack,
}: {
  restaurantId: string;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const [items, setItems] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listSnapshots(restaurantId));
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const restore = async (s: SnapshotRow) => {
    if (
      !confirm(
        `Restaurar para a versão "${s.label}" de ${formatWhen(s.created_at)}?\n\nO estado atual será salvo automaticamente — você poderá desfazer esta restauração depois.`,
      )
    )
      return;
    setRestoringId(s.id);
    try {
      await restoreSnapshot(s.id, restaurantId);
      qc.invalidateQueries();
      toast.success("Versão restaurada!");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Não consegui restaurar");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <SectionShell
      title="Histórico de alterações"
      subtitle="Restaure uma versão anterior do seu cardápio"
      onBack={onBack}
    >
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
          <History className="w-5 h-5" />
        </div>
        <div className="text-xs text-zinc-600 leading-snug">
          A cada alteração que você salva, uma cópia do seu cardápio anterior fica
          guardada aqui. Você pode voltar a qualquer momento — até as últimas 100 versões.
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-sm text-zinc-500">Carregando…</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-zinc-700">Nenhuma versão ainda</p>
          <p className="text-xs text-zinc-500 mt-1">
            Faça uma edição no cardápio, visual ou informações — a versão anterior será guardada aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li
              key={s.id}
              className="bg-white border border-zinc-200 rounded-2xl p-3 flex items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${SCOPE_COLOR[s.scope] ?? SCOPE_COLOR.full}`}
                  >
                    {SCOPE_LABEL[s.scope] ?? s.scope}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {formatWhen(s.created_at)}
                  </span>
                </div>
                <p className="text-sm font-bold text-zinc-900 truncate">{s.label}</p>
              </div>
              <button
                onClick={() => restore(s)}
                disabled={restoringId === s.id}
                className="h-11 px-3 rounded-xl bg-zinc-900 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-60"
              >
                <RotateCcw className="w-4 h-4" />
                {restoringId === s.id ? "Restaurando…" : "Restaurar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}