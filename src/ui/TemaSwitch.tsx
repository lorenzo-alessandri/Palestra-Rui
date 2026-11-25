import { Monitor, Moon, Sun } from "lucide-react";
import { temaStore, useTema, type Tema } from "../store/store";
import { cx } from "./cx";

const OPZ: { k: Tema; l: string; I: typeof Sun }[] = [
  { k: "auto", l: "Automatico", I: Monitor },
  { k: "chiaro", l: "Chiaro", I: Sun },
  { k: "scuro", l: "Scuro", I: Moon },
];

export function TemaSwitch() {
  const tema = useTema();
  return (
    <div role="radiogroup" aria-label="Tema" className="inline-flex rounded-tasto border border-riga p-0.5">
      {OPZ.map(({ k, l, I }) => (
        <button
          key={k}
          role="radio"
          aria-checked={tema === k}
          aria-label={l}
          title={l}
          onClick={() => temaStore.set(k)}
          className={cx(
            "grid h-8 w-9 place-items-center rounded-[6px] border-0 transition-colors",
            tema === k ? "bg-blu-soft text-blu" : "bg-transparent text-mut hover:text-ink",
          )}
        >
          <I size={16} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}

/* Versione compatta per il telefono: un solo pulsante che passa al tema successivo */
export function TemaCiclo() {
  const tema = useTema();
  const i = OPZ.findIndex((o) => o.k === tema);
  const { I, l } = OPZ[i];
  return (
    <button
      aria-label={`Tema: ${l}. Tocca per cambiare`}
      onClick={() => temaStore.set(OPZ[(i + 1) % OPZ.length].k)}
      className="grid h-10 w-10 place-items-center rounded-tasto border-0 bg-transparent text-mut hover:text-ink"
    >
      <I size={18} strokeWidth={1.75} />
    </button>
  );
}
