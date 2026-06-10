import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

export function SectionShell({
  title,
  subtitle,
  onBack,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh bg-zinc-50">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200 px-3 py-3">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="h-12 w-12 rounded-2xl bg-zinc-100 hover:bg-zinc-200 active:scale-95 flex items-center justify-center shrink-0 transition"
          >
            <ChevronLeft className="w-6 h-6 text-zinc-900" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate leading-tight">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-3 py-4 pb-32 sm:pb-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-sm font-bold text-zinc-900 mb-1.5">
      {children}
    </label>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-zinc-500 mt-1.5 font-medium">{children}</p>
  );
}

export function StickySaveBar({
  saving,
  onSave,
  label = "Salvar alterações",
  saved,
}: {
  saving: boolean;
  saved?: boolean;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-zinc-200 p-3 sm:relative sm:bg-transparent sm:border-0 sm:p-0 sm:mt-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black text-base disabled:opacity-60 active:scale-[0.99] transition shadow-lg shadow-zinc-900/20"
        >
          {saving ? "Salvando…" : saved ? "✓ Salvo!" : label}
        </button>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 shadow-sm mb-4">
      <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-500 mb-4">
        {icon}
        <span>{title}</span>
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}