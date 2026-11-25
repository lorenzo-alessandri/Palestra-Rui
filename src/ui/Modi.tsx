import { num, today } from "../core/dates";
import { dueIds, unseenCount, type State } from "../core/leitner";
import type { Mode } from "../store/session";
import { cx } from "./cx";

/* I tre modi di studiare: Ripassi, Nuove, Miste, con il conteggio dentro il pulsante. */
export function Modi({ S, onStart }: { S: State; onStart: (m: Mode) => void }) {
  const due = dueIds(S, today()).length;
  const nw = unseenCount(S);
  const mins = Math.round((due * 22) / 60);
  if (!due && !nw) return <p className="m-0 rounded-tasto bg-ok-soft px-4 py-3 font-semibold text-ok">Lavoro di oggi completato.</p>;
  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      <Modo l="Ripassi" n={due} d={due ? `in scadenza, circa ${Math.max(1, mins)} min` : "nessuno in scadenza"} primary={due > 0} onClick={() => onStart("rev")} />
      <Modo l="Nuove" n={nw} d="mai viste" primary={!due} onClick={() => onStart("new")} />
      <Modo l="Miste" n={due + nw} d="ripassi e nuove insieme" onClick={() => onStart("mix")} />
    </div>
  );
}

function Modo({ l, n, d, primary, onClick }: { l: string; n: number; d: string; primary?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!n}
      className={cx(
        "flex items-center justify-between gap-3 rounded-tasto border px-4 py-3 text-left transition-colors disabled:opacity-45 sm:flex-col sm:items-start sm:gap-1",
        primary ? "border-blu bg-blu text-su-blu hover:brightness-110" : "border-riga bg-foglio text-ink hover:border-mut",
      )}
    >
      <span className="min-w-0 sm:order-2">
        <span className="block text-[17px] font-semibold leading-tight">{l}</span>
        <span className={cx("block text-[13px]", primary ? "opacity-85" : "text-mut")}>{d}</span>
      </span>
      <span className="tnum text-[28px] font-semibold leading-none sm:order-1 sm:mb-1">{num(n)}</span>
    </button>
  );
}
