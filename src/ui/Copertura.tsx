import { SUBJ } from "../core/data";
import { num } from "../core/dates";
import { subjStats, type State } from "../core/leitner";

/* Copertura per materia: una barra a testa, consolidate in verde e in apprendimento in blu. */
export function Copertura({ S }: { S: State }) {
  const st = subjStats(S);
  return (
    <div>
      <div className="flex flex-col gap-3 sm:gap-3.5">
        {SUBJ.map((sb, i) => {
          const s = st[i];
          return (
            <div key={i} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 sm:grid-cols-[170px_minmax(0,1fr)_88px] sm:items-center">
              <span className="text-[15px]">{sb.s}</span>
              <span className="tnum text-right text-[13px] text-mut sm:col-start-3 sm:row-start-1">
                <strong className="font-semibold text-ink">{num(s.m)}</strong> su {num(s.tot)}
              </span>
              <div
                className="col-span-2 flex h-2.5 overflow-hidden rounded-full bg-riga sm:col-span-1 sm:col-start-2 sm:row-start-1"
                role="img"
                aria-label={`${sb.s}: ${s.m} consolidate, ${s.l} in apprendimento, ${s.tot - s.m - s.l} mai viste`}
              >
                <div className="h-full bg-ok" style={{ width: `${(s.m / s.tot) * 100}%` }} />
                <div className="h-full bg-blu" style={{ width: `${(s.l / s.tot) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <ul className="m-0 mt-4 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-[13px] text-mut">
        <li className="flex items-center gap-1.5">
          <i className="block h-2.5 w-2.5 rounded-full bg-ok" />
          consolidate (livello 3 o più)
        </li>
        <li className="flex items-center gap-1.5">
          <i className="block h-2.5 w-2.5 rounded-full bg-blu" />
          in apprendimento
        </li>
        <li className="flex items-center gap-1.5">
          <i className="block h-2.5 w-2.5 rounded-full bg-riga" />
          mai viste
        </li>
      </ul>
    </div>
  );
}
