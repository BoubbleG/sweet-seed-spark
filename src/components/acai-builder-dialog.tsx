import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, IceCream } from "lucide-react";

const MIX_1 = ["Granola", "Banana", "Morango"];
const MIX_2 = ["Granulado", "Confete", "Leite condensado"];

export function AcaiBuilderDialog({
  open,
  onOpenChange,
  onConfirm,
  accent = "#A855F7",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (selections: { mix1: string[]; mix2: string[] }) => void;
  accent?: string;
}) {
  const [mix1, setMix1] = useState<string[]>([]);
  const [mix2, setMix2] = useState<string[]>([]);

  const toggle = (list: string[], setList: (v: string[]) => void, v: string) => {
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  const reset = () => {
    setMix1([]);
    setMix2([]);
  };

  const handleConfirm = () => {
    onConfirm({ mix1, mix2 });
    reset();
    onOpenChange(false);
  };

  const Group = ({
    title,
    options,
    selected,
    setSelected,
  }: {
    title: string;
    options: string[];
    selected: string[];
    setSelected: (v: string[]) => void;
  }) => (
    <div>
      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">{title}</h4>
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => {
          const isOn = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(selected, setSelected, opt)}
              className="flex items-center justify-between gap-3 h-12 px-4 rounded-2xl border-2 text-sm font-bold transition-all active:scale-[0.99]"
              style={{
                borderColor: isOn ? accent : "#e4e4e7",
                backgroundColor: isOn ? `${accent}14` : "#fff",
                color: isOn ? accent : "#27272a",
              }}
            >
              <span>{opt}</span>
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center border-2"
                style={{
                  borderColor: isOn ? accent : "#d4d4d8",
                  backgroundColor: isOn ? accent : "transparent",
                  color: "#fff",
                }}
              >
                {isOn && <Check className="w-3.5 h-3.5" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: `${accent}1F`, color: accent }}
          >
            <IceCream className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-black">Monte seu Copo de Açaí</DialogTitle>
          <DialogDescription>
            R$ 15,00 · 400 ml — escolha à vontade nos dois mix.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <Group title="Mix 1" options={MIX_1} selected={mix1} setSelected={setMix1} />
          <Group title="Mix 2" options={MIX_2} selected={mix2} setSelected={setMix2} />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-2xl bg-zinc-100 text-zinc-700 font-bold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-[1.5] h-12 rounded-2xl font-black text-white shadow-md active:scale-[0.99]"
            style={{ backgroundColor: accent }}
          >
            Adicionar — R$ 15,00
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}