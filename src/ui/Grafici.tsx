import { fd } from "../core/dates";
import type { SimRec, State } from "../core/leitner";

/* Ultime 12 simulazioni: barre con la soglia di idoneità a 60. */
export function SimBarre({ sims }: { sims: SimRec[] }) {
  const last = sims.slice(-12);
  return (
    <div className="relative mr-7 flex h-28 items-end gap-1.5 border-b border-riga" role="img" aria-label={`Punteggi delle ultime ${last.length} simulazioni; la soglia di idoneità è 60`}>
      <div className="pointer-events-none absolute -right-7 left-0 border-t border-dashed border-mut" style={{ bottom: "60%" }}>
        <span className="tnum absolute -top-[9px] right-0 bg-foglio pl-1 text-[12px] leading-[18px] text-mut">60</span>
      </div>
      {last.map((s, k) => (
        <div
          key={k}
          title={`${fd(s.d)}: ${s.sc}/100`}
          className={s.sc >= 60 ? "max-w-8 flex-1 rounded-t-[2px] bg-ok" : "max-w-8 flex-1 rounded-t-[2px] bg-ko"}
          style={{ height: `${Math.max(3, s.sc)}%` }}
        />
      ))}
    </div>
  );
}

/* Ultimi 28 giorni: una casella al giorno, più scura con più risposte. */
export function Giorni({ S, t }: { S: State; t: number }) {
  const cells = [];
  for (let i = 27; i >= 0; i--) {
    const d = t - i;
    const n = S.log[d]?.[0] ?? 0;
    const a = n ? Math.min(1, 0.25 + n / 120) : 0;
    cells.push(
      <i
        key={d}
        title={`${fd(d)}: ${n} risposte`}
        className="block aspect-square rounded-[2px] border border-riga"
        style={n ? { background: `color-mix(in srgb, var(--blu) ${Math.round(a * 100)}%, var(--foglio))`, borderColor: "transparent" } : undefined}
      />,
    );
  }
  return <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">{cells}</div>;
}
