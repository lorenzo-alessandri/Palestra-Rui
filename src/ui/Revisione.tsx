import { useState } from "react";
import { Check, Minus, X } from "lucide-react";
import { QI, SUBJ } from "../core/data";
import { Button } from "./Button";
import { cx } from "./cx";
import { Foglio } from "./Foglio";
import { Gemelle } from "./Gemelle";

/* Revisione delle domande di una simulazione, con tre filtri. */
export interface RevItem {
  n: number;
  id: number;
  a: string | undefined;
}
type Filtro = "bad" | "ok" | "all";

export function Revisione({ items }: { items: RevItem[] }) {
  const [f, setF] = useState<Filtro>("bad");
  const st = (x: RevItem) => (x.a === undefined ? "o" : x.a === QI.get(x.id)!.ok ? "c" : "w");
  const cnt = { bad: items.filter((x) => st(x) !== "c").length, ok: items.filter((x) => st(x) === "c").length, all: items.length };
  const shown = items.filter((x) => f === "all" || (f === "ok" ? st(x) === "c" : st(x) !== "c"));
  return (
    <Foglio title="Rivedi le domande">
      <div role="tablist" aria-label="Filtro" className="flex flex-wrap gap-2">
        {(
          [
            ["bad", "Sbagliate e in bianco"],
            ["ok", "Giuste"],
            ["all", "Tutte"],
          ] as [Filtro, string][]
        ).map(([k, l]) => (
          <Button key={k} small role="tab" aria-selected={f === k} variant={f === k ? "primary" : "secondary"} onClick={() => setF(k)}>
            {l} ({cnt[k]})
          </Button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="mb-0 mt-4 text-mut">Nessuna domanda in questo gruppo.</p>
      ) : (
        <ol className="m-0 mt-2 list-none p-0">
          {shown.map((x) => {
            const q = QI.get(x.id)!;
            const s0 = st(x);
            return (
              <li key={x.n} className="flex flex-col gap-2.5 border-t border-riga py-4 first:border-t-0">
                <p className="tnum m-0 flex flex-wrap gap-x-3 text-[13px] text-mut">
                  <span>
                    Domanda {x.n}, n. {q.id}
                  </span>
                  <span>{SUBJ[q.s].s}</span>
                  <span className={cx("font-semibold", s0 === "c" ? "text-ok" : s0 === "w" ? "text-ko" : "text-amb")}>
                    {s0 === "c" ? "giusta" : s0 === "w" ? "sbagliata" : "in bianco"}
                  </span>
                </p>
                <p className="m-0 font-read text-[17px] leading-[1.45]">{q.q}</p>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {[q.ok, ...q.w].map((o) => {
                    const ok = o === q.ok;
                    const mine = o === x.a;
                    const I = ok ? Check : mine ? X : Minus;
                    return (
                      <li
                        key={o}
                        className={cx(
                          "flex items-start gap-2 rounded-[6px] px-2.5 py-1.5 font-read text-[15px] leading-[1.45]",
                          ok ? "bg-ok-soft font-semibold text-ok" : mine ? "bg-ko-soft text-ko" : "text-mut",
                        )}
                      >
                        <I size={16} strokeWidth={2.25} className="mt-[3px] flex-none" aria-hidden="true" />
                        <span>
                          {o}
                          {mine && <span className="ml-1.5 font-sans text-[13px] font-semibold">(tua)</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {s0 !== "c" && <Gemelle id={q.id} />}
              </li>
            );
          })}
        </ol>
      )}
    </Foglio>
  );
}
