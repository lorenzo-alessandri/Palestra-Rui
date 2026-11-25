import { fd } from "../core/dates";
import { PH, phase, type Plan } from "../core/plan";
import { cx } from "./cx";

/* Linea del tempo delle fasi fino all'esame, con l'avanzamento di oggi. */
export function Fasi({ plan, t }: { plan: Plan; t: number }) {
  const ph = phase(plan, t);
  const seg = [
    { k: 1, a: plan.start, b: plan.p1End },
    { k: 2, a: plan.p1End + 1, b: plan.p2End },
    { k: 3, a: plan.p2End + 1, b: plan.exam - 1 },
  ];
  const pct = (a: number, b: number) => (t > b ? 100 : t < a ? 0 : Math.round(((t - a + 1) / (b - a + 1)) * 100));
  const cur = seg.find((s) => s.k === ph);
  return (
    <div>
    <div className="flex gap-1" role="img" aria-label={`Fase attuale: ${PH[ph].n}`}>
      {seg.map((s) => (
        <div key={s.k} style={{ flexGrow: Math.min(34, Math.max(4, s.b - s.a + 1)) }} className={cx("min-w-0 basis-0", s.k === 3 && "sm:min-w-[92px]")}>
          <div className="h-1.5 overflow-hidden rounded-full bg-riga">
            <div className="h-full bg-blu" style={{ width: `${pct(s.a, s.b)}%` }} />
          </div>
          <div className={cx("mt-1.5 hidden truncate text-[13px] sm:block", ph === s.k ? "font-semibold text-ink" : "text-mut")}>{PH[s.k].n}</div>
          <div className="tnum hidden truncate text-[12px] text-mut sm:block">
            {fd(s.a)} – {fd(s.b)}
          </div>
        </div>
      ))}
      <div className="w-6 flex-none sm:w-12">
        <div className={cx("h-1.5 rounded-full", t >= plan.exam ? "bg-blu" : "bg-riga")} />
        <div className={cx("mt-1.5 hidden text-[13px] sm:block", ph >= 4 ? "font-semibold text-ink" : "text-mut")}>Esame</div>
        <div className="tnum hidden text-[12px] text-mut sm:block">{fd(plan.exam)}</div>
      </div>
    </div>
    <p className="tnum mb-0 mt-2 text-[13px] text-mut sm:hidden">
      {cur ? `${PH[ph].n} dal ${fd(cur.a)} al ${fd(cur.b)}, esame il ${fd(plan.exam)}` : `Esame il ${fd(plan.exam)}`}
    </p>
    </div>
  );
}
